from werkzeug.urls import url_encode
from werkzeug.utils import redirect

from odoo.http import Controller, request, route


class DgiiReportsControllers(Controller):
    """Controlador DGII."""

    @route("/test", type="http", auth="public", csrf=False)
    def get_hello(self):
        return "¡Hola amigos!"

    @route("/dgii_reports", type="http", auth="user", csrf=False)
    def redirect_link(self, rnc=None, invoice_id=None, modify=None):
        """Este endpoint ayuda a redireccionar hacia la factura o el cliente."""
        url = "/web?#"
        record = False

        if rnc:
            record = request.env["res.partner"].search([("vat", "=", rnc)], limit=1)
        elif invoice_id and not modify:
            record = request.env["account.move"].browse(int(invoice_id))
        elif invoice_id and modify:
            # TODO: agregar lógica para buscar la factura modificadora
            pass

        if record and record.exists():
            action = record.get_access_action(access_uid=request.session.uid) or {}
            url_params = {
                "model": record._name,
                "action": action.get("id"),
            }

            if record.id:
                url_params.update({
                    "id": record.id,
                    "active_id": record.id,
                })

            view_id = record.get_formview_id(access_uid=request.session.uid)
            if view_id:
                url_params["view_id"] = view_id

            # Construye la URL con parámetros codificados
            url = "/web?#%s" % url_encode(url_params)

        # Redirecciona al usuario a la URL final
        return request.redirect(url)
