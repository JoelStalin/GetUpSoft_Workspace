/** @odoo-module **/
import { registry } from "@web/core/registry";
import DeviceProxy from "iot.DeviceProxy";
import { useService } from "@web/core/utils/hooks";

async function onIoTActionResult(data, notification) {
    if (data.result === true) {
        notification.add("Successfully sent to printer!");
    } else {
        notification.add("Check if the printer is still connected", {
            title: "Connection to printer failed",
            type: "danger",
        });
    }
}

function onValueChange(data, notification) {
    if (data.status) {
        notification.add(`Printer ${data.status}`);
    }
}

async function iotReportActionHandler(action, options, env) {
    if (action.device_id) {
        const orm = env.services.orm;
        const notification = env.services.notification;

        // Call new route that sends your report to the printer
        action.data = action.data || {};
        action.data["device_id"] = action.device_id;
        const args = [action.id, action.context.active_ids, action.data];
        
        try {
            // Obtener IP, identificador y documento desde el backend
            const [ip, identifier, document] = await orm.call(
                "ir.actions.report",
                "iot_render",
                args
            );

            // Crear instancia de DeviceProxy para enviar el documento
            const iotDevice = new DeviceProxy(null, { iot_ip: ip, identifier });

            // Registrar cambios de estado
            iotDevice.add_listener((data) => onValueChange(data, notification));

            // Enviar el documento a la impresora
            iotDevice.action({ document })
                .then((data) => onIoTActionResult(data, notification))
                .catch(() => {
                    console.error(`Connection to IoT Box ${ip} failed`);
                });

            return true;

        } catch (error) {
            console.error("Failed to send report to IoT device:", error);
            notification.add("Failed to send report to IoT device", {
                type: "danger",
            });
            return false;
        }
    }
}

// Registrar el handler de la acción en el sistema de reportes
registry
    .category("ir.actions.report handlers")
    .add("iot_report_action_handler", iotReportActionHandler);
