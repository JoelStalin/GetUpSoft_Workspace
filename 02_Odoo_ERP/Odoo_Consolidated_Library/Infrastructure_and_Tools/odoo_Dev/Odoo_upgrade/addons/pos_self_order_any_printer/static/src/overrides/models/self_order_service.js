import { AnyPrinter } from "@pos_any_printer/app/any_printer";
import { SelfOrder } from "@pos_self_order/app/self_order_service";
import { patch } from "@web/core/utils/patch";

patch(SelfOrder.prototype, {
    async setup() {
        await super.setup(...arguments);
        if (!this.config.any_printer_ip || !this.config.other_devices) {
            return;
        }
        this.printer.setPrinter(
            new AnyPrinter({
                ip: this.config.any_printer_ip,
            })
        );
    },
    create_printer(printer) {
        if (printer.printer_type === "any_epos") {
            return new AnyPrinter({ ip: printer.any_printer_ip });
        }
        return super.create_printer(...arguments);
    },
});
