/** @odoo-module **/

import { BasePrinter } from "@point_of_sale/app/printer/base_printer";
import { useService } from "@web/core/utils/hooks";

class AnyPrintResultGenerator {
    constructor(address) {
        this.address = address;
    }

    IoTActionError(error) {
        const message = {
            successful: false,
            message: {
                title: 'Connection to the printer failed',
                body: 'Please check if the printer is still connected.\n' +
                      'Some browsers block HTTP calls to network devices for security reasons. ' +
                      'Refer to Odoo documentation on "Self-signed certificate for ePOS printers" and "Secure connection (HTTPS)" to resolve this.'
            },
        };

        if (window.location.protocol === 'https:') {
            message.message.body += '\nIf using HTTPS, ensure you have manually accepted the certificate by visiting ' + this.address;
        }

        return message;
    }

    IoTResultError(printerErrorCode) {
        console.log("Printer error code:", printerErrorCode);
        const message = printerErrorCode || 'Please check if the printer has enough paper and is ready to print.';

        return {
            successful: false,
            message: {
                title: 'Printing failed',
                body: message,
            },
        };
    }
}

export class AnyPrinter extends BasePrinter {
    constructor(ip, printer_name, pos) {
        super();
        this.http = useService("rpc");
        this.url = `http://${ip}`;
        this.address = `${this.url}/hw_proxy/default_printer_action`;
        this.printer_name = printer_name;
        this.pos = pos;
        this.printResultGenerator = new AnyPrintResultGenerator(this.address);
        this.status = { status: 'connecting', msg: 'Connecting to printer...' };
    }

    async get_status() {
        try {
            const response = await this.http("/hw_proxy/status", {});
            if (response && response.status === 'connected') {
                this.status = { status: 'connected', msg: 'Printer is online' };
            } else {
                this.status = { status: 'disconnected', msg: 'Printer is offline' };
            }
            return this.status;
        } catch (error) {
            console.error("Failed to get printer status:", error);
            this.status = { status: 'error', msg: 'Connection error' };
            return this.printResultGenerator.IoTActionError(error);
        }
    }

    async send_printing_job(receipt) {
        try {
            const response = await this.http("/hw_proxy/default_printer_action", {
                data: {
                    action: 'print_receipt',
                    printer_name: this.printer_name,
                    receipt: receipt,
                },
            });

            if (response && response.result) {
                return {
                    successful: true,
                    message: {
                        title: 'Printing successful',
                        body: 'The receipt was printed successfully.',
                    },
                };
            } else {
                return this.printResultGenerator.IoTResultError(response ? response.error : null);
            }
        } catch (error) {
            console.error("Printing job failed:", error);
            return this.printResultGenerator.IoTActionError(error);
        }
    }

    async print_receipt(receipt) {
        const result = await this.send_printing_job(receipt);
        if (!result.successful) {
            this.pos.trigger('printer-error', result.message);
        }
        return result;
    }

    async open_cashbox() {
        try {
            const response = await this.http("/hw_proxy/default_printer_action", {
                data: {
                    action: 'cashbox',
                    printer_name: this.printer_name,
                },
            });

            return {
                successful: !!response.result,
                message: {
                    title: response.result ? 'Cashbox opened' : 'Failed to open cashbox',
                    body: response.result ? 'The cashbox was opened successfully.' : 'Check the printer configuration.',
                },
            };
        } catch (error) {
            console.error("Failed to open cashbox:", error);
            return this.printResultGenerator.IoTActionError(error);
        }
    }
}
