/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

function openDevices(ev) {
    ev.preventDefault();
    const actionService = useService("action");
    actionService.doAction({
        type: "ir.actions.act_window",
        res_model: "iot.device",
        view_mode: "list",
        domain: [["iot_id", "=", ev.target.dataset.iotId]],
    });
}

registry.category("ir.actions").add("iot_device_action_open", openDevices);
