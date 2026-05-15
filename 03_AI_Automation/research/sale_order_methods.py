from odoo import models, _, http
import threading
import json
import requests
import os
from odoo.exceptions import ValidationError


from datetime import datetime, timedelta, time
import pytz, urllib.parse


import logging
_logger = logging.getLogger(__name__)


class OrderInherit(models.Model):
    _inherit = "sale.order"

    def get_format_order_display_id(self, order_id):
        return 'S' + ((5 - len(str(order_id))) * '0') + str(order_id)

    def get_id_from_display_id(self, order_id):
        display_id = self.get_format_order_display_id(order_id)
        order = http.request.env['sale.order'].sudo().search([('name', '=', display_id)])
        return order['id']

    def send_order(self, orderId, deliveryDate):
        orderData = self.get_order_info(orderId, deliveryDate)
        self.send_request(orderData, os.getenv('HOST_EXO') + "/exo/orders")
        return orderData

    def send_multiple_orders(self, orders):
        url = os.getenv('HOST_EXO') + "/exo/orders/bulk"
        ordersToSend = self.getOrdersInfo(orders)
        if len(ordersToSend) == 0:
            raise ValidationError("No se pudo realizar el envio de ordenes. Ordenes no cargadas")
            
        response = self.task_send_request(ordersToSend, url)
        _logger.info("_______________ response")
        _logger.info(response)
        
        if (response.status_code != 200):
            data_result = response.json()
            message = ''
            _logger.info("_________ DATA RESYKT")
            _logger.info(data_result)

            

            # Assuming data_result is a list containing a single dictionary.
            if isinstance(data_result, list) and len(data_result) > 0:
                first_result = data_result[0]
                results = first_result.get('Result', {})
                if results.get('Success', False) == False:
                    message += results.get('Message', '') 
                    
                    _logger.info("++++++++++++++")
                    _logger.info(results)
                    errors =  results.get('errors', [])
                    _logger.info("______ errors")
                    _logger.info(errors)
                    for err in errors:
                        message += err.get('message', '')
                    raise ValidationError(f"...No se pudo realizar el envio de ordenes. {message} favor intentar nuevamente si el error persiste contactar a su proveedor de software")
                    
                
            else:
                results = data_result.get('Result', [])


            if results:
                for result in results:
                    message += result.get('message', '') + '\n'
            raise ValidationError(f"No se pudo realizar el envio de ordenes. {message} favor intentar nuevamente si el error persiste contactar a su proveedor de software")
        return {"ordersToSend": ordersToSend, "response": response}

    def getOrdersInfo(self, orders):
        ordersToSend = []
        for order in orders:
            orderInfo = self.get_order_info(order["orderId"], order["deliveryDate"])
            if (orderInfo):
                ordersToSend.append(orderInfo)
        return ordersToSend

    def get_order_info(self, orderId, deliveryDate = "2020-02-02 00:00:00"):
        _logger.info("ENVIANDO 1")
        _logger.info(orderId)
        sale_order = http.request.env['sale.order'].sudo().search([('id', '=', orderId)])
        _logger.info("ENVIANDO 2")
        _logger.info(len(sale_order))
        if (len(sale_order) == 0): return None
        _logger.info("ENVIANDO 3")

        products = []
        
        stock_to_pack_zone = sale_order.picking_ids.filtered(lambda pic: pic.picking_type_id.sequence_code == 'PICK')
        if not stock_to_pack_zone:
            raise ValidationError(f"No se pudo realizar el envio de la orden {sale_order.display_name}, debido a que no se encuentra el transfer de empaquetado")

        if stock_to_pack_zone.state != 'done':
            raise ValidationError(f"No se pudo realizar el envio de la orden {sale_order.display_name}, debido a que el transfer de empaquetado con estado {stock_to_pack_zone.state}. No tiene el estado correspondiente")
        
        if not stock_to_pack_zone.has_packages:
            raise ValidationError(f"No se pudo realizar el envio de la orden {sale_order.display_name}, debido a que el transfer de empaquetado no tiene paquetes")
        
        packages = stock_to_pack_zone.move_line_ids.mapped('result_package_id')
        

        for pack in packages:

            if not pack.package_type_id:
                raise ValidationError(f"El paquete {pack.name} de la orden {sale_order.display_name} no tiene un tipo de paquete configurado. Favor comuniquese con Soporte para que le configuren el paquete")
            
            if not pack.package_type_id.barcode:
                raise ValidationError(f"El paquete {pack.name} de la orden {sale_order.display_name} no tiene un barcode definido. Favor solicitar a soporte configurarlo")
            
            unit_volume_cm3 = pack.package_type_id.height * pack.package_type_id.width * pack.package_type_id.packaging_length

            if not pack.quant_ids or len(pack.quant_ids) == 0:
                raise ValidationError(f"El paquete {pack.name} de la orden {sale_order.display_name} no tiene productos configurados")

            quants = [f"{quant_prod.quantity} x {quant_prod.product_tmpl_id.name}" for quant_prod  in pack.quant_ids]
            products.append({
                "name": str(pack.id),
                "product_description": f"{pack.package_type_id.name} / {pack.name}",
                "qr_code": pack.package_type_id.barcode,
                "quantity": 1,
                "height": pack.package_type_id.height,
                "width": pack.package_type_id.width,
                "length": pack.package_type_id.packaging_length,
                "weight_unit": pack.package_type_id.weight_uom_name,
                "unit_weight": pack.package_type_id.base_weight,
                "volume_unit": f"{pack.package_type_id.length_uom_name}3",
                "unit_volume":  round(unit_volume_cm3, 6),
                "total_volume": round(unit_volume_cm3, 6),
                "total_weight": round(pack.package_type_id.base_weight, 6),
                "scan_one_by_one": "yes", #Fixed
                "contains": ','.join(quants)
            })
        
        _logger.info("ENVIANDO 4")
        
        company = sale_order.company_id

        delivery_date_str = deliveryDate if isinstance(deliveryDate, str) else deliveryDate.strftime("%Y-%m-%d %H:%M:%S")
        
        if not company.warehouse_name or not company.partner_id.partner_latitude or not company.partner_id.partner_longitude:
            raise ValidationError(f'La compañia {company.name} no ha configurado el warehouse. Nombre, Latitude y Longitude')

        if not sale_order["partner_id"].partner_longitude or not sale_order["partner_id"].partner_latitude:
            raise ValidationError(f"La latitude y longitude para el cliente {sale_order["partner_id"].name} es obligatorio. Favor solicitar a soporte incluir dichos valores.")

        order_info = {
            "shipper_info": { # Fixed
                "customer": company.name,
                "rnc": company.vat
            },
            "warehouse_info": { # Fixed
                "name": company.warehouse_name,
                "latitude": company.partner_id.partner_latitude,
                "longitude" : company.partner_id.partner_longitude  
            },
            "end_client_info": { # Dynamic
                "partner_id": sale_order["partner_id"].id if sale_order["partner_id"].id else '',
                "client_id":  str(sale_order["partner_id"]['id']),
                "client_name": sale_order["partner_id"].name,
                "client_email": sale_order["partner_id"].email if sale_order["partner_id"].email else '',
                "client_country_code": sale_order["partner_id"].country_id.code if sale_order["partner_id"].country_id.code else '',
                "client_phone": sale_order["partner_id"].phone.split("-")[-1] if sale_order["partner_id"].phone else '',
                "client_address": ('' if sale_order["partner_id"].address_line_1 == False else sale_order["partner_id"].address_line_1) + " " + ('' if sale_order["partner_id"].address_line_2 == False else sale_order["partner_id"].address_line_2),
                "client_sector": sale_order["partner_id"].sector_id.name if sale_order["partner_id"].sector_id else '',
                "client_city": sale_order["partner_id"].sector_id.city_id.name if sale_order["partner_id"].sector_id and sale_order["partner_id"].sector_id.city_id else '',
                "client_province": sale_order["partner_id"].state_id.name if sale_order["partner_id"].state_id.name else '',
                "client_zip_code": '' if sale_order["partner_id"].zip == False else sale_order["partner_id"].zip,
                "client_latitude": sale_order["partner_id"].partner_latitude,
                "client_longitude": sale_order["partner_id"].partner_longitude,
                "comment": sale_order["partner_id"].exo_comment if sale_order["partner_id"].exo_comment else ''
            },
            "order_info": {
                "order_id": sale_order['display_id'],
                "expected_date": delivery_date_str.split(" ")[0],
                "expected_time": "19:00", # Fijo
                "pickup_date": delivery_date_str.split(" ")[0],
                "pickup_time": "07:00", # Fijo
                "is_return": False, # Fijo
                "has_associated_order": False, # Fijo
                "service_type": "Entrega Casa", # Fijo
                "delivery_cycle": None,# Fijo
                "order_sequence": None, # Fijo
                "comment": "..."

            },
            "product_info": products
        }
        _logger.info("----PRINTING ORDER INFO FROM MODEL UTILS------")
        _logger.info(order_info)
        return order_info

    def send_request(self, data, url):
        tRequest = threading.Thread(target=self.task_send_request, args=(data, url))
        tRequest.start()
        return True
        

    def task_send_request(self, data, url):
        try:
            authenticate_data = { "email": str(os.getenv('EXO_USER')), "password": str(os.getenv('EXO_PASSWORD'))}
            exo_endpoint_url = str(os.getenv('HOST_EXO')) + '/exo/authenticate/'
            
            responseAuthenticate = requests.post(url=exo_endpoint_url, json=authenticate_data)
            if responseAuthenticate.status_code != 200:
                raise ValidationError('La carga no pudo ser procesada debido a temas de authenticacion. \nCode: %s\nContent: %s' % (responseAuthenticate.status_code, responseAuthenticate.content))
            
            auth_resp  = responseAuthenticate.json()
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Catch-Control": "no-cache",
                "Set-Cookie": "session_id=9e58e7308909550840b24cb6705dd7d01d17de67; Path=/; Secure; HttpOnly; Expires=Thu, 16 Jun 2022 16:27:04 GMT;",
                "api-key": "61a8e2584395b54w4624783836846947rtyeur68486ryt484795095b0da5aa9a"
            }
            
            headers['auth'] = auth_resp['data']['cookie'][0]
            _logger.info("++++++++++++==")
            _logger.info(url)
            _logger.info(json.dumps(data))
            _logger.info(headers)
            response = requests.post(url, data=json.dumps(data), headers=headers)
            return response
        except Exception as ex:
            _logger.info("__________________________ task send request ")
            _logger.info(ex)
            return False

    def process_orders(self):
        sap_result = self.get_sap_orders()
        order_ids = [int(order.get('U_Orden_Real')) for order in sap_result.get('value', [])]
        _logger.info(order_ids)
        db_orders = self.env['sale.order'].sudo().search([('external_state', 'in', ['Pendiente', 'En Proceso', 'Confirmada']), ('id', 'in', order_ids)])
        _logger.info(db_orders)
        db_orders.sudo().write({
            'external_state': 'Confirmada Por SAP'
        })
        _logger.info("Fin")

    # -------------------------------------------------------------------------
    # Sincronización de productos con SAP (SAP como maestro)
    # -------------------------------------------------------------------------
    @api.model
    def sync_products_with_sap(self, company=None, warehouse_code=None):
        company = company or self.env.company
        _logger.info("=== INICIO sync_products_with_sap company_id=%s ===", company.id)

        sap_products = self._sap_get_products(company=company, warehouse_code=warehouse_code)
        if not sap_products:
            raise ValidationError(_("No se recibieron productos desde SAP para sincronizar."))

        sap_codes = set(sap_products.keys())
        Product = self.env['product.product'].with_context(active_test=False).sudo()
        odoo_products = Product.search([('default_code', '!=', False)])
        odoo_by_code = {p.default_code: p for p in odoo_products}
        odoo_codes = set(odoo_by_code.keys())

        codes_to_create = sap_codes - odoo_codes
        codes_to_archive = odoo_codes - sap_codes
        codes_to_update = sap_codes & odoo_codes

        uom_unit = self._get_default_uom()
        created_products = self._create_missing_products_from_sap(
            sap_products, codes_to_create, uom_unit, company
        )
        archived_products = self._archive_products_not_in_sap(odoo_by_code, codes_to_archive)
        updated_products = self._update_products_quantities_from_sap(
            sap_products, odoo_by_code, codes_to_update, company, warehouse_code
        )

        _logger.info(
            "=== FIN sync_products_with_sap: creados=%s archivados=%s actualizados=%s ===",
            len(created_products), len(archived_products), len(updated_products)
        )
        return {
            "created": created_products.ids if created_products else [],
            "archived": archived_products.ids if archived_products else [],
            "updated_qty": updated_products.ids if updated_products else [],
        }

    @api.model
    def _sap_get_products(self, company=None, warehouse_code=None):
        company = company or self.env.company
        sap_user = os.getenv("SAP_USER")
        sap_password = os.getenv("SAP_PASSWORD")
        sap_db = os.getenv("SAP_DB")
        sap_host = os.getenv("HOST_SAP")

        if not sap_user or not sap_password or not sap_db or not sap_host:
            raise ValidationError(_("Variables de entorno SAP incompletas (SAP_USER, SAP_PASSWORD, SAP_DB, HOST_SAP)."))

        login_url = f"{sap_host}/b1s/v2/Login"
        login_payload = {"UserName": sap_user, "Password": sap_password, "CompanyDB": sap_db}
        try:
            resp_login = requests.post(login_url, json=login_payload, verify=False)
            _logger.info("Login SAP status=%s", resp_login.status_code)
            if resp_login.status_code != 200:
                raise ValidationError(
                    _("Error autenticando contra SAP. Code: %s, Content: %s") % (resp_login.status_code, resp_login.content)
                )
            session_id = resp_login.json().get("SessionId")
            if not session_id:
                raise ValidationError(_("No se obtuvo SessionId en la respuesta de SAP."))

            headers = {
                "Cookie": f"B1SESSION={session_id}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            select_fields = "$select=ItemCode,ItemName,OnHand,WhsCode"
            items_url = f"{sap_host}/b1s/v2/Items?{select_fields}"
            resp_items = requests.get(items_url, headers=headers, verify=False)
            _logger.info("Items SAP status=%s", resp_items.status_code)
            if resp_items.status_code != 200:
                raise ValidationError(
                    _("Error obteniendo productos desde SAP. Code: %s, Content: %s")
                    % (resp_items.status_code, resp_items.content)
                )

            products_by_code = {}
            for item in resp_items.json().get("value", []):
                item_code = item.get("ItemCode")
                item_name = item.get("ItemName") or item_code
                on_hand = item.get("OnHand", 0.0) or 0.0
                whs = item.get("WhsCode")
                if warehouse_code and whs and whs != warehouse_code:
                    continue
                if not item_code:
                    continue
                if item_code not in products_by_code:
                    products_by_code[item_code] = {"code": item_code, "name": item_name, "qty": 0.0}
                products_by_code[item_code]["qty"] += float(on_hand)
            return products_by_code
        except Exception as ex:
            _logger.exception("Error en _sap_get_products")
            raise ValidationError(_("Ocurrió un error al obtener productos desde SAP: %s") % ex)

    @api.model
    def _get_default_uom(self):
        try:
            return self.env.ref("uom.product_uom_unit")
        except Exception:
            uom = self.env["uom.uom"].search([], limit=1)
            if not uom:
                raise ValidationError(_("No se encontró una unidad de medida por defecto."))
            return uom

    @api.model
    def _get_company_stock_location(self, company):
        Warehouse = self.env["stock.warehouse"].sudo()
        warehouse = Warehouse.search([("company_id", "=", company.id)], limit=1)
        if warehouse and warehouse.lot_stock_id:
            return warehouse.lot_stock_id
        Location = self.env["stock.location"].sudo()
        location = Location.search(
            [("usage", "=", "internal"), ("company_id", "in", [company.id, False])], limit=1
        )
        if not location:
            raise ValidationError(_("No se encontró ubicación interna de stock para %s.") % company.name)
        return location

    @api.model
    def _create_missing_products_from_sap(self, sap_products, codes_to_create, uom_unit, company):
        ProductTemplate = self.env["product.template"].sudo()
        created_products = self.env["product.product"]
        stock_location = self._get_company_stock_location(company)

        for code in codes_to_create:
            data = sap_products.get(code) or {}
            name = data.get("name") or code
            qty = data.get("qty", 0.0) or 0.0
            tmpl = ProductTemplate.create(
                {
                    "name": name,
                    "default_code": code,
                    "type": "product",
                    "uom_id": uom_unit.id,
                    "uom_po_id": uom_unit.id,
                    "company_id": company.id,
                }
            )
            product_variant = tmpl.product_variant_id
            created_products |= product_variant
            if qty:
                self._set_product_quantity(product_variant, qty, stock_location)
            _logger.info("Creado desde SAP code=%s name=%s qty=%s id=%s", code, name, qty, product_variant.id)
        return created_products

    @api.model
    def _archive_products_not_in_sap(self, odoo_by_code, codes_to_archive):
        archived = self.env["product.product"]
        for code in codes_to_archive:
            prod = odoo_by_code.get(code)
            if prod and prod.active:
                prod.sudo().write({"active": False})
                archived |= prod
                _logger.info("Archivado (no SAP) code=%s id=%s", code, prod.id)
        return archived

    @api.model
    def _update_products_quantities_from_sap(
        self, sap_products, odoo_by_code, codes_to_update, company, warehouse_code=None
    ):
        StockQuant = self.env["stock.quant"].sudo()
        stock_location = self._get_company_stock_location(company)
        updated = self.env["product.product"]

        for code in codes_to_update:
            prod = odoo_by_code.get(code)
            if not prod:
                continue
            sap_qty = float((sap_products.get(code) or {}).get("qty", 0.0) or 0.0)
            current_qty = float(StockQuant._get_available_quantity(prod, stock_location) or 0.0)
            if abs(current_qty - sap_qty) < 0.000001:
                continue
            diff = sap_qty - current_qty
            StockQuant._update_available_quantity(prod, stock_location, diff)
            updated |= prod
            _logger.info(
                "Stock actualizado code=%s id=%s Odoo=%s SAP=%s delta=%s wh=%s",
                code, prod.id, current_qty, sap_qty, diff, warehouse_code
            )
        return updated

    @api.model
    def _set_product_quantity(self, product, qty, stock_location):
        StockQuant = self.env["stock.quant"].sudo()
        current_qty = float(StockQuant._get_available_quantity(product, stock_location) or 0.0)
        if abs(current_qty - qty) < 0.000001:
            return
        diff = qty - current_qty
        StockQuant._update_available_quantity(product, stock_location, diff)
        _logger.info(
            "Stock inicial product_id=%s Odoo=%s Nuevo=%s delta=%s",
            product.id, current_qty, qty, diff
        )

    def sap_get_filters(self):
        TZ = pytz.timezone("America/Santo_Domingo")
        now = datetime.now(TZ)

        # DocDate: siempre hoy
        doc_date_str = now.strftime("%Y-%m-%d")

        # Inicio: ahora - 3h pero nunca antes de 00:00 de hoy
        three_hours_ago = now - timedelta(hours=3)
        start_dt = max(three_hours_ago, now.replace(hour=0, minute=0, second=0, microsecond=0))


        # Literales OData v2 para Edm.Time: time'PT{H}H{MM}M{SS}S'
        def to_odata_time_literal(t: time) -> str:
            return f"{t.hour:02d}:{t.minute:02d}:{t.second:02d}"

        start_time_literal = to_odata_time_literal(time(start_dt.hour, start_dt.minute, start_dt.second))

        # Filtros base (ajusta U_Orden_Real / CancelStatus según tu modelo)
        base_filters = [
            "U_Orden_Real ne null",
            "U_Orden_Real ne ''",
            "CancelStatus eq 'csNo'",
            f"DocDate eq '{doc_date_str}'",
            # f"DocTime ge {start_time_literal}",
            
        ]
        return " and ".join(base_filters)

    def get_sap_orders(self):
        try:
            authenticate_data = { "UserName": str(os.getenv('SAP_USER')), "Password": str(os.getenv('SAP_PASSWORD')), "CompanyDB": str(os.getenv('SAP_DB'))}
            authenticate_sap_endpoint_url = f"{str(os.getenv('HOST_SAP'))}/b1s/v2/Login"

            _logger.info(authenticate_sap_endpoint_url)
            _logger.info(json.dumps(authenticate_data))
            _logger.info("_________ step 1")
            responseAuthenticate = requests.post(url=authenticate_sap_endpoint_url, json=authenticate_data,  verify=False)
            _logger.info("_________ step 2")
            if responseAuthenticate.status_code != 200:
                raise ValidationError('La carga no pudo ser procesada debido a temas de authenticacion. \nCode: %s\nContent: %s' % (responseAuthenticate.status_code, responseAuthenticate.content))
            
            _logger.info("_________ step 3")
            auth_resp  = responseAuthenticate.json()
            headers = {
                "Cookie": f"B1SESSION={auth_resp['SessionId']}",
            }
            _logger.info("_________ step 6")

            odata_filter = self.sap_get_filters()

            invoice_sap_endpoint_url = f"{str(os.getenv('HOST_SAP'))}/b1s/v2/Invoices?$select=U_Orden_Real,DocEntry,DocNum,UpdateDate,DocDate&$filter={odata_filter}"

            _logger.info("_________ step 7")
            _logger.info("++++++++++++==")
            _logger.info(invoice_sap_endpoint_url)
            _logger.info(headers)
            response = requests.get(invoice_sap_endpoint_url, headers=headers,  verify=False )
            _logger.info("_________ step 8")
            invoice_data  = response.json()
            _logger.info("_________ step 9")
            _logger.info(invoice_data)
            return invoice_data
        except Exception as ex:
            _logger.info("__________________________ get_sap_orders ")
            _logger.info(ex)
            return False
