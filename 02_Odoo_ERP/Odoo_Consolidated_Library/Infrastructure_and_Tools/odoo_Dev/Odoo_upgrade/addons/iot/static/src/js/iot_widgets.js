/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks";
import DeviceProxy from "iot.DeviceProxy";

// ---------------------------------------------------------
// Mixin para dispositivos IoT
// ---------------------------------------------------------
export const IoTValueFieldMixin = {
    setup() {
        this.iot_device = null;
        this.getDeviceInfo();
        this.startListening();
    },

    getDeviceInfo() {
        const identifier = this.props.record.data[this.props.attrs.options.identifier];
        const iot_ip = this.props.record.data[this.props.attrs.options.ip_field];

        if (identifier) {
            this.iot_device = new DeviceProxy(this, { iot_ip, identifier });
        }
    },

    startListening() {
        if (this.iot_device) {
            this.iot_device.add_listener(this.onValueChange.bind(this));
        }
    },

    stopListening() {
        if (this.iot_device) {
            this.iot_device.remove_listener();
        }
    },

    onValueChange(data) {
        console.warn("onValueChange not implemented:", data);
    },

    onIoTActionResult(data) {
        if (data.result !== true) {
            const dialog = new Dialog(this, {
                title: "Connection to device failed",
                body: "Please check if the device is still connected.",
            });
            dialog.open();
        }
    },

    onIoTActionFail() {
        const notification = useService("notification");
        notification.add("Failed to connect to IoT device", {
            type: "danger",
        });
    },
};

// ---------------------------------------------------------
// Campo en tiempo real
// ---------------------------------------------------------
class IoTRealTimeValue extends Component {
    setup() {
        Object.assign(this, IoTValueFieldMixin);
        this.getDeviceInfo();
        this.startListening();
    }

    onValueChange(data) {
        if (data.value !== undefined) {
            this.props.update(data.value.toString());
        }
    }
}

IoTRealTimeValue.template = "iot.RealTimeValue";

registry.category("fields").add("iot_realtime_value", IoTRealTimeValue);

// ---------------------------------------------------------
// Widget para mostrar valor de dispositivo IoT
// ---------------------------------------------------------
class IoTDeviceValueDisplay extends Component {
    setup() {
        this.identifier = this.props.data.identifier;
        this.iot_ip = this.props.data.iot_ip;

        this.getDeviceInfo();
        this.startListening();
    }

    getDeviceInfo() {
        this.iot_device = new DeviceProxy(this, {
            identifier: this.identifier,
            iot_ip: this.iot_ip,
        });
    }

    onValueChange(data) {
        if (this.el) {
            this.el.innerText = data.value;
        }
    }
}

IoTDeviceValueDisplay.template = "iot.DeviceValueDisplay";

registry.category("widgets").add("iot_device_value_display", IoTDeviceValueDisplay);

// ---------------------------------------------------------
// Botón para descargar logs de IoT
// ---------------------------------------------------------
class IoTDownloadLogsButton extends Component {
    setup() {
        this._ip_url = this.props.data.ip_url;
    }

    async downloadLogs() {
        try {
            const response = await fetch(`${this._ip_url}/hw_proxy/hello`);

            if (response.ok) {
                window.location = `${this._ip_url}/hw_drivers/download_logs`;
            } else {
                throw new Error("Failed to connect to IoT Box");
            }
        } catch (error) {
            const dialog = new Dialog(this, {
                title: "Connection Error",
                body: "Failed to connect to IoT device.",
            });
            dialog.open();
        }
    }

    render() {
        return (
            <button
                class="o_iot_logs_button btn btn-primary"
                onClick={() => this.downloadLogs()}
            >
                Download Logs
            </button>
        );
    }
}

IoTDownloadLogsButton.template = "iot.DownloadLogsButton";

registry.category("widgets").add("iot_download_logs", IoTDownloadLogsButton);

export {
    IoTValueFieldMixin,
    IoTRealTimeValue,
    IoTDeviceValueDisplay,
    IoTDownloadLogsButton,
};
