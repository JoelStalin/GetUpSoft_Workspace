/** @odoo-module **/

import { FormController } from "@web/views/form/form_controller";
import { useService } from "@web/core/utils/hooks";
import { Component } from "@odoo/owl";
import { DeviceProxy } from "./device_proxy"; // Asegúrate de que el path es correcto

export class IoTDeviceFormController extends FormController {
    setup() {
        super.setup();
        this.notification = useService("notification");
        this.rpc = useService("rpc");
    }

    async saveRecord() {
        if (["keyboard", "scanner"].includes(this.props.record.data.type)) {
            const result = await this._updateKeyboardLayout();
            this._processResult(result);
        } else if (this.props.record.data.type === "display") {
            await this._updateDisplayUrl();
            return super.saveRecord();
        } else {
            return super.saveRecord();
        }
    }

    _processResult(result) {
        if (result.result === true) {
            super.saveRecord();
        } else {
            this.notification.add(
                this.env._t("Connection to device failed"),
                {
                    type: "danger",
                    message: this.env._t("Check if the device is still connected"),
                }
            );
        }
    }

    /**
     * Send an action to the device to update the keyboard layout
     */
    async _updateKeyboardLayout() {
        const data = this.props.record.data;
        const iot_device = new DeviceProxy(this, {
            iot_ip: data.iot_ip,
            identifier: data.identifier,
        });

        await iot_device.action({
            action: "update_is_scanner",
            is_scanner: data.is_scanner,
        });

        if (data.keyboard_layout) {
            const res = await this.rpc.query({
                model: "iot.keyboard.layout",
                method: "read",
                args: [[data.keyboard_layout.res_id], ["layout", "variant"]],
            });

            return iot_device.action({
                action: "update_layout",
                layout: res[0].layout,
                variant: res[0].variant,
            });
        } else {
            return iot_device.action({
                action: "update_layout",
            });
        }
    }

    /**
     * Send an action to the device to update the screen URL
     */
    async _updateDisplayUrl() {
        const data = this.props.record.data;
        const iot_device = new DeviceProxy(this, {
            iot_ip: data.iot_ip,
            identifier: data.identifier,
        });

        return iot_device.action({
            action: "update_url",
            url: data.display_url,
        });
    }
}
