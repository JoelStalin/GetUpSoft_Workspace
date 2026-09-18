/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { onMounted, onWillUnmount } from "@odoo/owl";

export class DeviceProxy extends Component {
    setup() {
        this.rpc = useService("rpc");
        this._id = crypto.randomUUID();
        this._iot_ip = this.props.iot_device.iot_ip;
        this._identifier = this.props.iot_device.identifier;
        this.manual_measurement = this.props.iot_device.manual_measurement;

        // Registrar eventos (si es necesario)
        onMounted(() => {
            console.log("DeviceProxy mounted:", this._identifier);
        });

        onWillUnmount(() => {
            console.log("DeviceProxy unmounted:", this._identifier);
            this.remove_listener();
        });
    }

    /**
     * Call actions on the device
     * @param {Object} data
     * @returns {Promise}
     */
    async action(data) {
        try {
            return await this.rpc("/iot/longpolling/action", {
                iot_ip: this._iot_ip,
                identifier: this._identifier,
                data: data,
            });
        } catch (error) {
            console.error("Failed to execute action:", error);
        }
    }

    /**
     * Add `callback` to the listeners callbacks list it gets called everytime the device's value is updated.
     * @param {function} callback
     * @returns {Promise}
     */
    async add_listener(callback) {
        try {
            await this.rpc("/iot/longpolling/addListener", {
                iot_ip: this._iot_ip,
                identifiers: [this._identifier],
                id: this._id,
            });
            this.callback = callback;
        } catch (error) {
            console.error("Failed to add listener:", error);
        }
    }

    /**
     * Stop listening to the device
     */
    async remove_listener() {
        try {
            await this.rpc("/iot/longpolling/removeListener", {
                iot_ip: this._iot_ip,
                identifier: this._identifier,
                id: this._id,
            });
        } catch (error) {
            console.error("Failed to remove listener:", error);
        }
    }
}

DeviceProxy.template = "iot.DeviceProxy";
