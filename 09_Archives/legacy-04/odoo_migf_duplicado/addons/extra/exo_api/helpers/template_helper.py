# Aunque no se usen los imports no se deben borrar, ya que se usa en tiempo de complicacion
import os
import json
from odoo.tools import file_open
from datetime import timedelta, timedelta, datetime

from odoo.exceptions import ValidationError
from .json_helper import get_value_from_json_property, procesar_arreglo_recursivo
import logging
_logger = logging.getLogger(__name__)


def get_data_to_export(json_obj, headers = [], template = None):
    headers = sorted(headers, key=lambda x: x['order'])
    list_obj = json_obj if isinstance(json_obj, list) else [json_obj]
    final_result = []

    for obj in list_obj:
        data_to_export = {}
        for prop in filter(lambda x: x['type'] == 'normal', headers):
            keys = prop['key'].split('.')
            data = get_value_from_json_property(keys, obj, 1000, obj.get('loadNumber', ''), '', str(keys))
            if isinstance(data, list):
                data = procesar_arreglo_recursivo(data)
            data_to_export[prop['key']] = {
                "value": data,
                "show": prop['show'],
                "name": prop['name'],
                "duplicate_with_sub_list": prop['duplicate_with_sub_list'],
                "order": prop['order']
            }
        for comp_prop in filter(lambda x: x['type'] == 'compute', headers):
            try:
                key_value = eval(comp_prop['value']) if comp_prop['calculation_mode'] == 'precombination' else f"eval(\"{comp_prop['value']}\")"
                data_to_export[comp_prop['key']] = {
                    "value": key_value,
                    "show": comp_prop['show'],
                    "name": comp_prop['name'],
                    "duplicate_with_sub_list": comp_prop['duplicate_with_sub_list'],
                    "order": comp_prop['order']
                }
            except Exception as e:
                raise ValidationError(f"Error evaluando la propiedad computada ({comp_prop['key']}) con el valor: ({comp_prop['value']}). Para la plantilla ({template['name']} / {template['id']}) Error: {e}")
        final_result.append(data_to_export.copy())
    return final_result

def get_data_from_json(header=[], path='exo_api/static/load_template.json'):
    with file_open(path, "rb") as f:
        json_obj = json.load(f)
        result = get_data_to_export(json_obj, header, {'id': 1, 'name': 'Prueba'})
        
        return result
 

def generate_combinations(obj):
    try:
        _logger.info("___________ init loading combinations")
        _logger.info(obj)
        keys = sorted(obj.keys(), key=lambda k: obj[k]['order'])
        values = [obj[key]['value'] if isinstance(obj[key]['value'], list) else [obj[key]['value']] for key in keys]
        max_length = max(len(value) for value in values)
        for i in range(len(keys)):
            current_value = values[i][-1] if values[i] and len(values[i]) > 0 else ''
            if obj[keys[i]]['duplicate_with_sub_list']:
                values[i] += [current_value] * (max_length - len(values[i]))
            else:
                values[i] += [None] * (max_length - len(values[i]))
        result = [[values[i][j] for i in range(len(keys))] for j in range(max_length)]
        result = pos_combination_eval(result, obj, keys)
        result = get_only_show(result, obj, keys)
    except Exception as ex: 
        _logger.info(obj)
        _logger.info(ex)
        raise ValidationError(f"Error {str(ex)}")
    return result

def get_only_show(result, obj, keys):
    for idx, key in enumerate(keys):
        for sub_array in result:
            if not obj[key]['show']:
                sub_array[idx] = 'N/A'
    new_array = []
    for s_a in result:
        n_sa = [v for v in s_a if v != 'N/A']
        new_array.append(n_sa)
    return new_array

def pos_combination_eval(result, obj, keys):
    for data_to_export in result:
        for i in range(len(data_to_export)):
            if isinstance(data_to_export[i], str) and 'eval' in data_to_export[i]:
                for k, key in enumerate(keys):
                    if key in data_to_export[i]:
                        data_to_export[i] = data_to_export[i].replace(f'"{key}"', str(k))
                _logger.info("__________ evaluando")
                _logger.info(key)
                _logger.info(data_to_export[i])
                data_to_export[i] = eval(data_to_export[i])
                _logger.info("EValuadoooo ")
    return result

def add_subtotals(result):
    if result:
        total_row = []
        for row_index in range(len(result[0])):
            total = 0
            for col_index in range(len(result)):
                value = result[col_index][row_index]
                if isinstance(value, (int, float)):
                    total += value
            total_row.append('' if total == 0 else total)
        result.append(total_row)
