```python
# Copyright CEL
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

import logging

from odoo import _, api, fields, models
from odoo.exceptions import UserError
from odoo.tools.float_utils import float_compare, float_is_zero

_logger = logging.getLogger(__name__)


class StockPicking(models.Model):
    """
    Extensión de stock.picking para empaquetar automáticamente las líneas
    en el número mínimo de cajas posible usando algoritmos de Bin Packing.

    Algoritmos:
    - Método 3D: Best Fit Decreasing (BFD) con:
        * Volumen (m³),
        * Peso (kg),
        * Dimensiones (LxWxH) con rotación simplificada.
    - Método “líquido”: BFD con:
        * Volumen (m³),
        * Peso (kg),
        * Ignora dimensiones (asume productos "líquidos").

    Estrategia final:
    - Se calculan ambos empaquetados (3D y líquido).
    - Se compara el número de cajas de cada uno.
    - Se elige el que use MENOS cajas.
      En caso de empate, se prefiere el método 3D (más realista físicamente).

    CLEAN CODE:
    - Helpers para cada responsabilidad.
    - Sin SQL directo, solo ORM.
    - Mensajes de error claros al usuario.
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
        Para cada picking de self:
        - Toma las move lines con qty_done > 0 y sin paquete.
        - Descompone en ítems mínimos con volumen, peso y dimensiones.
        - Ejecuta DOS algoritmos de Bin Packing:
            * BFD 3D (volumen + peso + dimensiones),
            * BFD líquido (volumen + peso).
        - Compara el número de cajas de cada solución.
        - Usa la solución que tenga MENOS cajas.
          (En empate, se queda con la solución 3D por seguridad física.)

        ADVERTENCIAS:
        - Si no hay cajas parametrizadas → error.
        - Si ningún producto cabe en ninguna caja → error con sugerencia de
          volumen, peso y dimensiones mínimas (ejemplo: 40x20x20).
        - Si un producto concreto es más grande que todas las cajas →
          error indicando el producto y caja sugerida.
        """
        results = []
        Package = self._get_package_model()

        for picking in self:
            # 1) Determinar tipos de paquete disponibles
            package_types = picking._get_available_package_types(
                package_type_id=package_type_id
            )
            package_types_data = picking._prepare_package_types_data_3d(package_types)

            # 2) Filtrar move lines con qty_done > 0 y sin paquete
            move_lines = picking.move_line_ids.filtered(
                lambda ml: float_compare(
                    ml.qty_done,
                    0.0,
                    precision_rounding=ml.product_uom_id.rounding or 0.0001,
                )
                > 0
                and not ml.result_package_id
            )
            if not move_lines:
                _logger.info(
                    "No hay cantidades hechas para empaquetar en el picking %s",
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
            items = picking._prepare_items_for_bin_packing(move_lines)
            if not items:
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
                picking._raise_no_box_fits_any_item(items, package_types_data)

            # 5) Ejecutar ambos métodos y escoger el mejor (menos cajas)
            packages_data = picking._compute_best_packing_solution(
                items, package_types_data
            )

            # 6) Crear paquetes físicos
            for package_data in packages_data:
                create_vals = {
                    "package_type_id": package_data["package_type"].id,
                }
                if "company_id" in Package._fields:
                    create_vals["company_id"] = picking.company_id.id
                if "location_id" in Package._fields and picking.location_dest_id:
                    create_vals["location_id"] = picking.location_dest_id.id

                package = Package.create(create_vals)
                package_data["package"] = package

            # 7) Asignar ítems (move lines/trozos) a los paquetes
            picking._assign_items_to_packages(packages_data)

            results.append(
                {
                    "picking_id": picking.id,
                    "package_ids": [pkg["package"].id for pkg in packages_data],
                    "total_boxes": len(packages_data),
                }
            )

        return results

    # -------------------------------------------------------------------------
    # HOOK DE AUTO-PACKING EN VALIDACIÓN DEL PICKING
    # -------------------------------------------------------------------------

    def button_validate(self):
        """
        Hook de autopack: antes de validar se intenta empaquetar el picking.

        - Se ejecuta SOLO si el contexto NO trae 'skip_bin_packing'.
        - Aplica a pickings que no estén en estado 'done' o 'cancel'.
        """
        if not self.env.context.get("skip_bin_packing"):
            self.filtered(
                lambda p: p.state not in ("done", "cancel")
            ).action_pack_transfer_in_boxes()
        return super().button_validate()

    # -------------------------------------------------------------------------
    # HELPERS: TIPOS DE PAQUETE / MODELOS
    # -------------------------------------------------------------------------

    def _get_available_package_types(self, package_type_id=None):
        """
        Obtiene la lista de tipos de paquete a evaluar para el picking.

        Prioridad:
        1) package_type_id forzado por parámetro.
        2) package_type_id en el picking.
        3) Tipos de paquete vinculados a packaging de los productos del picking.
        4) Todos los tipos activos de la compañía (o sin compañía).
        """
        self.ensure_one()
        PackageType = self.env["stock.package.type"]

        if package_type_id:
            package_types = PackageType.browse(package_type_id)
        elif self.package_type_id:
            package_types = self.package_type_id
        else:
            package_types = PackageType.browse()

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

        if extra_package_types:
            package_types |= extra_package_types

        if not package_types:
            domain = [
                "|",
                ("company_id", "=", False),
                ("company_id", "=", self.company_id.id),
            ]
            if "active" in PackageType._fields:
                domain.append(("active", "=", True))
            package_types = PackageType.search(domain)
        else:
            package_types = package_types.filtered(
                lambda pt: not pt.company_id or pt.company_id == self.company_id
            )
            if "active" in PackageType._fields:
                package_types = package_types.filtered(lambda pt: pt.active)

        if not package_types:
            raise UserError(
                _(
                    "No se encontraron tipos de paquete disponibles para el picking %(picking)s.",
                )
                % {"picking": self.name}
            )
        return package_types

    def _get_package_model(self):
        """
        Devuelve el modelo de paquetes disponible en la versión instalada.
        """
        if "stock.package" in self.env:
            return self.env["stock.package"]

        if "stock.quant.package" in self.env:
            return self.env["stock.quant.package"]

        raise UserError(
            _(
                "No se encontró un modelo de paquetes instalado "
                "(stock.package ni stock.quant.package). "
                "Verifica que los paquetes de inventario estén habilitados."
            )
        )

    # -------------------------------------------------------------------------
    # HELPERS: UNIDADES Y VOLUMEN DE CAJA (LxWxH + length_uom_name)
    # -------------------------------------------------------------------------

    def _get_length_unit_factor(self, package_type):
        """
        Devuelve el factor para convertir la longitud del tipo de paquete a metros.

        Usa length_uom_name de stock.package.type:
            - 'mm'  -> 1000.0
            - 'cm'  -> 100.0
            - 'm'   -> 1.0
            - 'inch'/'in' -> 39.3701
            - 'ft'/'feet' -> 3.28084
        """
        uom_name = (getattr(package_type, "length_uom_name", "") or "").strip().lower()

        if not uom_name:
            return 1000.0

        if "mm" in uom_name:
            return 1000.0
        if "centim" in uom_name or "cm" in uom_name:
            return 100.0
        if any(word in uom_name for word in ("meter", "meters", "metro", "metros")) or uom_name == "m":
            return 1.0
        if "inch" in uom_name or uom_name in ("in", '"'):
            return 39.3701
        if any(word in uom_name for word in ("feet", "foot", "pies", "pie")) or uom_name == "ft":
            return 3.28084

        return 1000.0

    def _prepare_package_types_data_3d(self, package_types):
        """
        Prepara datos de cada tipo de paquete para Bin Packing 3D:

        - dims_sorted: [lado_corto, lado_medio, lado_largo] en metros.
        - volume: volumen en m³ (producto de las dimensiones).
        - max_weight: peso máximo (kg), por defecto 10 si no está definido.

        Ordena las cajas por volumen ascendente.
        """
        data = []
        for package_type in package_types:
            x_raw = (
                getattr(package_type, "x", None)
                or getattr(package_type, "length", None)
                or getattr(package_type, "packaging_length", 0.0)
                or 0.0
            )
            y_raw = (
                getattr(package_type, "y", None)
                or getattr(package_type, "width", None)
                or getattr(package_type, "packaging_width", 0.0)
                or 0.0
            )
            z_raw = (
                getattr(package_type, "z", None)
                or getattr(package_type, "height", None)
                or getattr(package_type, "packaging_height", 0.0)
                or 0.0
            )

            factor = self._get_length_unit_factor(package_type)
            dims_m = sorted(
                [
                    (x_raw or 0.0) / factor,
                    (y_raw or 0.0) / factor,
                    (z_raw or 0.0) / factor,
                ]
            )
            volume = dims_m[0] * dims_m[1] * dims_m[2]

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
        return data

    # -------------------------------------------------------------------------
    # HELPERS: DIMENSIONES DEL PRODUCTO
    # -------------------------------------------------------------------------

    def _get_product_dims_m(self, product):
        """
        Devuelve las dimensiones del producto en metros como lista ordenada
        [lado_corto, lado_medio, lado_largo].

        Si no existen campos length/width/height, devolvemos [0, 0, 0].
        """
        length = getattr(product, "length", 0.0) or 0.0
        width = getattr(product, "width", 0.0) or 0.0
        height = getattr(product, "height", 0.0) or 0.0

        dims = [length, width, height]
        dims_sorted = sorted(dims)
        return dims_sorted

    # -------------------------------------------------------------------------
    # PREPARACIÓN DE ÍTEMS PARA BIN PACKING
    # -------------------------------------------------------------------------

    def _prepare_items_for_bin_packing(self, move_lines):
        """
        Descompone las move lines en ítems mínimos para aplicar BFD.

        Cada ítem:
            {
                'move_line': ml,
                'qty': cantidad_del_item,
                'volume': volumen_total_en_m3,
                'weight': peso_total_en_kg,
                'dims_sorted': [lado_corto, lado_medio, lado_largo],
                'max_dim': lado_largo,
            }
        """
        items = []
        for move_line in move_lines:
            product = move_line.product_id

            unit_volume = product.volume or 0.0
            unit_weight = product.weight or 0.0
            rounding = move_line.product_uom_id.rounding or 1.0

            dims_sorted = self._get_product_dims_m(product)
            max_dim = dims_sorted[-1] if dims_sorted else 0.0

            remaining_qty = move_line.qty_done
            while float_compare(
                remaining_qty, 0.0, precision_rounding=rounding
            ) > 0:
                qty_to_pack = min(remaining_qty, rounding)
                items.append(
                    {
                        "move_line": move_line,
                        "qty": qty_to_pack,
                        "volume": unit_volume * qty_to_pack,
                        "weight": unit_weight * qty_to_pack,
                        "dims_sorted": dims_sorted,
                        "max_dim": max_dim,
                    }
                )
                remaining_qty -= qty_to_pack

        items.sort(
            key=lambda it: (it["max_dim"], it["volume"], it["weight"]),
            reverse=True,
        )
        return items

    # -------------------------------------------------------------------------
    # CHEQUEO GLOBAL: ¿ALGÚN ITEM CABE EN ALGUNA CAJA? (3D)
    # -------------------------------------------------------------------------

    def _exists_item_that_fits_any_package_3d(self, items, package_types_data):
        """
        True si al menos un ítem cabe en algún tipo de caja (3D).
        """
        for item in items:
            for data in package_types_data:
                if self._item_fits_type_3d(item, data):
                    return True
        return False

    def _item_fits_type_3d(self, item, type_data):
        """
        Chequea si un item cabe en un tipo de caja (no caja concreta).
        """
        if float_compare(
            item["volume"], type_data["volume"], precision_digits=6
        ) > 0:
            return False
        if float_compare(
            item["weight"], type_data["max_weight"], precision_rounding=0.0001
        ) > 0:
            return False

        i_dims = item["dims_sorted"]
        b_dims = type_data["dims_sorted"]
        if float_is_zero(sum(i_dims), precision_digits=6):
            return True

        return (
            i_dims[0] <= b_dims[0]
            and i_dims[1] <= b_dims[1]
            and i_dims[2] <= b_dims[2]
        )

    def _raise_no_box_fits_any_item(self, items, package_types_data):
        """
        Caso extremo: ningún ítem cabe en ninguna caja.
        Sugiere volumen, peso y dimensiones mínimas (ej. 40x20x20).
        """
        max_item_volume = max(it["volume"] for it in items) if items else 0.0
        max_item_weight = max(it["weight"] for it in items) if items else 0.0

        suggested_volume = max_item_volume * 1.05
        suggested_weight = max_item_weight * 1.05

        package_type_sample = (
            package_types_data[0]["package_type"] if package_types_data else False
        )
        length_uom_name = (
            getattr(package_type_sample, "length_uom_name", "") if package_type_sample else ""
        ) or "mm"

        if suggested_volume > 0:
            edge_m = suggested_volume ** (1.0 / 3.0)
            if package_type_sample:
                factor = self._get_length_unit_factor(package_type_sample)
            else:
                factor = 1000.0
            edge_uom = edge_m * factor
            l_val = w_val = h_val = edge_uom
        else:
            l_val, w_val, h_val = 40.0, 20.0, 20.0

        raise UserError(
            _(
                "No hay caja con la dimensión correcta para estos paquetes "
                "en el picking %(picking)s.

"
                "Sugerencia:
"
                "- Defina un tipo de caja con al menos:
"
                "  • Volumen: %(volume).3f m³
"
                "  • Peso máximo: %(weight).3f kg
"
                "  • Dimensiones mínimas aproximadas: %(l).1f x %(w).1f x %(h).1f %(uom)s

"
                "Por ejemplo, puede usar una caja de referencia de 40 x 20 x 20 "
                "en la unidad de longitud configurada."
            )
            % {
                "picking": self.display_name,
                "volume": suggested_volume,
                "weight": suggested_weight,
                "l": l_val,
                "w": w_val,
                "h": h_val,
                "uom": length_uom_name,
            }
        )

    # -------------------------------------------------------------------------
    # COORDINADOR: EVALUAR DOS MÉTODOS Y ESCOGER EL MEJOR
    # -------------------------------------------------------------------------

    def _compute_best_packing_solution(self, items, package_types_data):
        """
        Ejecuta los dos métodos de Bin Packing:

        - Método 3D (volumen + peso + dimensiones).
        - Método líquido (solo volumen + peso).

        Devuelve la solución que use MENOS cajas.
        En caso de empate, prefiere el método 3D.
        """
        # Método 3D
        packages_3d = self._run_best_fit_decreasing_3d(items, package_types_data)
        count_3d = len(packages_3d)

        # Método líquido
        packages_liquid = self._run_best_fit_decreasing_liquid(items, package_types_data)
        count_liquid = len(packages_liquid)

        _logger.info(
            "Comparando soluciones de Bin Packing para picking %s: "
            "3D=%s cajas, líquido=%s cajas",
            self.name,
            count_3d,
            count_liquid,
        )

        if count_liquid < count_3d:
            # Menos cajas con método líquido (más agresivo en volumen)
            return packages_liquid

        # En empate o si el 3D es mejor, quedarse con la solución 3D (más realista)
        return packages_3d

    # -------------------------------------------------------------------------
    # CORE BIN PACKING: MÉTODO 3D (BFD)
    # -------------------------------------------------------------------------

    def _run_best_fit_decreasing_3d(self, items, package_types_data):
        """
        BFD considerando volumen, peso y dimensiones máximas de caja (3D).
        """
        packages = []
        for item in items:
            best_pkg = None
            best_waste = None

            for pkg in packages:
                if self._item_fits_in_package_3d(item, pkg):
                    waste = pkg["remaining_volume"] - item["volume"]
                    if best_waste is None or waste < best_waste:
                        best_waste = waste
                        best_pkg = pkg

            if best_pkg:
                best_pkg["remaining_volume"] -= item["volume"]
                best_pkg["remaining_weight"] -= item["weight"]
                best_pkg["items"].append(item)
            else:
                type_data = self._get_best_package_type_for_item_3d(
                    item, package_types_data
                )
                packages.append(
                    {
                        "package_type": type_data["package_type"],
                        "remaining_volume": type_data["volume"] - item["volume"],
                        "remaining_weight": type_data["max_weight"] - item["weight"],
                        "dims_sorted": type_data["dims_sorted"],
                        "items": [item],
                        "package": None,
                    }
                )
        return packages

    def _item_fits_in_package_3d(self, item, package_data):
        """
        Chequea si un item cabe en una caja ya creada (3D).
        """
        precision = 10**-6

        if (
            package_data["remaining_volume"] + precision < item["volume"]
            or package_data["remaining_weight"] + precision < item["weight"]
        ):
            return False

        i_dims = item["dims_sorted"]
        b_dims = package_data["dims_sorted"]
        if float_is_zero(sum(i_dims), precision_digits=6):
            return True

        return (
            i_dims[0] <= b_dims[0]
            and i_dims[1] <= b_dims[1]
            and i_dims[2] <= b_dims[2]
        )

    def _get_best_package_type_for_item_3d(self, item, package_types_data):
        """
        Elige el tipo de caja más ajustado que soporte el item (3D).
        """
        for type_data in package_types_data:
            if self._item_fits_type_3d(item, type_data):
                return type_data

        # Sin caja adecuada → mensaje informativo al usuario
        volume_m3 = item.get("volume", 0.0)
        weight_kg = item.get("weight", 0.0)

        package_type_sample = (
            package_types_data[0]["package_type"] if package_types_data else False
        )
        length_uom_name = (
            getattr(package_type_sample, "length_uom_name", "") if package_type_sample else ""
        ) or "mm"

        if volume_m3 > 0:
            suggested_volume = volume_m3 * 1.05
            edge_m = suggested_volume ** (1.0 / 3.0)
            if package_type_sample:
                factor = self._get_length_unit_factor(package_type_sample)
            else:
                factor = 1000.0
            edge_uom = edge_m * factor
            l_val = w_val = h_val = edge_uom
        else:
            l_val, w_val, h_val = 40.0, 20.0, 20.0

        raise UserError(
            _(
                "No hay caja con la dimensión correcta para el producto %(product)s.

"
                "Sugerencia: defina un tipo de caja que pueda contener este producto, "
                "con dimensiones mínimas aproximadas de %(l).1f x %(w).1f x %(h).1f %(uom)s "
                "y un peso máximo de al menos %(weight).3f kg.

"
                "Por ejemplo, puede utilizar una caja de referencia de 40 x 20 x 20 "
                "en la unidad de longitud configurada."
            )
            % {
                "product": item["move_line"].product_id.display_name,
                "l": l_val,
                "w": w_val,
                "h": h_val,
                "uom": length_uom_name,
                "weight": weight_kg * 1.05,
            }
        )

    # -------------------------------------------------------------------------
    # CORE BIN PACKING: MÉTODO “LÍQUIDO” (BFD solo volumen + peso)
    # -------------------------------------------------------------------------

    def _run_best_fit_decreasing_liquid(self, items, package_types_data):
        """
        BFD simplificado: solo volumen + peso, IGNORA dimensiones.

        Se usa para comparar contra el 3D y elegir la solución con menos cajas.
        """
        packages = []
        for item in items:
            best_pkg = None
            best_waste = None

            for pkg in packages:
                if self._item_fits_in_package_liquid(item, pkg):
                    waste = pkg["remaining_volume"] - item["volume"]
                    if best_waste is None or waste < best_waste:
                        best_waste = waste
                        best_pkg = pkg

            if best_pkg:
                best_pkg["remaining_volume"] -= item["volume"]
                best_pkg["remaining_weight"] -= item["weight"]
                best_pkg["items"].append(item)
            else:
                type_data = self._get_best_package_type_for_item_liquid(
                    item, package_types_data
                )
                packages.append(
                    {
                        "package_type": type_data["package_type"],
                        "remaining_volume": type_data["volume"] - item["volume"],
                        "remaining_weight": type_data["max_weight"] - item["weight"],
                        "dims_sorted": type_data["dims_sorted"],
                        "items": [item],
                        "package": None,
                    }
                )
        return packages

    def _item_fits_in_package_liquid(self, item, package_data):
        """
        Versión "líquido": solo valida volumen y peso restante.
        No verifica dimensiones.
        """
        precision = 10**-6
        return (
            package_data["remaining_volume"] + precision >= item["volume"]
            and package_data["remaining_weight"] + precision >= item["weight"]
        )

    def _get_best_package_type_for_item_liquid(self, item, package_types_data):
        """
        Versión "líquido": elige la caja más pequeña que cumpla:
        - volumen_caja >= volumen_item,
        - peso_max_caja >= peso_item.
        """
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
            return type_data

        # Si ninguna caja cumple por volumen/peso, reusamos el error del método 3D
        return self._get_best_package_type_for_item_3d(item, package_types_data)

    # -------------------------------------------------------------------------
    # ASIGNACIÓN DE ÍTEMS A PAQUETES (MOVE LINES)
    # -------------------------------------------------------------------------

    def _assign_items_to_packages(self, packages_data):
        """
        Crea/ajusta las move lines asignando cantidades a cada paquete generado.
        """
        MoveLine = self.env["stock.move.line"]
        for package_data in packages_data:
            package = package_data["package"]
            for item in package_data["items"]:
                move_line = item["move_line"]
                qty = item["qty"]
                precision = move_line.product_uom_id.rounding or 0.0001

                if (
                    float_compare(
                        move_line.qty_done,
                        qty,
                        precision_rounding=precision,
                    )
                    == 0
                    and not move_line.result_package_id
                ):
                    move_line.write({"result_package_id": package.id})
                    continue

                if float_compare(
                    move_line.qty_done,
                    qty,
                    precision_rounding=precision,
                ) < 0:
                    raise UserError(
                        _(
                            "La cantidad a empaquetar supera la cantidad hecha de la línea %(line)s.",
                        )
                        % {"line": move_line.display_name}
                    )

                remaining_qty = move_line.qty_done - qty
                move_line.write({"qty_done": remaining_qty})

                MoveLine.create(
                    {
                        "move_id": move_line.move_id.id,
                        "product_id": move_line.product_id.id,
                        "product_uom_id": move_line.product_uom_id.id,
                        "product_uom_qty": qty,
                        "qty_done": qty,
                        "picking_id": move_line.picking_id.id,
                        "location_id": move_line.location_id.id,
                        "location_dest_id": move_line.location_dest_id.id,
                        "lot_id": move_line.lot_id.id,
                        "package_id": move_line.package_id.id,
                        "result_package_id": package.id,
                        "owner_id": move_line.owner_id.id,
                    }
                )

```