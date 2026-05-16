/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { ClientPrinter } from "./printer";

patch(PosStore.prototype, {
    create_printer(config) {
        if (config.printer_type === "windows") {
            const printer = new ClientPrinter({
                ip: config.ip_address,
                port: config.port,
                printer_name: config.name,
                pos: this // Pass POS instance to access services
            });
            printer.pos = this; // Ensure reference
            return printer;
        } else {
            return super.create_printer(...arguments);
        }
    },
});
