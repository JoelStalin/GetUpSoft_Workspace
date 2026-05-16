/** @odoo-module */

import { BasePrinter } from "@point_of_sale/app/printer/base_printer";

export class ClientPrinter extends BasePrinter {
    /**
     * @override
     */
    setup(params) {
        super.setup(...arguments);
        this.ip = params.ip;
        this.port = params.port || 8069;
        this.printer_name = params.printer_name;
        // In Odoo 17+, we can access services via the env if context is correct, 
        // or we expect the caller to pass usage of the service.
        // Ideally, the unified service handles the connection.
        // For simplicity, we'll access the registry or assume the service is available globally if needed,
        // but cleaner is to use the pos service's env.
    }

    getService() {
        // Accessing the service from the window/registry if not passed. 
        // NOTE: In strict OWL components we should use useService, but BasePrinter is a class.
        // We will relay on the PosStore to facilitate or use global registry as fallback if permitted.
        // A robust way in POS is checking `this.pos.env.services.local_printer_service` if `this.pos` is available.
        if (this.pos && this.pos.env && this.pos.env.services.local_printer_service) {
            return this.pos.env.services.local_printer_service;
        }
        // Fallback or throw
        console.error("Local Printer Service not available");
        return null;
    }

    /**
     * @override
     */
    openCashbox() {
        const service = this.getService();
        if (service) {
            return service.openCashbox(this.printer_name);
        }
        return Promise.resolve();
    }

    /**
     * @override
     */
    async sendPrintingJob(img) {
        const service = this.getService();
        if (service) {
            // img is typically a base64 string or DOM element in older Odoo. 
            // In Odoo 17 'img' in sendPrintingJob is often the receipt image result.
            // We'll assume it's the standard image data.
            return service.printReceiptImage(this.printer_name, {
                data: img,
                width: 0, // Agent should handle auto width
                height: 0
            });
        }
        return Promise.resolve(false);
    }
}
