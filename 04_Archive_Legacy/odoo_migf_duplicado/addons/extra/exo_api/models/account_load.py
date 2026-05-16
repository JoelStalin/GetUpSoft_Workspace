from ..helpers.load_helper import get_invoice_block, get_orders_in_ids
from ..helpers.time_helper import get_datetime_in_current_zone, get_month_start_and_end_dates_from_current
from ..helpers.json_helper import get_value_from_json_property
from ..helpers.request_helper import get_cookie

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta
from odoo.http import request
import math
import numbers
import logging
import requests
import json
import os
import threading
import collections.abc
from datetime import date, timedelta, datetime, timedelta
import time
import uuid
import time, random, psycopg2
import logging
_logger = logging.getLogger(__name__)

import time
import random
import psycopg2
import logging

_logger = logging.getLogger(__name__)

import time
import random
import psycopg2
import logging

_logger = logging.getLogger(__name__)

def retry_serialization(max_attempts=6, base_sleep=0.1, max_sleep=5.0):
    """
    Reintenta operaciones de BD en caso de errores de concurrencia:
    - SerializationFailure  (concurrent update)
    - DeadlockDetected      (interbloqueo)

    Estrategia:
    - Rollback seguro de la transacción
    - Backoff exponencial con jitter aleatorio
    - Límite de sleep máximo para no colgar procesos
    - Re-lanzar excepción si falla tras N intentos
    """

    def deco(fn):
        def wrapper(*args, **kwargs):
            self_obj = args[0]
            env = getattr(self_obj, "env", None)
            if env is None:
                raise RuntimeError("retry_serialization: no 'env' found on object.")

            for attempt in range(1, max_attempts + 1):
                try:
                    # ✅ Ejecuta la función
                    return fn(*args, **kwargs)

                except (psycopg2.errors.SerializationFailure,
                        psycopg2.errors.DeadlockDetected) as e:

                    # 🔄 rollback para evitar dejar la transacción en estado inconsistente
                    try:
                        env.cr.rollback()
                    except Exception as rollback_err:
                        _logger.error("Error al hacer rollback: %s", rollback_err)

                    # ⚠️ Log detallado
                    _logger.warning(
                        "[RETRY] %s falló por %s en intento %d/%d",
                        fn.__name__, e.__class__.__name__, attempt, max_attempts
                    )

                    # ⏱ Backoff exponencial con jitter, limitado a max_sleep
                    sleep_time = min(base_sleep * (2 ** (attempt - 1)) + random.uniform(0, base_sleep),
                                     max_sleep)
                    time.sleep(sleep_time)

                except Exception as ex:
                    # 🚨 Otras excepciones → no reintentar
                    raise ex

            # ❌ si se agotan los intentos
            raise RuntimeError(
                f"[ABORTED] {fn.__name__} falló tras {max_attempts} intentos por concurrencia."
            )

        return wrapper
    return deco

# ======================================================
# [CHANGE] Función de advisory lock
# ======================================================
def _advisory_lock(env, key):
    env.cr.execute("SELECT pg_advisory_xact_lock(hashtextextended(%s, 0))", [key])

class LoadCompute(models.TransientModel):
    _name = 'account.load'
    _description = 'Load'

    search_load_id = fields.Char("Id de la Carga a Verificar")

    start_date = fields.Datetime(
        string='Fecha Inicio',
        default=lambda self: (fields.Datetime.now() - timedelta(15)).replace(hour=23, minute=59, second=0, microsecond=0),
        required=True
    )
    end_date = fields.Datetime(
        string='Fecha Fin',
        default=lambda self: fields.Datetime.now().replace(hour=23, minute=59, second=0, microsecond=0),
        required=True
    )
    qty_load_to_take = fields.Integer(string='Cantidad de Cargas a obtener por request', default=200)
    has_error_continue_others = fields.Boolean(string="Si hay un error continuar con las demas cargas?", default=False)

    account_load_client_id = fields.Many2one(
        'res.partner',
        'Contacto por el cual se filtrarán las cargas',
        help="Define los contactos que se visualizaran en las facturas.",
        required=True
    )
    client_analytic_accounts = fields.Many2many(
        comodel_name='account.analytic.account',
        string='Cuentas Analíticas',
        required=False,
        domain="[('partner_id', '=', account_load_client_id), ('is_to_invoice', '=', True)]"
    )

    group_by_payment_term = fields.Boolean(related='account_load_client_id.group_by_payment_term', readonly=True)
    group_by_warehouse = fields.Boolean(related='account_load_client_id.group_by_warehouse', readonly=True)
    rounded_money = fields.Boolean(related='account_load_client_id.rounded_money', string="Permite que los precios se redondeen a entero", readonly=True)

    exo_load_start_date = fields.Datetime(string="Fecha inicial para cargar las facturas de EXO", compute="_get_exo_load_start_date")
    exo_load_statuses = fields.Char(string="Estatuses a filtrar en la carga", compute="_get_exo_load_start_date")
    odoo_load_benefits_and_discounts_to_create = fields.Char(string="Beneficios y Descuentos a crear en esta carga: ", compute="get_benefits_and_discounts_to_create")
    search_by_warehouse = fields.Boolean('Permite la busqueda por warehouse a este cliente', related='account_load_client_id.search_by_warehouse', readonly=True)

    allowed_order_status = fields.Char("Estados de la orden", default="Delivered")
    process_uid = fields.Char(string='UID de Proceso', index=True, help='Identificador único de proceso de sincronización')
    
    # ======================================================
    # Helpers de Requests
    # ======================================================
    def _http_get(self, url, headers):
        last_exc = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
                return resp
            except Exception as e:
                last_exc = e
                _logger.warning(f"[GET] intento {attempt}/{MAX_RETRIES} fallido: {e}")
                time.sleep(RETRY_BACKOFF_SEC * attempt)
        raise ValidationError(f"No fue posible comunicarse con EXO. Detalle: {last_exc}")

    def _http_post(self, url, headers, data):
        last_exc = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = requests.post(url, data=json.dumps(data), headers=headers, timeout=REQUEST_TIMEOUT)
                return resp
            except Exception as e:
                last_exc = e
                _logger.warning(f"[POST] intento {attempt}/{MAX_RETRIES} fallido: {e}")
                time.sleep(RETRY_BACKOFF_SEC * attempt)
        raise ValidationError(f"No fue posible enviar datos a EXO. Detalle: {last_exc}")

    def _safe_get_host_exo(self):
        host_exo = os.getenv('HOST_EXO')
        if not host_exo:
            raise ValidationError("No se ha configurado la variable de entorno HOST_EXO.")
        return host_exo

    def get_load_shipper_name(self, data):
        if isinstance(data.get('shipper'), str):
            return data['shipper']
        if isinstance(data.get('shipper'), list):
            return data['shipper'][0]['name'] if data['shipper'] else ''
        return ''

    def get_info_load_transporter(self):
        cookie = get_cookie()
        load_datas = self.get_loads(0, 100, None, None, None, None, None, [self.search_load_id], cookie)
        records = load_datas.get('loads', {}).get('Result', {}).get('data', [])
        exo_message = ''
        for data in records:
            if self.account_load_client_id:
                exo_message += f"\n -> loadNumber {data.get('loadNumber')}"
                exo_message += f"\n -> Shipper {self.get_load_shipper_name(data)}"
                exo_message += f"\n -> Warehouse de la carga {data.get('warehouse', {}).get('name')}."
                exists_load = self.env['account.line.load'].sudo().search([('move_type', '=', 'bill'), '|', ('original_load_id', '=', self.search_load_id), ('load_id', '=', self.search_load_id)])
                if exists_load:
                    exo_message += f"\n -> La carga existe en odoo en el borrador o factura {exists_load.account_move_id.id} / {exists_load.account_move_id.name}. \n [HAY QUE REVISAR QUE LA CARGA ESTA EN OTRO BORRADOR. EN CASO DE NECESITARLA EN UN NUEVO BORRADOR, BORRAR EL BORRADOR PARA QUE EL SISTEMA RECREE NUEVAMENTE EL BORRADOR.]"
                else:
                    exo_message += f"\n -> La carga {self.search_load_id} no existe en Odoo. \n\n [HAY QUE REVISAR LOS PUNTOS DE BAJO PARA IDENTIFICAR PORQUE NO TRAE LAS CARGAS]\n"

                exo_message += f"\n\n PUNTOS REVISADOS: \n\n"
                if self.exo_load_start_date and self.exo_load_start_date.year >= 2025:
                    exo_message += f"\n -> Año de la fecha iniciar debe ser 2024. y Actualmente es {self.exo_load_start_date.year}. \n\n [SOLUCION: COLOCAR EN EL CONTACTO EN EL CAMPO (FECHA INICIAL PARA CARGAR LAS FACTURAS DE EXO) UNA FECHA DE NOVIEMBRE TENIENDO EN CUENTA EL CORTE EN EL CUAL DESEAS QUE LA FACTURA INICE]"

                first_order = data["orders"][0] if data.get("orders") else {}
                shipper_partner = self.get_partner_by_exo_order(first_order, self.env)
                if not shipper_partner:
                    rnc = first_order.get('customer', {}).get('rnc', first_order.get('customer', {}).get('RNC_no'))
                    exo_message += f"\n -> El Shipper. ****({self.get_load_shipper_name(data)})*** con rnc {rnc} no fue encontrado en ODOO \n\n [SOLUCION: AGREGAR ESTE SHIPPER A LA LISTA DE SHIPPERS EN LA COMPANIA EXO BUSINESS CONSULTING SRL]"
                
                if shipper_partner:
                    analytics_accounts = self.env['account.analytic.account'].sudo().search([('company_id', '=', self.env.company.id), ('is_to_invoice', '=', True), ('partner_id','=', shipper_partner.id)])
                    analytics_accounts = analytics_accounts.filtered(lambda acc: any(str(data.get('warehouse', {}).get('name')).strip() == str(wh.name).strip() for wh in acc.warehouses))
                    if not analytics_accounts:
                        exo_message += f"\n -> No existen cuentas analiticas para facturar al cliente ({shipper_partner.name}). Con el warehouse: {data.get('warehouse', {}).get('name')} \n\n [SOLUCION: AGREGAR UNA CUENTA ANALITICA EN CONFIGURACION => CUENTAS ANALITICAS PARA EL SHIPPER ({shipper_partner.name})"
                
                if not self.account_load_client_id.company_id:
                    exo_message += f"\n -> La Compañia del contacto no existe. \n\n [SOLUCION: COLOCAR AL CONTACTO {self.account_load_client_id.name} LA COMPANIA EXO BUSINESS CONSULTING SRL]"

                if self.account_load_client_id.company_id.vat != '131669719':
                    exo_message += f"\n -> La Compañia del contacto {self.account_load_client_id.company_id.name} de la carga {data.get('loadNumber')} no es la compañia correcta.  \n\n [SOLUCION: COLOCAR AL CONTACTO {self.account_load_client_id.name} LA COMPANIA EXO BUSINESS CONSULTING SRL]"
                
                if self.account_load_client_id.vat != data.get('vehicleInfo', {}).get('transporter_id', {}).get('rnc'):
                    exo_message += f"\n -> RNC DIFERENTES: RNC ***{data.get('vehicleInfo', {}).get('transporter_id', {}).get('name')} / ({data.get('vehicleInfo', {}).get('transporter_id', {}).get('rnc')})*** de la carga {data.get('loadNumber')} es diferente al  RNC DEL CONTACTO BUSCADO: {self.account_load_client_id.name} / ***({self.account_load_client_id.vat})***.  \n\n [SOLUCION: CAMBIAR EL RNC AL TRANSPORTISTA EN ODOO ***({self.account_load_client_id.name})*** por el RNC ***({data.get('vehicleInfo', {}).get('transporter_id', {}).get('rnc')})**** que tiene la carga, si es que deseas que este transportistas tenga esta carga]"
                
                if data.get('status') not in [load_status.name for load_status in self.account_load_client_id.load_statuses]:
                    exo_message += f"\n -> Estado de la carga INCORRECTO. Estatus ***({data.get('status')})**** de la carga. \t ESTADOS ESPERADOS, BUSCADOS EN EL CONTACTO: *****({self.exo_load_statuses})****.  \n\n [SOLUCION #1: Solicitar al equipo encargado el colocarte la carga en unos de los estados esperados.   \n SOLUCION #2: ESTABLECER EN LA LISTA DE CARGAS PERMITIDAS PARA ESTE TRANSPORTISTA EL ESTADO {data.get('status')}]"
                
        raise ValidationError(exo_message)

    @api.depends('account_load_client_id')
    def get_benefits_and_discounts_to_create(self):
        for wizard in self:
            wizard.odoo_load_benefits_and_discounts_to_create = ''
            partner = wizard.account_load_client_id
            if partner:
                pending_recurrent = self.env['partner.benefit.pending'].search([
                    ('partner_id', '=', partner.id),
                    ('state', '=', 'pending')
                ])
                pending_unique = partner.get_unique_benefits_line_to_create_to_this_months()
                recurrent_strings = [
                    f"{rec.product_tmpl_id.name} (Generado: {rec.generation_date.strftime('%d/%m/%Y')})"
                    for rec in pending_recurrent
                ]
                unique_strings = [
                    f'{rec.product_tmpl_id.name} / {rec.name} ({"-" if rec.transaction_type == "debit" else ""} RD${rec.amount})'
                    for rec in pending_unique
                ]
                all_pending_strings = recurrent_strings + unique_strings
                if all_pending_strings:
                    wizard.odoo_load_benefits_and_discounts_to_create = ', '.join(all_pending_strings)
                else:
                    wizard.odoo_load_benefits_and_discounts_to_create = 'No hay beneficios pendientes de aplicar.'

    @api.depends('account_load_client_id.exo_load_start_date', 'account_load_client_id.load_statuses')
    def _get_exo_load_start_date(self):
        for load_client in self:
            load_client.exo_load_start_date = load_client.account_load_client_id.exo_load_start_date
            load_client.exo_load_statuses = ", ".join([load_status.name for load_status in load_client.account_load_client_id.load_statuses])

    def transform_rnc(self, rnc):
        if not rnc:
            return ""
        return rnc.replace("-", "").replace('\t', '').replace(' ', '')

    def get_partner_by_exo_order(self, order, current_env):
        rnc = order.get('customer', {}).get('rnc', order.get('customer', {}).get('RNC_no'))
        if not rnc:
            return None
        documentNumber = self.transform_rnc(rnc)
        partner = current_env['res.partner'].sudo().with_company(current_env.company).search([('company_id', '=', current_env.company.id), ('vat', '=', documentNumber)])
        if not partner:
            return None
        return partner[0]

    def get_transporter(self, transporter, current_env):
        transporter_partner = current_env['res.partner.object'].sudo().search([('name', '=', transporter['_id'])])
        if not transporter_partner:
            return None
        return transporter_partner[0].partner_id

    def get_product_from_name(self, detail, loadNumber, partner, current_env):
        if detail.get("serviceType") and detail.get('logisticProductTypes'):
            serviceType = detail['serviceType'] + ' ['+ detail['logisticProductTypes'].upper()  +']'
            product = current_env['product.template'].sudo().with_company(current_env.company).with_context(lang="es_DO", tz='America/Santo_Domingo').search([('name', '=', serviceType)])
            if not product:
                raise ValidationError("El Producto o Product Account  (" + serviceType + ") no fue encontrado en odoo")
            if len(product) > 1:
                product_ids = ",".join([str(prod.id) for prod in product])
                raise ValidationError("Existe más de un producto logístico con el nombre (" + serviceType + "). Id de productos: " + str(product_ids))
            return product
        else:
            partner_name = partner.name if partner else "N/A"
            raise ValidationError("El producto no fue enviado por EXO para la carga (" + str(loadNumber) + ") y el shipper (" + str(partner_name) + ").")

    def get_transporter_analytics_account(self, partner, warehouse, current_env):
        partner_analytics_accounts = self.client_analytic_accounts if self.client_analytic_accounts else current_env['account.analytic.account'].sudo().with_company(current_env.company).search([('company_id', '=', current_env.company.id),  ('is_to_invoice', '=', True), ('partner_id','=', partner.id)])
        analytics_accounts = partner_analytics_accounts.filtered(lambda acc: any(str(warehouse['name']).strip() == str(wh.name).strip() for wh in acc.warehouses))
        if analytics_accounts:
            return analytics_accounts[0]
        if partner_analytics_accounts:
            for account in partner_analytics_accounts:
                account.sudo().write({
                    'warehouses': [(0, 0, {'name': str(warehouse['name'])})]
                })
            return partner_analytics_accounts[0]
        else:
            return current_env['account.analytic.account'].sudo().create({
                'name': partner.name,
                'company_id': partner.company_id.id,
                'partner_id': partner.id,
                'is_to_invoice': True,
                'warehouses': [(0, 0, {'name': str(warehouse['name'])})]
            })

    def get_partner_analytics_account(self, partner, warehouse, current_env):
        analytics_accounts = self.client_analytic_accounts if self.client_analytic_accounts else current_env['account.analytic.account'].sudo().with_company(current_env.company).search([('company_id', '=', current_env.company.id),  ('is_to_invoice', '=', True), ('partner_id','=', partner.id)])
        if partner.search_by_warehouse:
            analytics_accounts = analytics_accounts.filtered(lambda acc: any(str(warehouse['name']).strip() == str(wh.name).strip() for wh in acc.warehouses))
        if not analytics_accounts:
            if partner.search_by_warehouse:
                return None
            else:
                raise ValidationError("No existen cuentas analiticas para facturar al cliente (" + str(partner.name) + "). Con el warehouse: " + str(warehouse['name']))
        if len(analytics_accounts) > 1:
            if partner.search_by_warehouse:
                raise ValidationError("Existe más de una cuenta analitica para facturas automaticas para el cliente (" + str(partner.name) + "). Con el warehouse: " + str(warehouse['name']) )
            else:
                raise ValidationError(f"Hay más de una cuenta análitica para el cliente ({partner.name}) en la compañía: ({str(current_env.company)}) y no se puede determinar a cual cuenta colocar la carga. Es necesario que filtre por warehouse o que deje solo una cuenta analitica: {'; '.join([an.name + ' / ' + str(an.id) for an in analytics_accounts])}")
        return analytics_accounts[0]

    def get_analytics_tags(self, detail, current_env):
        if detail.get('businessUnitTagTypes'):
            businessUnitTagTypes = detail['businessUnitTagTypes']
            analitic_tags = current_env['account.analytic.tag'].sudo().search([('active', '=', True), ('name','=', businessUnitTagTypes)])
            if not analitic_tags:
                raise ValidationError("No se encontró la etiqueta analitica ("+businessUnitTagTypes+").")
            if len(analitic_tags) > 1:
                raise ValidationError("Existe más de una etiqueta analitica con el nombre (" + businessUnitTagTypes + ").")
            return analitic_tags[0]
        else:
            raise ValidationError("La etiqueta analitica no fue proporcionada por EXO")

    def get_names_from_exo_products(self, products):
        names = []
        for prod in products:
            if prod['name'] not in names:
                names.append(prod['name'])
        return ', '.join(names)

    def exo_orders_has_exceptions(self, orders):
        for order in orders:
            for perLoad in order['perLoadState']:
                if len(perLoad['exceptions']) > 0:
                    return 'Con Excepciones'
        return "Sin Excepciones"

    def get_order_num_from_exo_orders(self, orders):
        order_nums = []
        for order in orders:
            if order.get('order_num') and order['order_num'] not in order_nums:
                order_nums.append(order['order_num'])
        return ', '.join(order_nums)

    def get_key_from_configuration(self, load, field, partner_product, partner_analytic_tag_ids, partner_analytics_accounts, partner):
        load_group_key = field['load_group_key']
        first_order = load["orders"][0]
        response = ""
        products = first_order.get('products', [])
        if load_group_key == 'target_client':
            response = first_order.get('client_name')
        elif load_group_key == 'order_client_id':
            response = first_order.get('client_id')
        elif load_group_key == 'partner_id':
            response = partner.name
        elif load_group_key == 'partner_product':
            response = partner_product.name
        elif load_group_key == 'partner_analytic_tag_ids':
            response = partner_analytic_tag_ids.name
        elif load_group_key == 'partner_analytics_accounts':
            response = partner_analytics_accounts.name
        elif load_group_key == 'loadNumber':
            response = load.get('loadNumber')
        elif load_group_key == 'order_comment':
            response = load.get('orderComments') if load.get('orderComments') else ''
        elif load_group_key == 'zone':
            response = first_order.get('zone', {}).get('name')
        elif load_group_key == 'order_num':
            response = self.get_order_num_from_exo_orders(load.get("orders", []))
        elif load_group_key == 'vehicle_plate':
            response = load.get('vehicleNumber')
        elif load_group_key == 'invoicing_date':
            response = str(first_order.get('invoicing_date'))
        elif load_group_key == 'warehouse':
            response = load.get('warehouse', {}).get('name') if load.get('warehouse') else ''
        elif load_group_key == 'exceptions':
            response = self.exo_orders_has_exceptions(load.get('orders', []))
        elif load_group_key == 'products_name':
            response = self.get_names_from_exo_products(products)
        elif load_group_key == 'service_day':
            raise ValidationError("Aun no se tiene configurado el (Dia de Servicio) como campo valido")
        elif load_group_key == 'address':
            response = load.get('shipperAddress') if load.get('shipperAddress') else ''
        elif load_group_key == 'vehicle_type':
            response = load.get('vehicleInfo', {}).get('type')
            if response and partner.transform_vehicle_type:
                if response.strip().lower() == '35T 75M3'.strip().lower():
                    response = "CABEZOTE"
                else:
                    response = "RÍGIDO"
        elif load_group_key == 'invoice_comment':
            raise ValidationError("Aun no se tiene configurado el (Comentario de la Factura) como campo valido")
        else:
            raise ValidationError(f"Opción ({load_group_key}) de el campo de configuración no valido")
        return response

    def get_load_group_key(self, load, partner, partner_product, partner_analytic_tag_ids, partner_analytics_accounts):
        load_key = "Servicio de Transporte: "
        for configuration in partner.exo_load_configurations:
            for field in configuration.fields:
                new_key = self.get_key_from_configuration(load, field, partner_product, partner_analytic_tag_ids, partner_analytics_accounts, partner)
                new_key = new_key if new_key else ''
                load_key += new_key if load_key == "Servicio de Transporte: " else " - " + new_key
        load_key = load_key if load_key != "Servicio de Transporte: " else load.get('loadNumber', '')
        return load_key

    def has_drives(self, drives, orders):
        for drive in drives:
            for order in orders:
                if order.get('order_num') and drive and order['order_num'].strip() == drive.strip():
                    return True
        return False

    def execute_load_provider(self):
        return self.execute_load(None, None, False, True)

    def is_valid_drives_by_partner(self, orders, current_env):
        drives_conduce = current_env['drives.client'].sudo().search([('partner_id', '=', self.account_load_client_id.id)])
        drives = [drive.name for drive_conduce in drives_conduce for drive in drive_conduce.drives] if drives_conduce else []
        if drives and not self.has_drives(drives, orders):
            return False
        return True
    @retry_serialization()  # [CHANGE] protege de fallos de concurrencia
    def execute_load(self, cookie=None, number_hours=None, create_partner=True, create_trasporter=False, trigger_env=None, loadIds=None, is_exo_app=False, group_code=False):
        # [CHANGE] Lock a nivel de partner y fechas
        lock_key = f"account.load:{self.account_load_client_id.id}:{self.start_date}:{self.end_date}"
        _advisory_lock(self.env, lock_key)
        _logger.info(f"[LOCK] Ejecutando cargas para {self.account_load_client_id.name} con lock {lock_key}")
        cookie = get_cookie(cookie)
        current_env = trigger_env if trigger_env else request.env
        take = self.qty_load_to_take or 200
        skip = take * -1
        final_invoices = []
        total_createds = 0
        try:
            if not self.account_load_client_id.vat:
                raise ValidationError(f"El contacto ({self.account_load_client_id.name}) no tiene establecido un RNC. Favor establecerle uno nuevo.")
            odoo_partner = None if create_trasporter else self.account_load_client_id
            odoo_transporter = self.account_load_client_id if create_trasporter else None
            drives = []
            if not is_exo_app:
                drives_conduce = current_env['drives.client'].sudo().search([('partner_id', '=', self.account_load_client_id.id)])
                for drive_conduce in drives_conduce:
                    for drive in drive_conduce.drives:
                        drives.append(drive.name)
            breakLoop = False
            while True:
                skip += take
                if breakLoop:
                    break
                current_env['account.load.error'].sudo().with_company(current_env.company).create({
                    'name': f"Procesando datos> No. de Proceso ({skip})",
                    'account_load_client_id': self.account_load_client_id.id,
                    'partner_type': 'Proveedor' if create_trasporter else 'Shipper',
                    'start_date': self.start_date,
                    'end_date': self.end_date,
                    'message_error': "NO ES UN ERROR",
                    'current_date': datetime.now(),
                    'state': 'draft'
                })
                current_env.cr.commit()
                data = self.get_loads(skip, take, number_hours, odoo_partner, odoo_transporter, self.account_load_client_id.load_statuses, drives, loadIds, cookie)
                if not data.get('loads', {}).get('Success') or not data.get('loads', {}).get('Result', {}).get('data'):
                    break
                if len(data['loads']['Result']['data']) < take:
                    breakLoop = True
                try:
                    results = self.process_data(create_partner, create_trasporter, current_env, data, is_exo_app, group_code, cookie)
                    total_createds += results['created_total_records']
                    current_env.cr.commit()
                    distinct_invoices = list(set(results['invoices']))
                    final_invoices.extend(distinct_invoices)
                except Exception as ex:
                    _logger.exception("Error processing data chunk.")
                    current_env.cr.rollback()
                    current_env['account.load.error'].sudo().with_company(current_env.company).create({
                        'name': "Error intentando ejecutar las cargas",
                        'account_load_client_id': self.account_load_client_id.id,
                        'partner_type': 'Proveedor' if create_trasporter else 'Shipper',
                        'start_date': self.start_date,
                        'end_date': self.end_date,
                        'message_error': str(ex),
                        'current_date': datetime.now(),
                        'state': 'draft'
                    })
                    current_env.cr.commit()
                    if not self.has_error_continue_others:
                        raise ex
            if total_createds == 0:
                message_error = "Es posible que se haya creado los borradores con las cargas que no tienen errores. \n" if self.has_error_continue_others else ""
                raise ValidationError(f"No se encontraron registros para crear las facturas. \n{message_error}")
        finally:
            current_env['account.load.error'].sudo().with_company(current_env.company).create({
                'name': f"Fin del Procesamiento de datos. Ultimmo No. de Proceso ({skip})",
                'account_load_client_id': self.account_load_client_id.id,
                'partner_type': 'Proveedor' if create_trasporter else 'Shipper',
                'start_date': self.start_date,
                'end_date': self.end_date,
                'message_error': "NO ES UN ERROR",
                'current_date': datetime.now(),
                'state': 'draft'
            })
            current_env.cr.commit()
            final_invoices = list(set(final_invoices))
            if final_invoices:
                current_env['account.move'].sudo().insurance_2_percent_recompute([f_inv.id for f_inv in final_invoices], current_env)
        return {'type': 'ir.actions.client', 'tag': 'reload'} if not trigger_env else final_invoices
    @retry_serialization()  # [CHANGE] reintentos en creación de facturas
    def process_data(self, create_partner=True, create_trasporter=False, current_env=None, data=None, is_exo_app=False, group_code=False, cookie=''):
        process_code_uuid = str(uuid.uuid4())
        partner_data_to_insert = []
        transporter_data_to_insert = []
        load_id_to_change_status = []
        available_rncs = [self.transform_rnc(self.account_load_client_id.vat)]
        if data.get('loads', {}).get('Success'):
            for current_exo_load in data['loads']['Result']['data']:
                if len(current_exo_load.get('orders', [])) > 0:
                    first_order = current_exo_load["orders"][0]
                    partner_rnc = self.transform_rnc(first_order.get('customer', {}).get('rnc', first_order.get('customer', {}).get('RNC_no')))
                    if not current_exo_load.get('vehicleInfo', {}).get('transporter_id'):
                        continue
                    if not create_trasporter:
                        if available_rncs and partner_rnc not in available_rncs:
                            continue
                    partner = self.get_partner_by_exo_order(first_order, current_env)
                    if not partner:
                        raise ValidationError("No se encontró el shipper (" + first_order.get('customer', {}).get('name') + " (" + partner_rnc + ")) para la carga " + str(current_exo_load.get('loadNumber')) + ". Si el shipper no existe favor crearlo, en caso de que exista, revisar si el RNC Es el mismo en odoo como en EXO. Y revisar que en odoo el shipper tenga la compañia definida como EXO")
                    if not is_exo_app:
                        if not self.is_valid_drives_by_partner(current_exo_load['orders'], current_env):
                            continue
                    transporter_partner = None
                    if create_trasporter:
                        transporter_partner = self.get_transporter(current_exo_load['vehicleInfo']['transporter_id'], current_env)
                        if not transporter_partner:
                            raise ValidationError("No se encontró el transportista (" + current_exo_load.get('transporter', '') + " (" + self.transform_rnc(current_exo_load.get('vehicleInfo', {}).get('transporter_id', {}).get('rnc')) + ")) para la carga " + str(current_exo_load.get('loadNumber') + ". El Id ("+current_exo_load.get('vehicleInfo',{}).get('transporter_id',{}).get('_id')+") del transportista debe estar registrado"))
                        transporter_partner.with_company(current_env.company).create_user_from_partner()
                        if not transporter_partner.exo_load_start_date:
                            transporter_partner.exo_load_start_date = datetime(2024, 7, 1, 0, 0, 0)
                    if not partner.exo_load_start_date:
                        partner.exo_load_start_date = datetime(2024, 7, 1, 0, 0, 0)
                    if not current_exo_load.get('serviceOfferingDetails'):
                        raise ValidationError("CARGA: " + str(current_exo_load.get('loadNumber')) + ". No se ha sido configurado las nuevas caracteristicas del service offering (ServiceOfferingDetails). El equipo de EXO debe crear cargas con las nuevas caracteristicas y luego asegurarse que el rango de fecha seleccionado este dentro de las nuevas cargas configuradas. ")
                    transporter_product = self.get_product_from_name(current_exo_load['transportCostDetails'], current_exo_load['loadNumber'], transporter_partner, current_env) if create_trasporter else None
                    transporter_analytic_tag_ids = self.get_analytics_tags(current_exo_load['transportCostDetails'], current_env) if create_trasporter else None
                    partner_product = self.get_product_from_name(current_exo_load['serviceOfferingDetails'], current_exo_load['loadNumber'], partner, current_env)
                    if create_trasporter:
                        partner_analytics_accounts = self.get_transporter_analytics_account(partner, current_exo_load['warehouse'], current_env)
                    else:
                        partner_analytics_accounts = self.get_partner_analytics_account(partner, current_exo_load['warehouse'], current_env)
                    if not partner_analytics_accounts:
                        continue
                    partner_analytic_tag_ids = self.get_analytics_tags(current_exo_load['serviceOfferingDetails'], current_env)
                    load_group_key = self.get_load_group_key(current_exo_load, partner, partner_product, partner_analytic_tag_ids, partner_analytics_accounts)
                    load_id_to_change_status.append(current_exo_load['loadId'])
                    invoice_price = eval(partner.invoice_price_formula or '0')
                    billPrice = eval(partner.bill_price_formula or '0')
                    if self.rounded_money:
                        digits_round = 0 if create_partner else 2
                        invoice_price = round(invoice_price, digits_round)
                        billPrice = round(billPrice, digits_round)
                    if current_exo_load.get('status') not in ['Delivered', 'Waiting For TLC approval', 'TLC Approved', 'Waiting For CLC approval', 'CLC Approved', 'In Accounting', 'Finish Load', 'Denied Approval']:
                        continue
                    load_date_str = current_exo_load.get("loadingStatus", {}).get("slotStartTime")
                    if not load_date_str:
                        raise ValidationError(f"No se pudo obtener el load_date. Status: {current_exo_load.get('status')}. Carga: {current_exo_load.get('loadNumber')}")
                    load = {
                        "process_code_uuid": process_code_uuid,
                        "load_group_key": load_group_key,
                        "load_numbers": [current_exo_load['loadNumber']],
                        "load_id": current_exo_load['loadId'],
                        "load_date": datetime.strptime(load_date_str, "%Y-%m-%dT%H:%M:%S.%fZ"),
                        "load_warehouse": current_exo_load.get('warehouse', {}).get('name'),
                        'transporter_partner': transporter_partner,
                        'partner': partner,
                        'analytics_accounts': partner_analytics_accounts, 'transporter_analytics_accounts': partner_analytics_accounts,
                        'partner_analytics_tags': partner_analytic_tag_ids, 'transporter_analytics_tags': transporter_analytic_tag_ids,
                        "quantity": 1, 
                        "invoicePrice": invoice_price,
                        "billPrice": billPrice,
                        "partner_product": partner_product,
                        "transporter_product": transporter_product,
                        'description': None,
                        'driver': current_exo_load.get('driver'),
                        'status': current_exo_load.get('status'),
                        'shipper': self.get_load_shipper_name(current_exo_load),
                        'load_to_insert': current_exo_load,
                        'orders': get_orders_in_ids(current_exo_load.get('orders', [])),
                        'order_group': current_exo_load.get('order_group'),
                        'shipperPriceDiscount': current_exo_load.get('shipperPriceDiscount', []),
                        'transportationCostDiscount': current_exo_load.get('transportationCostDiscount', []),
                        'json_current_load': json.dumps(current_exo_load),
                    }
                    if create_partner:
                        partner_data_to_insert.append(load)
                    if create_trasporter:
                        transporter_data_to_insert.append({
                            **load,
                            "quantity": 1,
                            "load_number": current_exo_load['loadNumber'],
                            'transporter_load_ids': [
                                (0, 0, {
                                    'move_type': 'bill',
                                    'driver': current_exo_load.get('driver'),
                                    'status': current_exo_load.get('status'),
                                    'shipper': self.get_load_shipper_name(current_exo_load),
                                    'load_id': current_exo_load.get('loadId'),
                                    'process_code_uuid': process_code_uuid,
                                    'json_current_load': json.dumps(current_exo_load),
                                    'load_number': current_exo_load.get('loadNumber'),
                                    'orders': get_orders_in_ids(current_exo_load.get('orders', []))
                                })
                            ]
                        })
        else:
            raise ValidationError("Error obteniendo la data: " + data.get('loads', {}).get('Message', 'Unknown error'))

        invoices = []
        if partner_data_to_insert:
            invoices.extend(self.create_account(partner_data_to_insert, current_env, is_exo_app, group_code))
        if transporter_data_to_insert:
            invoices.extend(self.create_transporter_payment(transporter_data_to_insert, load_id_to_change_status, current_env, is_exo_app, group_code, cookie))
        if partner_data_to_insert or transporter_data_to_insert:
            self.update_load_status_in_exo(current_env, process_code_uuid, create_trasporter, cookie)
        return {'invoices': invoices, 'created_total_records': len(transporter_data_to_insert) + len(partner_data_to_insert)}

    def update_load_status_in_exo(self, current_env, process_code_uuid, create_trasporter, cookie=''):
        load_lines = current_env['account.line.load'].sudo().search([('process_code_uuid', '=', process_code_uuid)])
        try:
            load_lines.update_in_accounting_loads(cookie)
        except Exception as ex:
            load_ids = [line.load_id for line in load_lines]
            current_env['account.load.error'].sudo().with_company(current_env.company).create({
                'name': "Error intentando actualizar el estado en EXO. " + str(ex),
                'account_load_client_id': self.account_load_client_id.id,
                'partner_type': 'Proveedor' if create_trasporter else 'Shipper',
                'start_date': self.start_date,
                'end_date': self.end_date,
                'message_error': "LoadIds: " + ','.join(map(str, load_ids)),
                'current_date': datetime.now(),
                'state': 'draft'
            })

    def change_status_to_loads(self, load_ids, cookie):
        self.task_send_request({"load_ids": load_ids, "event": "recieveInAccounting"}, os.getenv('HOST_EXO') + "/Event", cookie)

    def _task_send_request_worker(self, data, url, cookie):
        try:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Catch-Control": "no-cache",
                "auth": cookie
            }
            response = requests.post(url, data=json.dumps(data), headers=headers)
            if response.status_code != 200:
                _logger.error(f"Error updating EXO status in thread: {response.json()}")
        except Exception as e:
            _logger.error(f"Exception in thread for EXO request: {e}")
            return False

    def task_send_request(self, data, url, cookie):
        tRequest = threading.Thread(target=self._task_send_request_worker, args=(data, url, cookie))
        tRequest.start()

    def get_ids_in_text(self, record):
        if not isinstance(record, collections.abc.Sequence):
            return str(record.id)
        text_ids = []
        for tag in record:
            if isinstance(tag, models.BaseModel):
                text_ids.append(str(tag.id))
            elif isinstance(tag, numbers.Number):
                text_ids.append(str(tag))
        return ",".join(text_ids)

    def schedule_transporter_load(self, current_env, loads, is_exo_app=False, group_code=False):
        execute_schedule_transporter_load = current_env["ir.config_parameter"].sudo().get_param("execute.schedule.transporter.load", 'False') == 'True'
        if not execute_schedule_transporter_load:
            return
        load_list = [load['load_id'] for load in loads]
        account_line_loads = current_env['account.line.load'].sudo().search([('load_id', 'in', load_list), ('original_load_id', 'in', load_list)])
        for i in range(len(loads) - 1, -1, -1):
            current_exo_load = loads[i]
            client_partner = current_exo_load['partner']
            current_transporter_partner = current_exo_load['transporter_partner']
            product = current_exo_load['transporter_product']
            transporter_load = account_line_loads.filtered(lambda l: l.move_type == 'bill' and (l.load_id == current_exo_load['load_id'] or l.original_load_id == current_exo_load['load_id']))
            if len(transporter_load) > 1:
                raise ValidationError(f"La carga ({current_exo_load.get('loadNumber')}) para el transportista ({current_transporter_partner.name}) con el shipper ({client_partner.name}) ya existia incluso mas de una vez.")
            if transporter_load:
                if transporter_load.is_programming and not transporter_load.is_schedule_executed:
                    del loads[i]
                continue
            shipper_load = account_line_loads.filtered(lambda l: l.move_type == 'invoice' and (l.load_id == current_exo_load['load_id'] or l.original_load_id == current_exo_load['load_id']))
            current_block = get_invoice_block(client_partner, current_exo_load['load_date'])
            if not current_block or not current_block.get('block_start') or not current_block.get('block_end'):
                raise ValidationError(f"La carga ({current_exo_load.get('load_number')}) para el transportista ({current_transporter_partner.name}) con el shipper ({client_partner.name}) no puede ser programada debido a que no posee una fecha programable.")
            if not shipper_load or (shipper_load.account_move_id and shipper_load.account_move_id.state != 'posted'):
                transporter_analytics_accounts = current_exo_load['transporter_analytics_accounts']
                transporter_analytics_tags = current_exo_load['transporter_analytics_tags']
                current_env['account.line.load'].sudo().create({
                    'move_type': 'bill',
                    'driver': current_exo_load.get('driver'),
                    'status': current_exo_load.get('status'),
                    'shipper': self.get_load_shipper_name(current_exo_load),
                    'load_id': current_exo_load.get('load_id'),
                    'process_code_uuid': current_exo_load.get('process_code_uuid'),
                    'json_current_load': current_exo_load.get('json_current_load'),
                    'load_number': current_exo_load.get('load_number'),
                    'orders': current_exo_load.get('orders'),
                    'product_tmpl_id': product.id,
                    'is_programming': True,
                    'is_schedule_executed': False,
                    'block_date_start': current_block.get('block_start'),
                    'block_date_end': current_block.get('block_end'),
                    'transporter_id': current_transporter_partner.id,
                    'shipper_id': client_partner.id,
                    'is_exo_app': is_exo_app,
                    'group_code': group_code,
                    'analytic_account_id': transporter_analytics_accounts.id if transporter_analytics_accounts else False,
                    'analytic_tag_ids': [(6, 0, transporter_analytics_tags.ids)] if transporter_analytics_tags else False,
                    'billPrice': current_exo_load.get('billPrice'),
                    'quantity': current_exo_load.get('quantity'),
                    'load_date': current_exo_load.get('load_date')
                })
                del loads[i]
    @retry_serialization()  # [CHANGE] reintentos en creación de facturas
    def create_transporter_payment(self, loads, load_id_to_change_status, current_env, is_exo_app=False, group_code=False, cookie=''):
        invoices_createds = []
        clients = {}
        duplicated_loads = []
        for load in loads:
            current_transporter_partner = load['transporter_partner']
            product = load['transporter_product']
            load_number_display = load.get('load_number', '')
            if current_transporter_partner and current_transporter_partner.in_transporter_show_order_num:
                load_number_display = f"GUIA NO: ({str(load.get('orders'))}) / " + load_number_display
            exists_invoice_line_load = current_env['account.line.load'].sudo().search([('load_number', '=', load['load_number']), ('account_line_id.move_id.move_type', 'in', ['in_invoice', 'in_refund', 'in_receipt'])])
            taxes = product.taxes_id
            additional_taxes = current_transporter_partner.tax_products.filtered(lambda x: x.product_tmpl_id.id == product.id)
            additional_tax_ids = [add_tax.tax_id.id for add_tax in additional_taxes]
            tax_ids = taxes.ids + additional_tax_ids
            current_transporter_partner.add_additional_tax(current_env, tax_ids)
            transporter_analytics_accounts = load['transporter_analytics_accounts']
            transporter_analytics_tags = load['transporter_analytics_tags']
            if exists_invoice_line_load:
                exists_invoice_line = exists_invoice_line_load.account_line_id
                current_code = f"{product.id}-{load.get('load_number')}-{int(load.get('quantity', 0))}-{int(load.get('billPrice', 0))}-{self.get_ids_in_text(transporter_analytics_tags) if transporter_analytics_tags else ''}-{self.get_ids_in_text(transporter_analytics_accounts) if transporter_analytics_accounts else ''}"
                existing_code = f"{exists_invoice_line.product_id.id}-{exists_invoice_line_load.load_number}-{int(exists_invoice_line.load_qty if exists_invoice_line.load_qty == exists_invoice_line.quantity else -1)}-{int(exists_invoice_line.price_unit)}-{self.get_ids_in_text(exists_invoice_line.analytic_tag_ids)}-{exists_invoice_line.analytic_account_id.id if exists_invoice_line.analytic_account_id else ''}"
                if current_code != existing_code:
                    if exists_invoice_line.move_id.state == 'draft':
                        line_info = {
                            'product_id': product.id,
                            'quantity': load['quantity'],
                            'name': load_number_display,
                            'price_unit': load['billPrice'],
                            'analytic_account_id': transporter_analytics_accounts.id if transporter_analytics_accounts else False,
                            'analytic_tag_ids': [(6, 0, transporter_analytics_tags.ids)] if transporter_analytics_tags else False,
                            'tax_ids': [(6, 0, tax_ids)] if tax_ids else False,
                        }
                        exists_invoice_line.sudo().with_context(check_move_validity=False, allow_update_qty=True).write(line_info)
                        invoices_createds.append(exists_invoice_line.move_id)
                    else:
                        duplicated_loads.append(exists_invoice_line)
            else:
                domain = [
                    ('is_automatic_invoice', '=', True),
                    ('lock_invoice', '=', False),
                    ('partner_id', '=', current_transporter_partner.id),
                    ('move_type', 'in', ['in_invoice', 'in_refund', 'in_receipt']),
                    ('state', '=', 'draft')
                ]
                group_key = group_code if group_code else ''
                if is_exo_app:
                    group_key += 'is_exo_app'
                block = get_invoice_block(current_transporter_partner, load['load_date'])
                if self.group_by_payment_term:
                    group_key += " " + str(block.get('code_result'))
                if group_key:
                    domain.append(('load_invoice_code', '=', group_key))
                exists_invoice_from_partner = current_env['account.move'].sudo().search(domain, limit=1)
                if not exists_invoice_from_partner:
                    invoice_line = (0, 0, {
                        'product_id': product.id,
                        'quantity': load['quantity'],
                        'name': load_number_display,
                        'price_unit': load['billPrice'],
                        'account_id': product.property_account_expense_id.id,
                        'analytic_account_id': transporter_analytics_accounts.id if transporter_analytics_accounts else False,
                        'analytic_tag_ids': [(6, 0, transporter_analytics_tags.ids)] if transporter_analytics_tags else False,
                        'tax_ids': [(6, 0, tax_ids)] if tax_ids else False,
                        'is_automatic_line': True,
                        'load_ids': load['transporter_load_ids']
                    })
                    client_key_group = str(current_transporter_partner.id) + str(group_key)
                    if client_key_group not in clients:
                        clients[client_key_group] = {"partner": current_transporter_partner, "block": block, 'load_invoice_code': group_key, "invoice_line_ids": []}
                    clients[client_key_group]["invoice_line_ids"].append(invoice_line)
                    for disc in load.get('transportationCostDiscount', []):
                        dic_tax_ids = product.taxes_id.ids
                        current_transporter_partner.add_additional_tax(current_env, dic_tax_ids)
                        clients[client_key_group]["invoice_line_ids"].append((0, 0, {
                            'product_id': product.id,
                            'quantity': disc.get('quantity', 1),
                            'name': f"{load_number_display} / {disc.get('description')}",
                            'price_unit': disc.get('damagedChargePrice', 0) * (-1 if disc.get('type') == "$ Descuento" else 1),
                            'analytic_account_id': transporter_analytics_accounts.id if transporter_analytics_accounts else False,
                            'analytic_tag_ids': [(6, 0, transporter_analytics_tags.ids)] if transporter_analytics_tags else False,
                            'tax_ids': [(6, 0, dic_tax_ids)] if dic_tax_ids else False,
                            'is_automatic_line': True,
                            'line_type': disc.get('type'),
                            'account_id': product.property_account_expense_id.id,
                        }))
                else:
                    move = exists_invoice_from_partner[0]
                    current_invoice_line_ids = [(0, 0, {
                        'product_id': product.id,
                        'quantity': load['quantity'],
                        'name': load_number_display,
                        'price_unit': load['billPrice'],
                        'analytic_account_id': transporter_analytics_accounts.id,
                        'analytic_tag_ids': [(6, 0, load['transporter_analytics_tags'].ids)],
                        'tax_ids': [(6, 0, tax_ids)] if tax_ids else False,
                        'move_id': move.id,
                        'account_id': product.property_account_expense_id.id,
                        'is_automatic_line': True,
                        'load_ids': load['transporter_load_ids']
                    })]
                    for disc in load['transportationCostDiscount']:
                        dic_tax_ids = product.taxes_id.ids
                        current_transporter_partner.add_additional_tax(current_env, dic_tax_ids)
                        current_invoice_line_ids.append((0, 0, {
                            'product_id': product.id,
                            'quantity': disc.get('quantity', 1),
                            'name': f"{load_number_display} / {disc.get('description')}",
                            'price_unit': disc.get('damagedChargePrice', 0) * (-1 if disc.get('type') == "$ Descuento" else 1),
                            'analytic_account_id': transporter_analytics_accounts.id if transporter_analytics_accounts else False,
                            'analytic_tag_ids': [(6, 0, transporter_analytics_tags.ids)] if transporter_analytics_tags else False,
                            'tax_ids': [(6, 0, dic_tax_ids)] if dic_tax_ids else False,
                            'is_automatic_line': True,
                            'line_type': disc.get('type'),
                            'account_id': product.property_account_expense_id.id,
                        }))
                    move.sudo().write({'invoice_line_ids': current_invoice_line_ids})
                    invoices_createds.append(move)

        for client_key, client_data in clients.items():
            current_transporter_partner = client_data['partner']
            current_block = client_data['block']
            current_load_invoice_code = client_data['load_invoice_code']
            payment_term_id = current_transporter_partner.property_supplier_payment_term_id.id or self.env.ref('account.account_payment_term_30days').id
            invoice = current_env['account.move'].sudo().create({
                'fiscal_position_id': current_transporter_partner.property_account_position_id.id,
                'invoice_payment_term_id': payment_term_id,
                'move_type': 'in_invoice',
                'partner_id': current_transporter_partner.id,
                'invoice_date': date.today(),
                'invoice_line_ids': client_data['invoice_line_ids'],
                'is_automatic_invoice': True,
                'load_invoice_date': load['load_date'],
                'company_id': current_env.company.id,
                'load_invoice_code': current_load_invoice_code if current_load_invoice_code else False,
                'block_date_start': current_block.get('block_start') if current_block else False,
                'block_date_end': current_block.get('block_end') if current_block else False,
            })
            invoice.create_move_line_benefit_discount(current_env)
            if invoice not in invoices_createds:
                invoices_createds.append(invoice)

        self.change_status_to_loads(load_id_to_change_status, cookie)
        if duplicated_loads:
            message = "CARGAS PARA LOS PROVEEDORES PRECARGADAS. \n\nNOTA: Las siguientes cargas ya habían sido creadas en odoo y están presentando diferencias con EXO: \n\n"
            for invoice_line in duplicated_loads:
                message += f"La Carga: ({invoice_line.load_numbers}) que se encuentra en la factura: ({invoice_line.move_id.display_name}) \n"
            raise ValidationError(message)
        self.generate_partner_bank_fee(invoices_createds)
        return invoices_createds

    def generate_partner_bank_fee(self, invoices):
        for invoice in invoices:
            try:
                invoice.sudo().generate_partner_bank_fee()
            except Exception:
                continue

    def get_line_in_load_exists(self, load_number, lines):
        return {"line": False}

    def get_current_code_by_json_load(self, json_load):
        partner_product_id = json_load.get('partner_product', self.env['product.product']).id or ''
        analytics_accounts_id = json_load.get('analytics_accounts', self.env['account.analytic.account']).id or ''
        return f"{partner_product_id}-{','.join(json_load.get('load_numbers',[]))}-{int(json_load.get('quantity',0))}-{int(json_load.get('invoicePrice',0))}-{self.get_ids_in_text(json_load.get('partner_analytics_tags'))}-{analytics_accounts_id}"

    def delete_move_line_loads(self, delete_to):
        for move_line_load in delete_to:
            account_line = move_line_load.account_line_id
            if account_line:
                account_line.sudo().with_context(check_move_validity=False, allow_update_qty=True).write({
                    'quantity': account_line.quantity - 1
                })
            move_line_load.sudo().with_context(check_move_validity=False, allow_update_qty=True).unlink()

    def delete_line_in_zero(self, move):
        lines_to_delete = move.invoice_line_ids.filtered(lambda line: line.quantity == 0)
        if lines_to_delete:
            lines_to_delete.sudo().with_context(check_move_validity=False, allow_update_qty=True).unlink()
        if not move.invoice_line_ids:
            move.sudo().unlink()
    @retry_serialization()  # [CHANGE] reintentos en creación de facturas
    def create_account(self, partner_data_to_insert, current_env, is_exo_app=False, group_code=False):
        invoices_createds = []
        for load in partner_data_to_insert:
            try:
                partner = load['partner']
                product = load['partner_product']
                taxes = product.taxes_id
                additional_taxes = partner.tax_products.filtered(lambda x: x.product_tmpl_id.id == product.id)
                additional_tax_ids = [add_tax.tax_id.id for add_tax in additional_taxes]
                tax_ids = taxes.ids + additional_tax_ids
                analytics_accounts = load['analytics_accounts']
                analytics_tags = load['partner_analytics_tags']
                changes = self.get_load_changes(load, product, analytics_accounts, analytics_tags, current_env)
                delete_to = changes['delete_to']
                self.delete_move_line_loads(delete_to)
                domain = [
                    ('is_automatic_invoice', '=', True),
                    ('lock_invoice', '=', False),
                    ('partner_id', '=', partner.id),
                    ('move_type', '=', 'out_invoice'),
                    ('state', '=', 'draft'),
                    ('journal_id.code', '=', 'INV')
                ]
                group_key = group_code if group_code else ''
                if is_exo_app:
                    group_key += 'is_exo_app'
                if self.group_by_warehouse:
                    group_key += str(load.get('load_warehouse'))
                block = get_invoice_block(partner, load['load_date'])
                if self.group_by_payment_term:
                    load_invoice_code = block.get('code_result')
                    group_key += " " + str(load_invoice_code)
                if group_key:
                    domain.append(('load_invoice_code', '=', group_key))
                current_move_for_loads = current_env['account.move'].sudo().search(domain, limit=1)
                if not current_move_for_loads:
                    payment_term_id = partner.property_payment_term_id.id or self.env.ref('account.account_payment_term_30days').id
                    current_move_for_loads = current_env['account.move'].sudo().with_company(current_env.company).create({
                        'fiscal_position_id': partner.property_account_position_id.id,
                        'invoice_payment_term_id': payment_term_id,
                        'partner_id': partner.id,
                        'move_type': 'out_invoice',
                        'load_invoice_date': load['load_date'],
                        'is_automatic_invoice': True,
                        'load_invoice_code': group_key if group_key else False,
                        'block_date_start': block.get('block_start') if block else False,
                        'block_date_end': block.get('block_end') if block else False,
                    })
                    invoices_createds.append(current_move_for_loads)
                if current_move_for_loads:
                    current_move_for_loads.create_move_line_benefit_discount(current_env)
                for load_number in changes['add_to']:
                    line_domain = [
                        ('move_id', '=', current_move_for_loads.id),
                        ('name', '=', load['load_group_key']),
                        ('product_id', '=', product.id),
                        ('analytic_account_id', '=', analytics_accounts.id)
                    ]
                    is_summarized = any(partner.mapped('exo_load_configurations.is_summarized'))
                    if not is_summarized:
                        line_domain.append(('price_unit', '=', load['invoicePrice']))
                    exist_group_loads = current_env['account.move.line'].sudo().search(line_domain, limit=1)
                    if exist_group_loads:
                        vals = {
                            'quantity': exist_group_loads.quantity if is_summarized else exist_group_loads.quantity + 1,
                            'price_unit': exist_group_loads.price_unit + load.get('invoicePrice', 0) if is_summarized else exist_group_loads.price_unit,
                            'load_ids': [(0, 0, {
                                'move_type': 'invoice',
                                'process_code_uuid': load.get('process_code_uuid'),
                                'driver': load.get('driver'),
                                'status': load.get('status'),
                                'shipper': self.get_load_shipper_name(load),
                                'load_id': load.get('load_id'),
                                'load_number': load_number,
                                'orders': load.get('orders'),
                                'json_current_load': json.dumps(load.get('load_to_insert'))
                            })]
                        }
                        exist_group_loads.sudo().with_context(check_move_validity=False, allow_update_qty=True).write(vals)
                        invoices_createds.append(exist_group_loads.move_id)
                    else:
                        m_value = {
                            'invoice_line_ids': [(0, 0, {
                                'product_id': product.id,
                                'quantity': 1,
                                'name': load['load_group_key'],
                                'price_unit': load['invoicePrice'],
                                'analytic_account_id': analytics_accounts.id,
                                'tax_ids': [(6, 0, tax_ids)] if tax_ids else False,
                                'analytic_tag_ids': [(6, 0, analytics_tags.ids)],
                                'account_id': product.property_account_income_id.id,
                                'is_automatic_line': True,
                                'load_ids': [(0, 0, {
                                    'move_type': 'invoice',
                                    'process_code_uuid': load.get('process_code_uuid'),
                                    'driver': load.get('driver'),
                                    'status': load.get('status'),
                                    'shipper': self.get_load_shipper_name(load),
                                    'load_id': load.get('load_id'),
                                    'load_number': load_number,
                                    'orders': load.get('orders'),
                                    'json_current_load': json.dumps(load.get('load_to_insert'))
                                })]
                            })]
                        }
                        current_move_for_loads.sudo().write(m_value)
                        invoices_createds.append(current_move_for_loads)
                        for disc in load.get('shipperPriceDiscount', []):
                            dic_tax_ids = product.taxes_id.ids
                            current_move_for_loads.sudo().partner_id.add_additional_tax(current_env, dic_tax_ids)
                            current_move_for_loads.sudo().write({
                                'invoice_line_ids': [(0, 0, {
                                    'product_id': product.id,
                                    'quantity': disc.get('quantity', 1),
                                    'name': f"{load.get('load_group_key')} / {disc.get('description')}",
                                    'analytic_account_id': analytics_accounts.id,
                                    'tax_ids': [(6, 0, dic_tax_ids)] if dic_tax_ids else False,
                                    'analytic_tag_ids': [(6, 0, analytics_tags.ids)],
                                    'line_type': disc.get('type'),
                                    'price_unit': disc.get('damagedChargePrice', 0) * (1 if disc.get('type') == "$ Adicional" else -1),
                                    'account_id': product.property_account_income_id.id,
                                    'is_automatic_line': True
                                })]
                            })
                self.delete_line_in_zero(current_move_for_loads)
                invoices_createds.append(current_move_for_loads)
                current_env.cr.commit()
            except Exception as ex:
                current_env.cr.rollback()
                _logger.exception("Error creating account data.")
                if not self.has_error_continue_others:
                    raise ex
                else:
                    current_env['account.load.error'].sudo().with_company(current_env.company).create({
                        'name': "Error intentando ejecutar las cargas, creando la facura del cliente",
                        'account_load_client_id': self.account_load_client_id.id,
                        'partner_type': 'Shipper',
                        'start_date': self.start_date,
                        'end_date': self.end_date,
                        'message_error': str(ex),
                        'current_date': datetime.now(),
                        'state': 'draft'
                    })
                    current_env.cr.commit()
        return invoices_createds

    def get_load_changes(self, load, product, analytics_accounts, analytics_tags, current_env):
        add_to = []
        delete_to = []
        for load_number in load.get('load_numbers', []):
            exists_invoice_line_l = current_env['account.line.load'].sudo().search([('load_number', '=', load_number), ('account_line_id.move_id.move_type', '=', 'out_invoice')])
            if exists_invoice_line_l:
                current_code = f"{product.id}-{int(load.get('invoicePrice', 0))}-{self.get_ids_in_text(analytics_tags)}-{self.get_ids_in_text(analytics_accounts)}"
                existing_line = exists_invoice_line_l.account_line_id
                existing_code = f"{existing_line.product_id.id}-{int(existing_line.price_unit)}-{self.get_ids_in_text(existing_line.analytic_tag_ids)}-{self.get_ids_in_text(existing_line.analytic_account_id)}"
                if current_code != existing_code:
                    if existing_line.move_id.state != 'draft':
                        raise ValidationError(f"La carga ({load_number}) de la factura del cliente presenta cambios en EXO pero no puede ser modificada ya que la factura ({existing_line.move_id.name}) no esta en modo borrador en Odoo")
                    delete_to.append(exists_invoice_line_l)
                else:
                    continue
            add_to.append(load_number)
        return {'add_to': add_to, 'delete_to': delete_to}

    def get_epoch(self, date_obj):
        return int(date_obj.timestamp() * 1000)

    def get_loads(self, skip=0, take=100, number_hours=None, odoo_partner=None, odoo_transporter=None, statuses_to_filter=None, order_nums=None, load_ids=None, cookie=''):
        if not load_ids and not statuses_to_filter:
            raise ValidationError('Es necesario configurar el estado por el cual será filtrado el cliente.')
        headers = {"Content-Type": "application/json", "Accept": "application/json", "Catch-Control": "no-cache", "auth": cookie}
        start_date = self.start_date if self.start_date else datetime.now() - timedelta(hours=number_hours)
        end_date = self.end_date if self.end_date else datetime.now() + timedelta(hours=1)
        start_date_epoch = self.get_epoch(get_datetime_in_current_zone(start_date))
        end_date_epoch = self.get_epoch(get_datetime_in_current_zone(end_date))
        host_exo = os.getenv('HOST_EXO')
        query = {}
        if load_ids:
            query["loadMapId"] = load_ids
        else:
            if start_date_epoch: query["startDate"] = str(start_date_epoch)
            if end_date_epoch: query["endDate"] = str(end_date_epoch)
            if odoo_partner: query["customerRnc"] = [odoo_partner.vat]
            if odoo_transporter and not odoo_transporter.partner_object_ids:
                raise ValidationError('Es necesario seleccionar al menos un id para el transportista.')
            if odoo_transporter: query["transporterId"] = [transporter_object.name for transporter_object in odoo_transporter.partner_object_ids]
            if statuses_to_filter: query["status"] = [status.name for status in statuses_to_filter]
            if order_nums: query["orderNums"] = order_nums
        url = f'{host_exo}/exo/loads/filterAllForAccounting/?skip={skip}&take={take}&useTimeSlot=true&query={json.dumps(query)}'
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            error_msg = f'La carga no pudo ser procesada. Code: {response.status_code}\nContent: {response.content}'
            _logger.error(f"_____________________ ERROR 1 _________________ \nURL: {url}\n{error_msg}")
            raise ValidationError(error_msg)
        result = response.json()
        result['loads'] = result.get('loads', result)
        if not result.get('loads', {}).get('Success', False):
            error_msg = f"La carga no pudo ser procesada. Favor comuniquese con su administrador e intente mas tarde. Content: {response.content}"
            _logger.error(f"_____________________ ERROR 2_________________ \n{error_msg}")
            raise ValidationError(error_msg)
        return self.mapData(result)

    def remove_orders_not_delivered_and_not_same_load_id(self, result):
        if result.get('loads', {}).get('Result', {}).get('data'):
            for load in result['loads']['Result']['data']:
                load_id = load.get('loadId')
                filtered_orders = []
                allowed_statuses = [status.strip() for status in (self.allowed_order_status or "").split(",") if status.strip()]
                exceptions_filters = [
                    status for status in [
                        "Exception: client not available",
                        "Exception: Driver ran out of Time",
                        "Exception: wrong address",
                        "Exception: wrong Delivery Date",
                        "Rejected: Client did not put this Order",
                        "Rejected: Client has no Funds"
                    ] if status not in allowed_statuses
                ]
                for order in load.get('orders', []):
                    filtered_per_load_state = [
                        state for state in order.get('perLoadState', [])
                        if state.get('loadId') == load_id and state.get('state') not in exceptions_filters
                    ]
                    order['perLoadState'] = filtered_per_load_state
                    if filtered_per_load_state:
                        filtered_orders.append(order)
                load['orders'] = filtered_orders
        return result

    def set_load_properties(self, result):
        if result.get('loads', {}).get('Result', {}).get('data'):
            for json_load in result['loads']['Result']['data']:
                json_load['profitability'] = json_load.get('profitability', json_load.get('plannedProfitability', {}).get('profitability'))

    def mapData(self, result):
        result = self.remove_orders_not_delivered_and_not_same_load_id(result)
        self.set_load_properties(result)
        if result.get('loads', {}).get('Result', {}).get('data') and self.account_load_client_id and self.account_load_client_id.group_account_line_by_order:
            data = result['loads']['Result']['data']
            new_loads_data = []
            property_dvd = self.account_load_client_id.group_account_line_by_order.split('.')
            for current_exo_load in data:
                if not current_exo_load.get('orders'):
                    continue
                order_groups_by_key_from_load = {}
                for order in current_exo_load['orders']:
                    if order.get('cost') is None or order.get('price') is None:
                        raise ValidationError(f"La orden ({order.get('order_num')}) de la carga ({current_exo_load.get('loadNumber')}) no tiene el campo costo u/o el campo precio")
                    group_field = get_value_from_json_property(property_dvd, order, 1000, current_exo_load.get('loadNumber'), order.get('order_num'), str(property_dvd)) or "not_value"
                    if group_field not in order_groups_by_key_from_load:
                        order_groups_by_key_from_load[group_field] = {'total_cost': 0, 'total_price': 0, 'orders': []}
                    order_groups_by_key_from_load[group_field]['orders'].append(order)

                    _logger.info("______ order ||||||||||")
                    _logger.info(order)
                    _logger.info(json.dumps(order))
                    
                    order_groups_by_key_from_load[group_field]['total_cost'] += order.get('cost', 0)
                    order_groups_by_key_from_load[group_field]['total_price'] += order.get('price', 0)
                for order_group, group_data in order_groups_by_key_from_load.items():
                    new_load = json.loads(json.dumps(current_exo_load))
                    new_load['loadId'] = f"{current_exo_load.get('loadId')}_{order_group}"
                    new_load['loadNumber'] = f"{current_exo_load.get('loadNumber')}_{order_group}"
                    new_load['order_group'] = str(order_group)
                    new_load['profitability']['revenue'] = group_data['total_price']
                    new_load['profitability']['transportCost'] = group_data['total_cost']
                    new_load['orders'] = group_data['orders']
                    new_loads_data.append(new_load)
            result['loads']['Result']['data'] = new_loads_data
        return result

    def attach_template_to_invoice_fully_loaded(self, env):
        invoices = env['account.move'].sudo().search([('state', '=', 'draft'), ('templates_uploaded', '=', False), ('block_date_end', '<', datetime.now())])
        for current_invoice in invoices:
            if 'in' in current_invoice.move_type:
                current_invoice.generate_provider_template_files()
            if 'out' in current_invoice.move_type:
                current_invoice.generate_client_template_files()

    def _sync_automatic_invoice(self, env, model, trigger_record, trigger_records, start_hour=None, end_hour=None):
        now = datetime.now()
        process_uid = str(uuid.uuid4())
        current_partner_type = env.user.partner_id.internal_partner_type
        user_partner_type = 'Proveedor' if current_partner_type == 'transporter' else 'Shipper' if current_partner_type == 'shipper' else 'Interno'
        env['account.load.error'].sudo().with_company(env.company).create({
            'name': f"Inicio de sincronización automática [UID: {process_uid}]",
            'account_load_client_id': env.user.partner_id.id,
            'partner_type': user_partner_type,
            'start_date': now, 'end_date': now,
            'message_error': f"[UID: {process_uid}] Día: {now.strftime('%Y-%m-%d')} / Hora: {now.strftime('%H:%M')}",
            'current_date': now, 'state': 'draft', 'process_uid': process_uid,
        })
        month_start_date, month_end_date = get_month_start_and_end_dates_from_current(now)
        start_date = now - timedelta(hours=start_hour) if start_hour is not None else month_start_date
        end_date = now + timedelta(hours=end_hour) if end_hour is not None else month_end_date
        cookie = get_cookie()
        partners = env['res.partner'].sudo().search([
            ('create_by_automatic_load', '=', True),
            ('internal_partner_type', 'in', ['transporter', 'shipper'])
        ])
        for partner in partners:
            if partner.vat == '101019921':
                continue
            internal_type = partner.internal_partner_type
            partner_type = 'Proveedor' if internal_type == 'transporter' else 'Shipper' if internal_type == 'shipper' else 'Interno'
            try:
                env['account.load.error'].sudo().with_company(env.company).create({
                    'name': f"Procesando partner: {partner.name} [UID: {process_uid}]",
                    'account_load_client_id': partner.id,
                    'partner_type': partner_type,
                    'start_date': start_date, 'end_date': end_date,
                    'message_error': f"Ejecutando como {partner_type} [UID: {process_uid}]",
                    'current_date': datetime.now(), 'state': 'draft', 'process_uid': process_uid,
                })
                created_record = env['account.load'].sudo().with_company(env.company).create({
                    'start_date': start_date, 'end_date': end_date,
                    'account_load_client_id': partner.id,
                    'process_uid': process_uid
                })
                created_record.execute_load(cookie, None, True, True, env)
            except Exception as e:
                env.cr.rollback()
                safe_env = api.Environment(env.cr, env.uid, {})
                safe_env['account.load.error'].sudo().with_company(env.company).create({
                    'name': f"Error en sincronización automática para {partner.name} [UID: {process_uid}]",
                    'account_load_client_id': partner.id,
                    'partner_type': partner_type,
                    'start_date': start_date, 'end_date': end_date,
                    'message_error': str(e),
                    'current_date': datetime.now(), 'state': 'draft', 'process_uid': process_uid,
                })
                env.cr.commit()
