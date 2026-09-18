/** @odoo-module **/

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

const localPrinterService = {
    dependencies: ['pos'], // Ensure POS service is available if needed, though mostly standalone
    start(env) {
        const state = reactive({
            online: false,
            printers: [],
        });

        const config = env.services.pos?.config || {};
        // Use configured URL or default to localhost default agent port
        const baseUrl = (
            config.local_printer_agent_url ||
            'http://127.0.0.1:9060'
        ).replace(/\/$/, '');

        const headers = () => ({});

        const getJSON = async (path, opts = {}) => {
            try {
                const res = await fetch(`${baseUrl}${path}`, {
                    ...opts,
                    headers: { 'Content-Type': 'application/json', ...headers() }
                });
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            } catch (error) {
                console.warn(`Local Printer Agent Error (${path}):`, error);
                throw error;
            }
        };

        const ping = async () => {
            try {
                await getJSON('/health');
                state.online = true;
            } catch {
                state.online = false;
            }
        };

        const refreshPrinters = async () => {
            try {
                const data = await getJSON('/printers');
                state.printers = data.printers || [];
            } catch (e) {
                state.printers = [];
            }
        };

        // Initial boot
        ping();
        refreshPrinters();
        setInterval(ping, 5000); // Ping every 5s

        return {
            state,
            async printReceipt(printerName, dataText) {
                const payload = { type: 'raw', printer: printerName, data: btoa(unescape(encodeURIComponent(dataText || ''))) };
                await getJSON('/print', { method: 'POST', body: JSON.stringify(payload) });
            },
            async printReceiptImage(printerName, imagePayload) {
                const payload = {
                    type: 'image',
                    printer: printerName,
                    data: imagePayload.data, // Base64 image data
                    mime: imagePayload.mime || 'image/png',
                    width: imagePayload.width,
                    height: imagePayload.height,
                };
                await getJSON('/print', { method: 'POST', body: JSON.stringify(payload) });
            },
            async openCashbox(printerName) {
                await getJSON('/cashbox', { method: 'POST', body: JSON.stringify({ printer: printerName }) });
            },
            async getPrinters() {
                await refreshPrinters();
                return state.printers;
            },
        };
    },
};

registry.category("services").add("local_printer_service", localPrinterService);
