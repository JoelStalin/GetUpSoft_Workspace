#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path
from lxml import etree

NEW_ATTRS = ['invisible', 'required', 'readonly', 'column_invisible']

def get_files_recursive(path):
    """Obtiene recursivamente todos los archivos .xml en el directorio especificado."""
    return (str(p) for p in Path(path).glob('**/*.xml') if p.is_file())

root_dir = input('Enter root directory to check (empty for current directory) : ') or '.'
all_xml_files = get_files_recursive(root_dir)

def normalize_domain(domain):
    """
    Normaliza un dominio, asegurando que los operadores '&' se añadan donde sea necesario.
    :rtype: list[str|tuple]
    """
    if len(domain) == 1:
        return domain
    result = []
    expected = 1
    op_arity = {'!': 1, '&': 2, '|': 2}
    for token in domain:
        if expected == 0:
            result[0:0] = ['&']
            expected = 1
        if isinstance(token, (list, tuple)):
            expected -= 1
            token = tuple(token)
        else:
            expected += op_arity.get(token, 0) - 1
        result.append(token)
    return result

def stringify_leaf(leaf):
    """
    Convierte una hoja de dominio en una cadena.
    :param tuple leaf: Tupla que representa una condición del dominio.
    :rtype: str
    """
    operator = str(leaf[1])
    left_operand = leaf[0]
    right_operand = leaf[2]
    case_insensitive = False
    switcher = False

    if operator == '=?':
        if isinstance(right_operand, str):
            right_operand = f"'{right_operand}'"
        return f"({right_operand} in [None, False] or {left_operand} == {right_operand})"
    elif operator == '=':
        if right_operand in (False, []):
            return f"not {left_operand}"
        elif right_operand is True:
            return left_operand
        operator = '=='
    elif operator == '!=':
        if right_operand in (False, []):
            return left_operand
        elif right_operand is True:
            return f"not {left_operand}"
    elif 'like' in operator:
        case_insensitive = 'ilike' in operator
        if isinstance(right_operand, str) and re.search('[_%]', right_operand):
            raise Exception("Script doesn't support 'like' domains with wildcards")
        if operator in ['=like', '=ilike']:
            operator = '=='
        else:
            operator = 'not in' if 'not' in operator else 'in'
            switcher = True
    if isinstance(right_operand, str):
        right_operand = f"'{right_operand}'"
    if switcher:
        left_operand, right_operand = right_operand, left_operand
    return f"{left_operand}.lower() {operator} {right_operand}.lower()" if case_insensitive else f"{left_operand} {operator} {right_operand}"

def stringify_attr(stack):
    """
    Convierte un atributo en una cadena manejando operadores lógicos.
    :param bool|str|int|list stack: Valor del atributo.
    :rtype: str
    """
    if stack in (True, False, 'True', 'False', 1, 0, '1', '0'):
        return str(stack)
    last_parenthesis_index = max(index for index, item in enumerate(stack[::-1]) if item not in ('|', '!'))
    stack = normalize_domain(stack)[::-1]
    result = []
    for index, leaf_or_operator in enumerate(stack):
        if leaf_or_operator == '!':
            expr = result.pop()
            result.append(f'(not ({expr}))')
        elif leaf_or_operator in ['&', '|']:
            left = result.pop()
            try:
                right = result.pop()
            except IndexError:
                res = left + (' and' if leaf_or_operator == '&' else ' or')
                result.append(res)
                continue
            form = '(%s %s %s)' if index > last_parenthesis_index else '%s %s %s'
            result.append(form % (left, 'and' if leaf_or_operator == '&' else 'or', right))
        else:
            result.append(stringify_leaf(leaf_or_operator))
    return result[0]

def get_new_attrs(attrs):
    """
    Extrae y convierte atributos de una cadena attrs en un diccionario.
    :param str attrs: Cadena con los atributos en formato diccionario.
    :rtype: dict[bool|str|int]
    """
    new_attrs = {}
    escaped_operators = ['=', '!=', '>', '>=', '<', '<=', '=\?', '=like', 'like', 'not like', 'ilike', 'not ilike', '=ilike', 'in', 'not in', 'child_of', 'parent_of']
    attrs = re.sub("<", "<", attrs)
    attrs = re.sub(">", ">", attrs)
    attrs = re.sub(f"([\"'](?:{'|'.join(escaped_operators)})[\"']\s*,\s*)(?!False|True)([\w\.]+)(?=\s*[\]\)])", r"\1'__dynamic_variable__.\2'", attrs)
    attrs = re.sub(r"(%\([\w\.]+\)d)", r"'__dynamic_variable__.\1'", attrs)
    attrs = attrs.strip()
    if re.search("^{.*}$", attrs, re.DOTALL):
        attrs_dict = eval(attrs.strip())
        for attr, attr_value in attrs_dict.items():
            if attr not in NEW_ATTRS:
                continue
            stringified_attr = stringify_attr(attr_value)
            if isinstance(stringified_attr, str):
                stringified_attr = re.sub(r"'__dynamic_variable__\.([^']+)'", r"\1", stringified_attr)
            new_attrs[attr] = stringified_attr
    return new_attrs

autoreplace = input('Do you want to auto-replace attributes ? (y/n) (empty == no) (will not ask confirmation for each file) : ') or 'n'
nofilesfound = True
ok_files = []
nok_files = []

def get_parent_etree_node(root_node, target_node):
    """Encuentra el nodo padre y el índice de un nodo objetivo."""
    for parent_elem in root_node.iter():
        previous_child = False
        for i, child in enumerate(list(parent_elem)):
            if child == target_node:
                indent = previous_child.tail if previous_child else parent_elem.text
                return i, parent_elem, indent
            previous_child = child

def get_child_tag_at_index(parent_node, index):
    """Obtiene el hijo en un índice específico."""
    for i, child in enumerate(list(parent_node)):
        if i == index:
            return child

def get_sibling_attribute_tag_of_type(root_node, target_node, attribute_name):
    """Busca un tag hermano con un atributo específico."""
    _, xpath_node, _ = get_parent_etree_node(root_node, target_node)
    if node := xpath_node.xpath(f"./attribute[@name='{attribute_name}']"):
        return node[0]

def get_inherited_tag_type(root_node, target_node):
    """Determina el tipo de tag heredado."""
    _, parent_tag, _ = get_parent_etree_node(root_node, target_node)
    if expr := parent_tag.get('expr'):
        if matches := re.findall("^.*/(\w+)[^/]*?$", expr):
            return matches[0]
    return parent_tag.tag

def get_combined_invisible_condition(invisible_attribute, states_attribute):
    """Combina condiciones invisible y states."""
    invisible_attribute = invisible_attribute.strip()
    states_attribute = states_attribute.strip()
    if not states_attribute:
        return invisible_attribute
    states_list = re.split(r"\s*,\s*", states_attribute)
    states_to_add = f"state not in {states_list}"
    if invisible_attribute:
        if invisible_attribute.endswith(('or', 'and')):
            return f"{invisible_attribute} {states_to_add}"
        return f"{invisible_attribute} or {states_to_add}"
    return states_to_add

for xml_file in all_xml_files:
    try:
        with open(xml_file, 'rb') as f:
            contents = f.read().decode('utf-8')
            if not ('attrs' in contents or 'states' in contents or '<tree>' in contents):
                continue
            convert_line_separator_back_to_windows = '\r\n' in contents
            has_encoding_declaration = bool(re.search(r"\A.*<\?xml.*?encoding=.*?\?>\s*", contents, re.DOTALL))
            if has_encoding_declaration:
                contents = re.sub(r"\A.*<\?xml.*?encoding=.*?\?>\s*", "", contents, re.DOTALL)
            doc = etree.fromstring(contents)
            tags_with_attrs = doc.xpath("//*[@attrs]")
            attribute_tags_with_attrs = doc.xpath("//attribute[@name='attrs']")
            tags_with_states = doc.xpath("//*[@states]")
            attribute_tags_with_states = doc.xpath("//attribute[@name='states']")
            if not (tags_with_attrs or attribute_tags_with_attrs or tags_with_states or attribute_tags_with_states):
                continue
            print(f'\n##### Taking care of file -> {xml_file}\n')
            nofilesfound = False

            # Procesamiento de tags con attrs
            for tag in tags_with_attrs:
                attrs = tag.get('attrs', '')
                new_attrs = get_new_attrs(attrs)
                all_attributes = []
                for attr_name, attr_value in list(tag.attrib.items()):
                    if attr_name == 'attrs':
                        for new_attr, new_attr_value in new_attrs.items():
                            if new_attr in tag.attrib:
                                old_attr_value = tag.attrib.get(new_attr)
                                if old_attr_value in [True, 1, 'True', '1']:
                                    new_attr_value = f"True or ({new_attr_value})"
                                elif old_attr_value in [False, 0, 'False', '0']:
                                    new_attr_value = f"False or ({new_attr_value})"
                                else:
                                    new_attr_value = f"({old_attr_value}) or ({new_attr_value})"
                            all_attributes.append((new_attr, new_attr_value))
                    elif attr_name not in new_attrs:
                        all_attributes.append((attr_name, attr_value))
                tag.attrib.clear()
                tag.attrib.update(all_attributes)

            # Procesamiento de <attribute name="attrs">
            attribute_tags_with_attrs_after = []
            for attribute_tag in attribute_tags_with_attrs:
                tag_type = get_inherited_tag_type(doc, attribute_tag)
                tag_index, parent_tag, indent = get_parent_etree_node(doc, attribute_tag)
                tail = attribute_tag.tail or ''
                attrs = attribute_tag.text or ''
                new_attrs = get_new_attrs(attrs)
                attribute_tags_to_remove = []
                for new_attr, new_attr_value in new_attrs.items():
                    if separate_attr_tag := get_sibling_attribute_tag_of_type(doc, attribute_tag, new_attr):
                        attribute_tags_to_remove.append(separate_attr_tag)
                        old_attr_value = separate_attr_tag.text
                        if old_attr_value in [True, 1, 'True', '1']:
                            new_attr_value = f"True or ({new_attr_value})"
                        elif old_attr_value in [False, 0, 'False', '0']:
                            new_attr_value = f"False or ({new_attr_value})"
                        else:
                            new_attr_value = f"({old_attr_value}) or ({new_attr_value})"
                    new_tag = etree.Element('attribute', attrib={'name': new_attr})
                    new_tag.text = str(new_attr_value)
                    new_tag.tail = indent
                    parent_tag.insert(tag_index, new_tag)
                    if new_attr == 'invisible' and not get_sibling_attribute_tag_of_type(doc, new_tag, 'states'):
                        todo_tag = etree.Comment(
                            f"TODO: Result from 'attrs' -> 'invisible' conversion without also overriding 'states' attribute"
                            f"{indent + (' ' * 5)}Check if this {tag_type + ' ' if tag_type else ''}tag contained a states attribute in any of the parent views, in which case it should be combined into this 'invisible' attribute"
                        )
                        todo_tag.tail = indent
                        parent_tag.insert(tag_index, todo_tag)
                        attribute_tags_with_attrs_after.append(todo_tag)
                        tag_index += 1
                    attribute_tags_with_attrs_after.append(new_tag)
                    tag_index += 1
                new_tag.tail = tail
                parent_tag.remove(attribute_tag)
                for attr_tag in attribute_tags_to_remove:
                    tag_idx, parent, _ = get_parent_etree_node(doc, attr_tag)
                    if tag_idx > 0:
                        prev_tag = get_child_tag_at_index(parent, tag_idx - 1)
                        prev_tag.tail = attr_tag.tail
                    parent.remove(attr_tag)

            # Procesamiento de tags con states
            for state_tag in tags_with_states:
                states_attribute = state_tag.get('states', '')
                invisible_attribute = state_tag.get('invisible', '')
                tag_index, parent_tag, indent = get_parent_etree_node(doc, state_tag)
                todo_tag = etree.Comment(
                    f"TODO: Result from merging \"states='{states_attribute}'\" attribute with an 'invisible' attribute"
                    f"{indent + (' ' * 5)}Manually combine states condition into any 'invisible' overrides in inheriting views as well"
                )
                todo_tag.tail = indent
                parent_tag.insert(tag_index, todo_tag)
                new_invisible_attribute = get_combined_invisible_condition(invisible_attribute, states_attribute)
                all_attributes = [(attr_name, attr_value) for attr_name, attr_value in state_tag.attrib.items() if attr_name != 'states']
                if new_invisible_attribute:
                    all_attributes.append(('invisible', new_invisible_attribute))
                state_tag.attrib.clear()
                state_tag.attrib.update(all_attributes)

            # Procesamiento de <attribute name="states">
            for attribute_tag_states in attribute_tags_with_states:
                tag_index, parent_tag, indent = get_parent_etree_node(doc, attribute_tag_states)
                tail = attribute_tag_states.tail
                attribute_tag_invisible = get_sibling_attribute_tag_of_type(doc, attribute_tag_states, 'invisible')
                if attribute_tag_invisible is None:
                    attribute_tag_invisible = etree.Element('attribute', attrib={'name': 'invisible'})
                    attribute_tag_invisible.tail = tail
                    parent_tag.insert(tag_index, attribute_tag_invisible)
                invisible_attribute = attribute_tag_invisible.text or ''
                states_attribute = attribute_tag_states.text or ''
                invisible_condition = get_combined_invisible_condition(invisible_attribute, states_attribute)
                parent_tag.remove(attribute_tag_states)
                attribute_tag_invisible.text = invisible_condition

            # Reemplazar <tree> por <list>
            for tree_tag in doc.xpath("//tree"):
                # Crear una nueva etiqueta <list> con los mismos atributos
                list_tag = etree.Element("list", attrib=tree_tag.attrib)
                
                # Copiar el texto y la cola
                list_tag.text = tree_tag.text
                list_tag.tail = tree_tag.tail
                
                # Copiar todos los subelementos
                for child in tree_tag:
                    list_tag.append(child)
                
                # Reemplazar la etiqueta <tree> por <list> en el padre
                parent = tree_tag.getparent()
                parent.insert(parent.index(tree_tag), list_tag)
                parent.remove(tree_tag)

            if autoreplace.lower()[0] == 'y' or (input('Do you want to replace? (y/n) (empty == no) : ') or 'n').lower()[0] == 'y':
                with open(xml_file, 'wb') as rf:
                    xml_string = etree.tostring(doc, encoding='utf-8', xml_declaration=has_encoding_declaration)
                    if convert_line_separator_back_to_windows:
                        xml_string = xml_string.replace(b"\n", b"\r\n")
                    rf.write(xml_string)
                    ok_files.append(xml_file)
    except Exception as e:
        nok_files.append((xml_file, e))
        raise e

print('\n################################################')
print('################## Run Debug ##################')
print('################################################')
if nofilesfound:
    print(f'No XML Files with "attrs", "states" or "<tree>" found in dir "{root_dir}"')
print('Succeeded on files:', '\n'.join(ok_files) or 'No files')
print('\nFailed on files:', '\n'.join(f"{f[0]}\nReason: {f[1]}" for f in nok_files) or 'No files')