# Copyright CEL
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

import logging
import re

from odoo import _, api, fields, models
from odoo.exceptions import UserError
from odoo.tools.float_utils import float_compare, float_is_zero, float_round

_logger = logging.getLogger(__name__)


class StockPicking(models.Model):
    """
    Extensión de stock.picking para empaquetar automáticamente las líneas
    en el número mínimo de cajas posible usando algoritmos de Bin Packing.
    """

    _inherit = "stock.picking"

    # -------------------------------------------------------------------------
    # CAMPOS
    # -------------------------------------------------------------------------

    package_type_id = fields.Many2one(
        comodel_name="stock.package.type",
        string="Tipo de paquete",
        help=(
            "Tipo de paquete a utilizar por defecto al empaquetar "
            "automáticamente este picking."
        ),
    )

    # -------------------------------------------------------------------------
    # ACCIÓN PÚBLICA: EMPAQUETAR PICKING EN CAJAS
    # -------------------------------------------------------------------------

    def action_pack_transfer_in_boxes(self, package_type_id=None):
        """
        Ejecuta bin packing (3D vs líquido) y crea los paquetes físicos con
        nombres secuenciales:

            [ORIGEN]-[NNN]

        ORIGEN = picking.origin o, si no hay, picking.name.
        """
        _logger.warning(
            "BIN PACKING >>> INICIO action_pack_transfer_in_boxes() para pickings %s con package_type_id=%s",
            self.ids,
            package_type_id,
        )
        results = []
        Package = self._get_package_model()

        for picking in self:
            _logger.info(
                "BIN PACKING >>> Procesando picking ID=%s, name=%s, state=%s",
                picking.id,
                picking.name,
                picking.state,
            )

            # Permitir empaquetar también cuando el picking está en "Listo"
            picking._autofill_qty_done_for_ready_state()

            # 1) Determinar tipos de paquete disponibles (multi-origen + TODAS las cajas)
            package_types = picking._get_available_package_types(
                package_type_id=package_type_id
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: tipos de paquete encontrados (ids)=%s",
                picking.name,
                package_types.ids,
            )

            package_types_data = picking._prepare_package_types_data_3d(
                package_types
            )
            _logger.debug(
                "BIN PACKING >>> Picking %s: package_types_data=%s",
                picking.name,
                package_types_data,
            )

            # 2) Filtrar move lines con qty_done > 0 y sin paquete
            move_lines_candidates = picking.move_line_ids.filtered(
                lambda ml: not ml.result_package_id
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: move_lines candidatas=%s (ids=%s)",
                picking.name,
                len(move_lines_candidates),
                move_lines_candidates.ids,
            )

            move_lines = move_lines_candidates.filtered(
                lambda ml: float_compare(
                    ml.qty_done,
                    0.0,
                    precision_rounding=ml.product_uom_id.rounding or 0.0001,
                )
                > 0
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: move_lines a empaquetar=%s (ids=%s)",
                picking.name,
                len(move_lines),
                move_lines.ids,
            )

            if not move_lines:
                _logger.warning(
                    "BIN PACKING >>> Picking %s: no hay cantidades hechas para empaquetar.",
                    picking.name,
                )
                results.append(
                    {
                        "picking_id": picking.id,
                        "package_ids": [],
                        "total_boxes": 0,
                    }
                )
                continue

            # 3) Preparar ítems con volumen, peso y dimensiones
            items = picking._prepare_items_for_bin_packing(
                move_lines, package_types_data
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: ítems preparados para bin packing=%s",
                picking.name,
                len(items),
            )
            _logger.debug(
                "BIN PACKING >>> Picking %s: detalle de ítems=%s",
                picking.name,
                items,
            )

            if not items:
                _logger.warning(
                    "BIN PACKING >>> Picking %s: no se generaron ítems a partir de las move lines.",
                    picking.name,
                )
                results.append(
                    {
                        "picking_id": picking.id,
                        "package_ids": [],
                        "total_boxes": 0,
                    }
                )
                continue

            # 4) Chequeo global: ¿algún ítem cabe en alguna caja? (3D)
            if not picking._exists_item_that_fits_any_package_3d(
                items, package_types_data
            ):
                _logger.error(
                    "BIN PACKING >>> Picking %s: ningún ítem cabe en ninguna caja disponible. Se lanza UserError.",
                    picking.name,
                )
                picking._raise_no_box_fits_any_item(items, package_types_data)

            # 5) Ejecutar método balanceado y escoger la mejor solución
            _logger.info(
                "BIN PACKING >>> Picking %s: iniciando cálculo de mejor solución BALANCEADA (3D/Líquido + multi-órdenes)",
                picking.name,
            )
            packages_data = picking._compute_best_packing_solution(
                items, package_types_data
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: solución seleccionada tiene %s paquetes",
                picking.name,
                len(packages_data),
            )

            # 6) Crear paquetes físicos CON BATCH CREATE + NOMBRE [ORIGEN]-[NNN]
            total_boxes = len(packages_data)
            if not total_boxes:
                results.append(
                    {
                        "picking_id": picking.id,
                        "package_ids": [],
                        "total_boxes": 0,
                    }
                )
                continue

            # Prefijo: origin o, si no hay, name
            origin = picking.origin or picking.name or ""
            names = picking._get_next_package_names_for_origin(
                origin, total_boxes
            )

            vals_list = []
            for package_data, name in zip(packages_data, names):
                create_vals = {
                    "package_type_id": package_data["package_type"].id,
                    # Nombre forzado según regla [ORIGEN]-[NNN]
                    "name": name,
                }
                # Campos críticos para evitar problemas en create masivo
                if "company_id" in Package._fields and picking.company_id:
                    create_vals["company_id"] = picking.company_id.id
                if "location_id" in Package._fields and picking.location_dest_id:
                    create_vals["location_id"] = picking.location_dest_id.id
                if (
                    "location_dest_id" in Package._fields
                    and picking.location_dest_id
                ):
                    create_vals["location_dest_id"] = picking.location_dest_id.id

                vals_list.append(create_vals)

            # BATCH CREATE
            created_packages = Package.create(vals_list)
            for package_data, package in zip(packages_data, created_packages):
                package_data["package"] = package

            _logger.info(
                "BIN PACKING >>> Picking %s: creados %s paquetes (ids=%s)",
                picking.name,
                len(created_packages),
                created_packages.ids,
            )

            # 7) Asignar ítems (move lines/trozos) a los paquetes
            _logger.info(
                "BIN PACKING >>> Picking %s: iniciando asignación de ítems a paquetes...",
                picking.name,
            )
            picking._assign_items_to_packages(packages_data)

            results.append(
                {
                    "picking_id": picking.id,
                    "package_ids": created_packages.ids,
                    "total_boxes": len(created_packages),
                }
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: empaquetado finalizado. total_boxes=%s, package_ids=%s",
                picking.name,
                len(created_packages),
                created_packages.ids,
            )

        _logger.warning(
            "BIN PACKING >>> FIN action_pack_transfer_in_boxes()  Resultados=%s",
            results,
        )
        return results

    # -------------------------------------------------------------------------
    # HELPER ORM: ÚLTIMO ÍNDICE PARA ORIGEN
    # -------------------------------------------------------------------------

    def _get_last_package_index_for_origin(self, origin):
        """
        Devuelve el último índice usado para paquetes con nombre:

            origin-XYZ

        donde XYZ es un número entero (1..n) con padding.

        Reglas:
        - Solo se usa el ORM para buscar paquetes con el prefijo dado.
        - El filtrado por regex se realiza en Python sobre los nombres obtenidos.
        - El parseo del sufijo se hace en Python, con fallback robusto.
        """
        self.ensure_one()
        if not origin:
            return 0

        Package = self._get_package_model()
        domain = [("name", "=like", f"{origin}-%")]
        candidates = Package.search(domain)

        regex = re.compile(rf"^{re.escape(origin)}-(\d+)$")
        indices = []
        for name in candidates.mapped("name"):
            match = regex.match(name or "")
            if not match:
                continue
            try:
                indices.append(int(match.group(1)))
            except (TypeError, ValueError):
                _logger.debug(
                    "BIN PACKING >>> _get_last_package_index_for_origin(): nombre de paquete inválido %s",
                    name,
                )
                continue

        return max(indices) if indices else 0

    def _get_next_package_names_for_origin(self, origin, count):
        """
        Devuelve una lista de `count` nombres secuenciales siguiendo:

            [ORIGEN]-[NNN]

        - ORIGEN = origin ó, si está vacío, picking.name.
        - Si no hay referencia alguna (caso extremo), genera nombres con
          picking.id para no romper el flujo.
        """
        self.ensure_one()
        count = int(count or 0)
        if count <= 0:
            return []

        if not origin:
            origin = self.name or ""
        if not origin:
            # Fallback extremo: usar el id del picking para al menos tener estabilidad
            origin = f"PICK-{self.id}"

        last_index = self._get_last_package_index_for_origin(origin)
        base = last_index + 1
        return [f"{origin}-{i:03d}" for i in range(base, base + count)]

    # -------------------------------------------------------------------------
    # HOOK DE AUTO-PACKING EN VALIDACIÓN DEL PICKING
    # -------------------------------------------------------------------------

    def button_validate(self):
        """
        Hook de autopack: antes de validar se intenta empaquetar el picking.

        - Se ejecuta SOLO si el contexto NO trae 'skip_bin_packing'.
        - Aplica a pickings que no estén en estado 'done' o 'cancel'.
        """
        _logger.info(
            "BIN PACKING >>> button_validate() llamado para pickings %s con contexto %s",
            self.ids,
            self.env.context,
        )
        if not self.env.context.get("skip_bin_packing"):
            to_pack = self.filtered(lambda p: p.state not in ("done", "cancel"))
            _logger.info(
                "BIN PACKING >>> button_validate(): se ejecutará autopack para pickings %s",
                to_pack.ids,
            )
            to_pack.action_pack_transfer_in_boxes()
        else:
            _logger.info(
                "BIN PACKING >>> button_validate(): skip_bin_packing=True, no se ejecuta autopack."
            )
        return super().button_validate()

    # -------------------------------------------------------------------------
    # HELPERS: RELLENAR qty_done PARA PICKING EN "LISTO"
    # -------------------------------------------------------------------------

    def _autofill_qty_done_for_ready_state(self):
        """
        Si el picking está en 'assigned' (Listo) y las qty_done están a 0,
        copiamos las cantidades reservadas o quantity para poder empaquetar.

        No cambia el estado del picking, solo qty_done.
        """
        for picking in self:
            _logger.debug(
                "BIN PACKING >>> _autofill_qty_done_for_ready_state() para picking %s (state=%s)",
                picking.name,
                picking.state,
            )
            if picking.state != "assigned":
                continue
            for ml in picking.move_line_ids:
                rounding = ml.product_uom_id.rounding or 0.0001
                if float_is_zero(
                    ml.qty_done, precision_rounding=rounding
                ):
                    quantity_field = None
                    # Odoo 18/19: 'quantity' es el campo principal de reserva
                    if hasattr(ml, "quantity") and float_compare(
                        ml.quantity,
                        0.0,
                        precision_rounding=rounding,
                    ) > 0:
                        quantity_field = "quantity"
                        value = ml.quantity
                    # Compatibilidad con versiones que usan reserved_uom_qty
                    elif hasattr(ml, "reserved_uom_qty") and float_compare(
                        ml.reserved_uom_qty,
                        0.0,
                        precision_rounding=rounding,
                    ) > 0:
                        quantity_field = "reserved_uom_qty"
                        value = ml.reserved_uom_qty
                    else:
                        continue

                    _logger.info(
                        "BIN PACKING >>> Picking %s: copiando %s=%s a qty_done en move_line %s",
                        picking.name,
                        quantity_field,
                        value,
                        ml.id,
                    )
                    ml.qty_done = value

    # -------------------------------------------------------------------------
    # HELPERS: TIPOS DE PAQUETE / MODELOS
    # -------------------------------------------------------------------------

    def _get_package_model(self):
        """
        Devuelve el modelo de paquetes disponible en la versión instalada.
        """
        _logger.debug("BIN PACKING >>> _get_package_model()")
        if "stock.package" in self.env:
            _logger.debug("BIN PACKING >>> usando modelo stock.package")
            return self.env["stock.package"]

        if "stock.quant.package" in self.env:
            _logger.debug("BIN PACKING >>> usando modelo stock.quant.package")
            return self.env["stock.quant.package"]

        _logger.error(
            "BIN PACKING >>> No se encontró ni stock.package ni stock.quant.package en el entorno."
        )
        raise UserError(
            _(
                "No se encontró un modelo de paquetes instalado "
                "(stock.package ni stock.quant.package). "
                "Verifica que los paquetes de inventario estén habilitados."
            )
        )

    def _get_available_package_types(self, package_type_id=None):
        """
        Obtiene la lista de tipos de paquete a evaluar para el picking.

        Reglas:
        - Filtra por compañía / activos.
        - SOLO devuelve tipos de paquete que tengan:
            * length_uom_name informado (no vacío),
            * packaging_length > 0,
            * width > 0,
            * height > 0.
        """
        self.ensure_one()
        PackageType = self.env["stock.package.type"]

        _logger.debug(
            "BIN PACKING >>> _get_available_package_types() para picking %s, package_type_id=%s",
            self.name,
            package_type_id,
        )

        # 1) Parámetro explícito
        if package_type_id:
            package_types = PackageType.browse(package_type_id)
        # 2) Tipo de paquete en el picking
        elif self.package_type_id:
            package_types = self.package_type_id
        else:
            package_types = PackageType.browse()

        # 3) Tipos de paquete provenientes de packaging de productos
        extra_package_types = PackageType.browse()
        if "move_line_ids" in self._fields:
            for ml in self.move_line_ids:
                product = ml.product_id
                if (
                    product
                    and "packaging_ids" in product._fields
                    and product.packaging_ids
                ):
                    packaging_with_type = product.packaging_ids.filtered(
                        lambda p: p.package_type_id
                    )
                    extra_package_types |= packaging_with_type.mapped(
                        "package_type_id"
                    )

        package_types |= extra_package_types

        # 4) Incluir todas las cajas activas de la compañía / globales
        domain = [
            "|",
            ("company_id", "=", False),
            ("company_id", "=", self.company_id.id),
        ]
        if "active" in PackageType._fields:
            domain.append(("active", "=", True))
        all_company_types = PackageType.search(domain)
        package_types |= all_company_types

        # Filtrar por compañía/activo
        package_types = package_types.filtered(
            lambda pt: not pt.company_id or pt.company_id == self.company_id
        )
        if "active" in PackageType._fields:
            package_types = package_types.filtered(lambda pt: pt.active)

        # 🔴 SOLO tipos con length_uom_name definido (no vacío)
        if "length_uom_name" in PackageType._fields:
            before_len = len(package_types)
            package_types = package_types.filtered(
                lambda pt: (pt.length_uom_name or "").strip()
            )
            _logger.info(
                "BIN PACKING >>> Picking %s: filtrados tipos sin length_uom_name, antes=%s, después=%s",
                self.name,
                before_len,
                len(package_types),
            )

        # 🔴 SOLO tipos con dimensiones (packaging_length, width, height > 0)
        def _has_dimensions(pt):
            # protegemos por si en algún entorno no existiera alguno
            length = getattr(pt, "packaging_length", 0.0) or 0.0
            width = getattr(pt, "width", 0.0) or 0.0
            height = getattr(pt, "height", 0.0) or 0.0
            return length > 0 and width > 0 and height > 0

        before_dim = len(package_types)
        package_types = package_types.filtered(_has_dimensions)
        _logger.info(
            "BIN PACKING >>> Picking %s: filtrados tipos sin dimensiones, antes=%s, después=%s",
            self.name,
            before_dim,
            len(package_types),
        )

        if not package_types:
            _logger.error(
                "BIN PACKING >>> Picking %s: no se encontraron tipos de paquete con dimensiones definidas.",
                self.name,
            )
            raise UserError(
                _(
                    "No se encontraron tipos de paquete con dimensiones definidas "
                    "para el picking %(picking)s. Revise los tipos de paquete "
                    "y asegúrese de que tengan longitud, ancho y altura.",
                )
                % {"picking": self.name}
            )

        _logger.info(
            "BIN PACKING >>> Picking %s: tipos de paquete finales=%s",
            self.name,
            package_types.ids,
        )
        return package_types

    # -------------------------------------------------------------------------
    # HELPERS: UNIDADES Y VOLUMEN DE CAJA (LxWxH + length_uom_name)
    # -------------------------------------------------------------------------

    def _get_length_unit_factor(self, package_type):
        """
        Devuelve el factor para convertir la longitud del tipo de paquete a metros.
        """
        uom_name = (getattr(package_type, "length_uom_name", "") or "").strip().lower()
        _logger.debug(
            "BIN PACKING >>> _get_length_unit_factor() para package_type=%s, length_uom_name=%s",
            package_type.display_name,
            uom_name,
        )

        if not uom_name:
            return 1000.0

        if "mm" in uom_name:
            return 1000.0
        if "centim" in uom_name or "cm" in uom_name:
            return 100.0
        if any(
            word in uom_name for word in ("meter", "meters", "metro", "metros")
        ) or uom_name == "m":
            return 1.0
        if "inch" in uom_name or uom_name in ("in", '"'):
            return 39.3701
        if any(
            word in uom_name for word in ("feet", "foot", "pies", "pie")
        ) or uom_name == "ft":
            return 3.28084

        _logger.warning(
            "BIN PACKING >>> length_uom_name '%s' no reconocido, se asume mm.",
            uom_name,
        )
        return 1000.0

    def _prepare_package_types_data_3d(self, package_types):
        """
        Prepara datos de cada tipo de paquete para Bin Packing 3D.

        Odoo 19:
        - Usa packaging_length, width, height
        - Convierte según length_uom_name
        """
        _logger.debug(
            "BIN PACKING >>> _prepare_package_types_data_3d() para tipos=%s",
            package_types.ids,
        )
        data = []
        for package_type in package_types:
            # Odoo 19: estos son los campos estándar de dimensiones
            length_raw = package_type.packaging_length or 0.0
            width_raw = package_type.width or 0.0
            height_raw = package_type.height or 0.0

            factor = self._get_length_unit_factor(package_type)
            dims_m = sorted(
                [
                    length_raw / factor,
                    width_raw / factor,
                    height_raw / factor,
                ]
            )
            volume = dims_m[0] * dims_m[1] * dims_m[2]

            _logger.debug(
                "BIN PACKING >>> package_type=%s dims(m)=%s volume=%s factor=%s",
                package_type.display_name,
                dims_m,
                volume,
                factor,
            )

            if float_is_zero(volume, precision_digits=6):
                raise UserError(
                    _(
                        "No es posible calcular el volumen de la caja para el tipo "
                        "de paquete %(package_type)s en el picking %(picking)s. "
                        "Revisa las dimensiones.",
                    )
                    % {
                        "package_type": package_type.display_name,
                        "picking": self.name,
                    }
                )

            data.append(
                {
                    "package_type": package_type,
                    "volume": volume,
                    "max_weight": package_type.max_weight or 10.0,
                    "dims_sorted": dims_m,
                }
            )

        data.sort(key=lambda d: d["volume"])
        _logger.debug(
            "BIN PACKING >>> package_types_data resultante=%s",
            data,
        )
        return data

    # -------------------------------------------------------------------------
    # HELPERS: DIMENSIONES DEL PRODUCTO
    # -------------------------------------------------------------------------

    def _get_product_dims_m(self, product, volume=None, length_factor=1.0):
        """
        Devuelve las dimensiones del producto en METROS como lista ordenada.
        """
        length_raw = (
            getattr(product, "packaging_length", None)
            or getattr(product, "length", 0.0)
            or 0.0
        )
        width_raw = (
            getattr(product, "packaging_width", None)
            or getattr(product, "width", 0.0)
            or 0.0
        )
        height_raw = (
            getattr(product, "packaging_height", None)
            or getattr(product, "height", 0.0)
            or 0.0
        )

        dims_raw = [length_raw, width_raw, height_raw]

        if any(dims_raw) and length_factor:
            dims = [(d or 0.0) / length_factor for d in dims_raw]
        else:
            dims = [0.0, 0.0, 0.0]

        if not any(dims) and volume and not float_is_zero(
            volume, precision_rounding=0.000001
        ):
            # Aproximamos un cubo con ese volumen (ya en m³)
            cube_side = volume ** (1.0 / 3.0)
            dims = [cube_side, cube_side, cube_side]

        dims_sorted = sorted(dims)
        _logger.debug(
            "BIN PACKING >>> _get_product_dims_m() product=%s dims_raw=%s length_factor=%s dims_sorted(m)=%s volumen=%s",
            product.display_name,
            dims_raw,
            length_factor,
            dims_sorted,
            volume,
        )
        return dims_sorted

    # -------------------------------------------------------------------------
    # PREPARACIÓN DE ÍTEMS PARA BIN PACKING
    # -------------------------------------------------------------------------

    def _prepare_items_for_bin_packing(self, move_lines, package_types_data):
        """
        Descompone las move lines en ítems mínimos para aplicar BFD.
        """
        _logger.debug(
            "BIN PACKING >>> _prepare_items_for_bin_packing() para move_lines=%s",
            move_lines.ids,
        )

        # Usamos el primer tipo de paquete como referencia de unidad de longitud
        if package_types_data:
            ref_type = package_types_data[0]["package_type"]
            length_factor = self._get_length_unit_factor(ref_type)
        else:
            # Fallback: asumimos metros
            length_factor = 1.0

        _logger.debug(
            "BIN PACKING >>> _prepare_items_for_bin_packing(): length_factor de referencia=%s",
            length_factor,
        )

        items = []
        for move_line in move_lines:
            product = move_line.product_id

            unit_volume = product.volume or 0.0  # m³ por unidad
            unit_weight = product.weight or 0.0  # kg por unidad
            rounding = move_line.product_uom_id.rounding or 1.0

            dims_sorted = self._get_product_dims_m(
                product, volume=unit_volume, length_factor=length_factor
            )
            max_dim = dims_sorted[-1] if dims_sorted else 0.0

            remaining_qty = move_line.qty_done
            _logger.debug(
                "BIN PACKING >>> Preparando ítems para move_line %s, qty_done=%s, rounding=%s",
                move_line.id,
                move_line.qty_done,
                rounding,
            )
            while float_compare(
                remaining_qty, 0.0, precision_rounding=rounding
            ) > 0:
                qty_to_pack = min(remaining_qty, rounding)
                item = {
                    "move_line": move_line,
                    "qty": qty_to_pack,
                    "volume": unit_volume * qty_to_pack,
                    "weight": unit_weight * qty_to_pack,
                    "dims_sorted": dims_sorted,
                    "max_dim": max_dim,
                }
                _logger.debug(
                    "BIN PACKING >>> Ítem generado: %s",
                    item,
                )
                items.append(item)
                remaining_qty = float_round(
                    remaining_qty - qty_to_pack, precision_rounding=rounding
                )

        items.sort(
            key=lambda it: (it["max_dim"], it["volume"], it["weight"]),
            reverse=True,
        )
        _logger.info(
            "BIN PACKING >>> Total ítems preparados=%s",
            len(items),
        )
        return items

    # -------------------------------------------------------------------------
    # CHEQUEO GLOBAL: ¿ALGÚN ITEM CABE EN ALGUNA CAJA? (3D)
    # -------------------------------------------------------------------------

    def _exists_item_that_fits_any_package_3d(self, items, package_types_data):
        """
        True si al menos un ítem cabe en algún tipo de caja (3D).
        """
        _logger.debug(
            "BIN PACKING >>> _exists_item_that_fits_any_package_3d(): items=%s, package_types=%s",
            len(items),
            len(package_types_data),
        )
        for item in items:
            for data in package_types_data:
                if self._item_fits_in_type(item, data, check_dimensions=True):
                    _logger.debug(
                        "BIN PACKING >>> Ítem %s cabe en tipo de caja %s",
                        item.get("move_line").id,
                        data["package_type"].id,
                    )
                    return True
        _logger.debug(
            "BIN PACKING >>> Ningún ítem cabe en ninguna caja (3D)"
        )
        return False

    def _raise_no_box_fits_any_item(self, items, package_types_data):
        """
        Caso extremo: ningún ítem cabe en ninguna caja.
        """
        _logger.error(
            "BIN PACKING >>> _raise_no_box_fits_any_item(): items=%s, package_types=%s",
            len(items),
            len(package_types_data),
        )

        # Volúmenes y pesos básicos
        max_item_volume = max((it.get("volume") or 0.0) for it in items) if items else 0.0
        max_item_weight = max((it.get("weight") or 0.0) for it in items) if items else 0.0
        avg_item_volume = (
            sum((it.get("volume") or 0.0) for it in items) / len(items)
        ) if items else 0.0

        suggested_weight = max_item_weight * 1.05 if max_item_weight else 0.0

        # Dimensiones máximas observadas (en metros) por eje
        max_dims_m = [0.0, 0.0, 0.0]  # [L, W, H]
        for it in items:
            dims = it.get("dims_sorted") or [0.0, 0.0, 0.0]
            for i in range(3):
                if dims[i] > max_dims_m[i]:
                    max_dims_m[i] = dims[i]

        margin_factor = 1.05  # +5% en cada eje

        if any(max_dims_m):
            dims_m = [d * margin_factor for d in max_dims_m]
            suggested_volume = dims_m[0] * dims_m[1] * dims_m[2]
        elif max_item_volume > 0.0:
            # Fallback: sin dimensiones, usamos cubo a partir del volumen máximo
            suggested_volume = max_item_volume * margin_factor
            edge_m = suggested_volume ** (1.0 / 3.0)
            dims_m = [edge_m, edge_m, edge_m]
        else:
            suggested_volume = 0.0
            dims_m = [0.04, 0.02, 0.02]  # 40x20x20 si factor=1000 (mm)

        package_type_sample = (
            package_types_data[0]["package_type"] if package_types_data else False
        )
        length_uom_name = (
            getattr(package_type_sample, "length_uom_name", "") if package_type_sample else ""
        ) or "mm"

        if package_type_sample:
            factor = self._get_length_unit_factor(package_type_sample)
        else:
            factor = 1000.0  # asumimos mm

        # Ordenamos para mostrar LxWxH consistente
        l_val, w_val, h_val = [d * factor for d in sorted(dims_m)]

        # Detalle de cajas disponibles
        box_lines = []
        for data in package_types_data:
            pt = data["package_type"]
            factor_pt = self._get_length_unit_factor(pt)
            dims_m_pt = data["dims_sorted"]
            dims_uom_pt = [d * factor_pt for d in dims_m_pt]
            box_lines.append(
                "  • %(name)s: %(l).1f x %(w).1f x %(h).1f %(uom)s "
                "(vol máx: %(vol).3f m³, peso máx: %(weight).3f kg)"
                % {
                    "name": pt.display_name,
                    "l": dims_uom_pt[0],
                    "w": dims_uom_pt[1],
                    "h": dims_uom_pt[2],
                    "uom": length_uom_name,
                    "vol": data["volume"],
                    "weight": data["max_weight"],
                }
            )

        boxes_text = "\n".join(box_lines) if box_lines else "  • (No hay cajas definidas)"

        raise UserError(
            _(
                "No hay caja con la dimensión correcta para estos paquetes "
                "en el picking %(picking)s.\n\n"
                "Sugerencia:\n"
                "- Defina un tipo de caja con al menos:\n"
                "  • Volumen mínimo (para el mayor producto): %(volume).3f m³\n"
                "  • Volumen medio actual de los ítems: %(avg_volume).3f m³\n"
                "  • Peso máximo: %(weight).3f kg\n"
                "  • Dimensiones mínimas aproximadas: %(l).1f x %(w).1f x %(h).1f %(uom)s\n\n"
                "Cajas evaluadas actualmente:\n"
                "%(boxes)s\n\n"
                "Las dimensiones sugeridas se calculan a partir del tamaño real de los productos "
                "(no solo su volumen), con un pequeño margen de seguridad."
            )
            % {
                "picking": self.display_name,
                "volume": suggested_volume,
                "avg_volume": avg_item_volume,
                "weight": suggested_weight,
                "l": l_val,
                "w": w_val,
                "h": h_val,
                "uom": length_uom_name,
                "boxes": boxes_text,
            }
        )

    # -------------------------------------------------------------------------
    # COORDINADOR BALANCEADO: VARIOS ÓRDENES + 3D vs LÍQUIDO
    # -------------------------------------------------------------------------

    def _compute_best_packing_solution(self, items, package_types_data):
        """
        Versión BALANCEADA del coordinador de Bin Packing.

        - Mantiene el algoritmo BFD clásico (_run_bfd).
        - Añade varios órdenes de ítems (multiheurística).
        - Para cada orden:
            * Calcula solución 3D.
            * Calcula solución líquida.
            * Se queda con la mejor de las dos (menos cajas).
        - Finalmente elige la mejor solución global:
            * Menos cajas.
            * En empate, mejor fill ratio promedio.
            * En doble empate, prefiere 3D.
        """
        _logger.debug(
            "BIN PACKING >>> _compute_best_packing_solution(BALANCED): items=%s, package_types=%s",
            len(items),
            len(package_types_data),
        )

        if not items:
            return []

        # Distintas permutaciones de orden de ítems
        item_orders = self._get_bfd_item_orders(items)

        best_solution = None
        best_is_3d = True  # para desempate final en igualdad absoluta

        for order_idx, ordered_items in enumerate(item_orders):
            _logger.debug(
                "BIN PACKING >>> BALANCED: ejecutando orden #%s con %s ítems",
                order_idx + 1,
                len(ordered_items),
            )

            # Solución 3D (volumen + peso + dimensiones)
            solution_3d = self._run_bfd(
                ordered_items, package_types_data, check_dimensions=True
            )

            # Solución líquida (volumen + peso)
            solution_liquid = self._run_bfd(
                ordered_items, package_types_data, check_dimensions=False
            )

            count_3d = len(solution_3d)
            count_liquid = len(solution_liquid)

            # Elegimos mejor de estas dos para este orden
            if count_liquid < count_3d:
                local_best = solution_liquid
                local_is_3d = False
            elif count_3d < count_liquid:
                local_best = solution_3d
                local_is_3d = True
            else:
                # Igual número de cajas: preferimos 3D
                local_best = solution_3d
                local_is_3d = True

            _logger.debug(
                "BIN PACKING >>> BALANCED: orden #%s -> 3D=%s cajas, líquido=%s cajas, "
                "local_best=%s cajas (modo=%s)",
                order_idx + 1,
                count_3d,
                count_liquid,
                len(local_best),
                "3D" if local_is_3d else "LÍQUIDO",
            )

            # Comparar con mejor solución global
            if best_solution is None:
                best_solution = local_best
                best_is_3d = local_is_3d
                continue

            if len(local_best) < len(best_solution):
                best_solution = local_best
                best_is_3d = local_is_3d
            elif len(local_best) == len(best_solution):
                # Empate en número de cajas -> comparar fill ratio
                local_fill = self._compute_average_fill_ratio(local_best)
                best_fill = self._compute_average_fill_ratio(best_solution)

                if local_fill > best_fill:
                    best_solution = local_best
                    best_is_3d = local_is_3d
                elif float_compare(
                    local_fill, best_fill, precision_rounding=0.000001
                ) == 0:
                    # Doble empate: preferimos 3D
                    if local_is_3d and not best_is_3d:
                        best_solution = local_best
                        best_is_3d = local_is_3d

        _logger.info(
            "BIN PACKING >>> BALANCED: mejor solución final = %s cajas (modo=%s)",
            len(best_solution or []),
            "3D" if best_is_3d else "LÍQUIDO",
        )
        return best_solution or []

    # -------------------------------------------------------------------------
    # HELPERS BALANCEADOS: ÓRDENES DE ÍTEMS Y FILL RATIO
    # -------------------------------------------------------------------------

    def _get_bfd_item_orders(self, items):
        """
        Devuelve varias listas ordenadas de ítems para probar diferentes
        heurísticas en BFD sin disparar el coste computacional.

        Cada ítem es un dict con:
          - 'volume'
          - 'weight'
          - 'max_dim'
          - 'move_line'
          - 'qty'

        Estrategia:
        - Orden 1: por volumen desc, luego max_dim desc, luego peso desc.
        - Orden 2: por max_dim desc, luego volumen desc, luego peso desc.
        - Orden 3: por peso desc, luego volumen desc, luego max_dim desc.

        Se limitan a 3 órdenes (suficiente mejora sin volverse caro).
        """
        if not items:
            return []

        def _order_by(*keys):
            return sorted(
                items,
                key=lambda it: tuple(
                    -float(it.get(k, 0.0)) for k in keys
                ),
            )

        orders = [
            _order_by("volume", "max_dim", "weight"),
            _order_by("max_dim", "volume", "weight"),
            _order_by("weight", "volume", "max_dim"),
        ]

        # Eliminar posibles duplicados si alguna orden coincide
        unique_orders = []
        seen_ids = set()
        for ordered in orders:
            # Firma simple basada en id(move_line)+qty para evitar repetir
            signature = tuple(
                (it["move_line"].id, float(it.get("qty", 0.0))) for it in ordered
            )
            if signature in seen_ids:
                continue
            seen_ids.add(signature)
            unique_orders.append(ordered)

        _logger.debug(
            "BIN PACKING >>> _get_bfd_item_orders(): generados %s órdenes únicos de ítems",
            len(unique_orders),
        )
        return unique_orders

    def _compute_average_fill_ratio(self, packages_data):
        """
        Calcula el fill ratio promedio de una solución de paquetes.

        Se espera cada elemento de packages_data con:
          - 'max_volume'
          - 'used_volume'
        """
        if not packages_data:
            return 0.0

        total_ratio = 0.0
        count = 0
        for pkg in packages_data:
            max_vol = pkg.get("max_volume") or 0.0
            used_vol = pkg.get("used_volume") or 0.0
            if float_compare(max_vol, 0.0, precision_rounding=0.000001) <= 0:
                continue
            total_ratio += used_vol / max_vol
            count += 1

        return (total_ratio / count) if count else 0.0

    # -------------------------------------------------------------------------
    # CORE BIN PACKING: BFD GENÉRICO (3D / LÍQUIDO)
    # -------------------------------------------------------------------------

    def _run_bfd(self, items, package_types_data, check_dimensions=True):
        """
        Ejecuta Best Fit Decreasing (BFD) devolviendo los paquetes resultantes.
        """
        mode = "3D" if check_dimensions else "LÍQUIDO"
        _logger.debug(
            "BIN PACKING >>> _run_bfd() modo=%s items=%s package_types=%s",
            mode,
            len(items),
            len(package_types_data),
        )
        packages = []
        for idx, item in enumerate(items):
            _logger.debug(
                "BIN PACKING >>> [%s] Procesando ítem en modo %s: %s",
                idx,
                mode,
                item,
            )
            best_package = None
            best_score = None

            # Intentar encajar en paquetes ya abiertos
            for pkg_idx, package in enumerate(packages):
                if not self._item_fits_in_package(
                    item, package, check_dimensions=check_dimensions
                ):
                    continue

                remaining_volume = package["max_volume"] - (
                    package["used_volume"] + item["volume"]
                )
                remaining_weight = package["max_weight"] - (
                    package["used_weight"] + item["weight"]
                )
                score = (remaining_volume, remaining_weight)

                _logger.debug(
                    "BIN PACKING >>> Ítem %s cabe en paquete[%s], score=%s",
                    idx,
                    pkg_idx,
                    score,
                )

                if best_score is None or score < best_score:
                    best_package = package
                    best_score = score

            # Si no cabe en ningún paquete abierto, abrimos uno nuevo
            if not best_package:
                _logger.debug(
                    "BIN PACKING >>> Ítem %s no cabe en paquetes existentes, se crea uno nuevo (modo=%s)",
                    idx,
                    mode,
                )
                if check_dimensions:
                    type_data = self._get_best_package_type_for_item_3d(
                        item, package_types_data
                    )
                else:
                    type_data = self._get_best_package_type_for_item_liquid(
                        item, package_types_data
                    )

                best_package = {
                    "package_type": type_data["package_type"],
                    "dims_sorted": type_data["dims_sorted"],
                    "max_volume": type_data["volume"],
                    "max_weight": type_data["max_weight"],
                    "used_volume": 0.0,
                    "used_weight": 0.0,
                    "items": [],
                    "package": None,
                }
                packages.append(best_package)

            # Añadimos el ítem al paquete elegido
            best_package["items"].append(item)
            best_package["used_volume"] += item["volume"]
            best_package["used_weight"] += item["weight"]

            _logger.debug(
                "BIN PACKING >>> Ítem %s asignado a paquete tipo=%s used_volume=%s used_weight=%s",
                idx,
                best_package["package_type"].display_name,
                best_package["used_volume"],
                best_package["used_weight"],
            )

        _logger.info(
            "BIN PACKING >>> _run_bfd() modo=%s: total paquetes=%s",
            mode,
            len(packages),
        )
        return packages

    def _item_fits_in_package(self, item, package, check_dimensions=True):
        """
        Comprueba si el ítem cabe en un paquete ya abierto.
        """
        if check_dimensions and not self._dims_fit(
            item["dims_sorted"], package["dims_sorted"]
        ):
            return False

        if float_compare(
            package["used_volume"] + item["volume"],
            package["max_volume"],
            precision_rounding=0.000001,
        ) > 0:
            return False

        if float_compare(
            package["used_weight"] + item["weight"],
            package["max_weight"],
            precision_rounding=0.000001,
        ) > 0:
            return False

        return True

    def _item_fits_in_type(self, item, type_data, check_dimensions=True):
        """
        Comprueba si el ítem cabe en un tipo de paquete concreto.
        """
        if check_dimensions:
            if not self._dims_fit(item["dims_sorted"], type_data["dims_sorted"]):
                return False

        if float_compare(
            item["volume"],
            type_data["volume"],
            precision_rounding=0.000001,
        ) > 0:
            return False

        if float_compare(
            item["weight"],
            type_data["max_weight"],
            precision_rounding=0.000001,
        ) > 0:
            return False

        return True

    def _dims_fit(self, item_dims, package_dims):
        """
        Evalúa si las dimensiones ordenadas del ítem caben en la caja.
        """
        return all(
            float_compare(it, box, precision_rounding=0.000001) <= 0
            for it, box in zip(item_dims, package_dims)
        )

    # -------------------------------------------------------------------------
    # SELECCIÓN DE TIPO DE CAJA (3D / LÍQUIDO) CON ERRORES INFORMATIVOS
    # -------------------------------------------------------------------------

    def _get_best_package_type_for_item_3d(self, item, package_types_data):
        """
        Elige el tipo de caja más ajustado que soporte el item (3D).
        """
        _logger.debug(
            "BIN PACKING >>> _get_best_package_type_for_item_3d() para item=%s",
            item,
        )
        for type_data in package_types_data:
            if self._item_fits_in_type(item, type_data, check_dimensions=True):
                _logger.debug(
                    "BIN PACKING >>> _get_best_package_type_for_item_3d(): item cabe en package_type=%s",
                    type_data["package_type"].id,
                )
                return type_data

        # Sin caja adecuada → mensaje informativo al usuario
        volume_m3 = item.get("volume", 0.0) or 0.0
        weight_kg = item.get("weight", 0.0) or 0.0

        package_type_sample = (
            package_types_data[0]["package_type"] if package_types_data else False
        )
        length_uom_name = (
            getattr(package_type_sample, "length_uom_name", "") if package_type_sample else ""
        ) or "mm"

        # Dimensiones del ítem con margen
        dims_item = item.get("dims_sorted") or [0.0, 0.0, 0.0]
        margin_factor = 1.05

        if any(dims_item):
            dims_m = [d * margin_factor for d in dims_item]
            suggested_volume = dims_m[0] * dims_m[1] * dims_m[2]
        elif volume_m3 > 0:
            suggested_volume = volume_m3 * margin_factor
            edge_m = suggested_volume ** (1.0 / 3.0)
            dims_m = [edge_m, edge_m, edge_m]
        else:
            suggested_volume = 0.0
            dims_m = [0.04, 0.02, 0.02]  # 40x20x20 (si factor=1000 -> mm)

        if package_type_sample:
            factor = self._get_length_unit_factor(package_type_sample)
        else:
            factor = 1000.0

        l_val, w_val, h_val = [d * factor for d in sorted(dims_m)]

        _logger.error(
            "BIN PACKING >>> _get_best_package_type_for_item_3d(): ningún tipo de caja soporta el item. "
            "volume=%s weight=%s dims_item=%s dims_sugeridas=%s",
            volume_m3,
            weight_kg,
            dims_item,
            dims_m,
        )

        raise UserError(
            _(
                "No hay caja con la dimensión correcta para el producto %(product)s.\n\n"
                "Sugerencia: defina un tipo de caja que pueda contener este producto, "
                "con dimensiones mínimas aproximadas de %(l).1f x %(w).1f x %(h).1f %(uom)s "
                "y un peso máximo de al menos %(weight).3f kg.\n\n"
                "Las dimensiones sugeridas se basan en el tamaño real del producto "
                "(o su volumen si no hay dimensiones definidas) con un pequeño margen."
            )
            % {
                "product": item["move_line"].product_id.display_name,
                "l": l_val,
                "w": w_val,
                "h": h_val,
                "uom": length_uom_name,
                "weight": weight_kg * margin_factor,
            }
        )

    def _get_best_package_type_for_item_liquid(self, item, package_types_data):
        """
        Versión "líquido": elige la caja más pequeña que cumpla:
        - volumen_caja >= volumen_item,
        - peso_max_caja >= peso_item.
        """
        _logger.debug(
            "BIN PACKING >>> _get_best_package_type_for_item_liquid() para item=%s",
            item,
        )
        for type_data in package_types_data:
            if float_compare(
                item["volume"], type_data["volume"], precision_digits=6
            ) > 0:
                continue
            if float_compare(
                item["weight"],
                type_data["max_weight"],
                precision_rounding=0.0001,
            ) > 0:
                continue
            _logger.debug(
                "BIN PACKING >>> _get_best_package_type_for_item_liquid(): item cabe en package_type=%s",
                type_data["package_type"].id,
            )
            return type_data

        _logger.warning(
            "BIN PACKING >>> _get_best_package_type_for_item_liquid(): ninguna caja cumple por volumen/peso, se delega a 3D."
        )
        return self._get_best_package_type_for_item_3d(item, package_types_data)

    # -------------------------------------------------------------------------
    # ASIGNACIÓN DE ÍTEMS A PAQUETES (MOVE LINES)
    # -------------------------------------------------------------------------

    def _assign_items_to_packages(self, packages_data):
        """
        Crea/ajusta las move lines asignando cantidades a cada paquete generado.
        """
        _logger.debug(
            "BIN PACKING >>> _assign_items_to_packages(): total paquetes=%s",
            len(packages_data),
        )
        MoveLine = self.env["stock.move.line"]
        for pkg_idx, package_data in enumerate(packages_data):
            package = package_data["package"]
            _logger.debug(
                "BIN PACKING >>> Procesando paquete[%s] ID=%s items=%s",
                pkg_idx,
                package.id,
                len(package_data["items"]),
            )
            for item in package_data["items"]:
                move_line = item["move_line"]
                qty = item["qty"]
                precision = move_line.product_uom_id.rounding or 0.0001

                _logger.debug(
                    "BIN PACKING >>> Asignando item a paquete %s: move_line=%s qty=%s qty_done=%s",
                    package.id,
                    move_line.id,
                    qty,
                    move_line.qty_done,
                )

                # Caso simple: la línea entera va al paquete
                if (
                    float_compare(
                        move_line.qty_done,
                        qty,
                        precision_rounding=precision,
                    )
                    == 0
                    and not move_line.result_package_id
                ):
                    _logger.debug(
                        "BIN PACKING >>> Se reutiliza move_line %s para paquete %s",
                        move_line.id,
                        package.id,
                    )
                    move_line.write({"result_package_id": package.id})
                    continue

                # Validación: no empaquetar más de lo hecho
                if float_compare(
                    move_line.qty_done,
                    qty,
                    precision_rounding=precision,
                ) < 0:
                    _logger.error(
                        "BIN PACKING >>> ERROR: qty a empaquetar (%s) > qty_done (%s) en move_line %s",
                        qty,
                        move_line.qty_done,
                        move_line.id,
                    )
                    raise UserError(
                        _(
                            "La cantidad a empaquetar supera la cantidad hecha de la línea %(line)s.",
                        )
                        % {"line": move_line.display_name}
                    )

                remaining_qty = float_round(
                    move_line.qty_done - qty, precision_rounding=precision
                )
                _logger.debug(
                    "BIN PACKING >>> Ajustando move_line %s: qty_done %s -> %s",
                    move_line.id,
                    move_line.qty_done,
                    remaining_qty,
                )
                move_line.write({"qty_done": remaining_qty})

                new_vals = move_line.copy_data()[0]
                new_vals.update(
                    {
                        "qty_done": qty,
                        "result_package_id": package.id,
                    }
                )
                # Odoo 18/19: si existe el campo 'quantity', lo sincronizamos con qty
                if "quantity" in MoveLine._fields:
                    new_vals["quantity"] = qty

                new_ml = MoveLine.create(new_vals)
                _logger.debug(
                    "BIN PACKING >>> Creada nueva move_line %s para paquete %s con qty=%s",
                    new_ml.id,
                    package.id,
                    qty,
                )
