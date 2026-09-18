import logging
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)

def get_value_from_json_property(property_subdived, json_load, depth=1000, load=None, order=None, prop=None):
    order = json_load.get('order_num') if isinstance(json_load, dict) and json_load.get('order_num', False) else order
    if depth <= 0:
        raise ValidationError("Validation Error: ha excedido la cantidad de ciclos permitido. Comuniquese con su administrador")
    
    if isinstance(json_load, list):
        return [
            get_value_from_json_property(property_subdived, current_json, depth - 1, load, order, prop)
            for current_json in json_load
        ]
    
    elif isinstance(json_load, dict):
        first_property = property_subdived[0]
        if first_property not in json_load:
            raise ValidationError(
                f"No se pudo encontrar la propiedad {load} / {order} / {prop} / {str(property_subdived)} en la data proporcionada"
            )
        if len(property_subdived) == 1:
            return json_load[first_property]
        else:
            return get_value_from_json_property(
                property_subdived[1:], json_load[first_property], depth - 1, load, order, prop
            )
    else:
        return json_load

def procesar_arreglo_recursivo(arr):
    resultado = []
    for elemento in arr:
        if isinstance(elemento, list):
            resultado.append(concatenar_subarreglo(elemento))
        else:
            resultado.append(elemento)
    return resultado

def concatenar_subarreglo(subarr):
    subresultado = ''
    for subelemento in subarr:
        if isinstance(subelemento, list):
            subresultado += concatenar_subarreglo(subelemento) + ' - '
        else:
            subresultado += str(subelemento) + ' - '
    return subresultado.rstrip(' - ')
