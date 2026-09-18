# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2024-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Gokul P I (odoo@cybrosys.com)
#
#    This program is distributed under the terms of the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#############################################################################

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    order_status = fields.Selection(
        selection=[
            ("draft", "Draft"),
            ("waiting", "Cooking"),
            ("ready", "Ready"),
            ("cancel", "Cancel"),
        ],
        string="Order Status",
        default="draft",
        help="Current status of the order"
    )

    order_ref = fields.Char(
        string="Order Reference",
        help="Reference of the order"
    )

    is_cooking = fields.Boolean(
        string="Is Cooking",
        help="Indicates if the order is a kitchen order"
    )

    hour = fields.Char(
        string="Order Time",
        readonly=True,
        help="Time when the order was placed"
    )

    minutes = fields.Char(
        string="Order Duration",
        help="Duration of the order"
    )

    floor = fields.Char(
        string="Floor",
        help="Floor where the order is served"
    )

    def write(self, vals):
        """Override write method to handle order status updates."""
        if vals.get("state") == "paid" and self.order_status != "ready":
            vals["order_status"] = "waiting"

        message = {
            "res_model": self._name,
            "message": "pos_order_created"
        }
        self.env["bus.bus"]._sendone(
            "pos_order_created",
            "notification",
            message
        )

        return super(PosOrder, self).write(vals)

    @api.model_create_multi
    def create(self, vals_list):
        """Override create method to set order name and reference."""
        for vals in vals_list:
            pos_orders = self.search(
                [("pos_reference", "=", vals.get("pos_reference"))]
            )
            if pos_orders:
                continue

            if not vals.get("name"):
                vals["name"] = self.env["ir.sequence"].next_by_code(
                    "pos.order.line"
                ) or "/"

            if vals.get("order_id"):
                config = self.env["pos.order"].browse(
                    vals["order_id"]
                ).session_id.config_id
                if config.sequence_line_id:
                    vals["name"] = config.sequence_line_id._next()

        records = super(PosOrder, self).create(vals_list)

        message = {
            "res_model": self._name,
            "message": "pos_order_created"
        }
        self.env["bus.bus"]._sendone(
            "pos_order_created",
            "notification",
            message
        )
        return records

    def get_details(self, shop_id, order=None):
        """Get kitchen order details for the cook."""
        if order:
            existing_order = self.search(
                [("pos_reference", "=", order[0]["pos_reference"])]
            )
            if existing_order:
                existing_order.write(order[0])
            else:
                self.create(order)

        kitchen_screen = self.env["kitchen.screen"].sudo().search(
            [("pos_config_id", "=", shop_id)]
        )

        pos_orders = self.env["pos.order.line"].search([
            ("is_cooking", "=", True),
            ("product_id.pos_categ_ids", "in", kitchen_screen.pos_categ_ids.ids)
        ])

        orders = self.search([
            ("lines", "in", pos_orders.ids)
        ])

        values = {
            "orders": orders.read(),
            "order_lines": pos_orders.read(),
        }

        return values

    def action_pos_order_paid(self):
        """Set order status to ready when paid."""
        res = super(PosOrder, self).action_pos_order_paid()

        kitchen_screen = self.env["kitchen.screen"].search(
            [("pos_config_id", "=", self.config_id.id)]
        )
        if kitchen_screen:
            self.lines.write({"is_cooking": True})
            self.is_cooking = True
            self.order_ref = self.name

        return res

    @api.onchange("order_status")
    def _onchange_order_status(self):
        """Set cooking status based on order status."""
        if self.order_status == "ready":
            self.is_cooking = False


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    order_status = fields.Selection(
        selection=[
            ("draft", "Draft"),
            ("waiting", "Cooking"),
            ("ready", "Ready"),
            ("cancel", "Cancel"),
        ],
        string="Order Status",
        default="draft",
        help="Status of the order line"
    )

    order_ref = fields.Char(
        related="order_id.order_ref",
        string="Order Reference",
        help="Reference of the order"
    )

    is_cooking = fields.Boolean(
        string="Cooking",
        default=False,
        help="Indicates if the line is part of a kitchen order"
    )

    customer_id = fields.Many2one(
        "res.partner",
        string="Customer",
        related="order_id.partner_id",
        help="Customer who placed the order"
    )

    def get_product_details(self, ids):
        """Get product details from POS order."""
        lines = self.browse(ids)
        return [{
            "product_id": line.product_id.id,
            "name": line.product_id.name,
            "qty": line.qty
        } for line in lines]

    def order_progress_change(self):
        """Toggle order line status."""
        self.order_status = (
            "waiting" if self.order_status == "ready" else "ready"
        )

