/** @odoo-module **/

import { registry } from "@web/core/registry";
import { IoTConnectionMixin } from "./iot_mixins";

const POLL_TIMEOUT = 60000;
const POLL_ROUTE = "/hw_drivers/event";
const ACTION_TIMEOUT = 6000;
const ACTION_ROUTE = "/hw_drivers/action";

const RPC_DELAY = 1500;
const MAX_RPC_DELAY = 1500 * 10;

export class IoTLongpolling extends IoTConnectionMixin {
    setup() {
        this._session_id = this._createUUID();
        this._listeners = {};
        this._retries = 0;
        this._delayedStartPolling(RPC_DELAY);
    }

    // ---------------------------------------------------------
    // Public methods
    // ---------------------------------------------------------
    async addListener(iot_ip, devices, listener_id, callback) {
        if (!this._listeners[iot_ip]) {
            this._listeners[iot_ip] = {
                last_event: 0,
                devices: {},
                session_id: this._session_id,
                rpc: false,
            };
        }

        devices.forEach((device) => {
            this._listeners[iot_ip].devices[device] = {
                listener_id: listener_id,
                device_identifier: device,
                callback: callback,
            };
        });

        this.stopPolling(iot_ip);
        this.startPolling(iot_ip);
        return Promise.resolve();
    }

    removeListener(iot_ip, device_identifier, listener_id) {
        if (this._listeners[iot_ip]?.devices[device_identifier]?.listener_id === listener_id) {
            delete this._listeners[iot_ip].devices[device_identifier];
        }
    }

    async action(iot_ip, device_identifier, data) {
        const payload = {
            params: {
                session_id: this._session_id,
                device_identifier: device_identifier,
                data: JSON.stringify(data),
            },
        };

        try {
            const result = await this._rpcIoT(iot_ip, ACTION_ROUTE, payload, { timeout: ACTION_TIMEOUT });
            return result;
        } catch (error) {
            console.error("Action failed:", error);
            throw error;
        }
    }

    startPolling(iot_ip) {
        if (iot_ip) {
            if (!this._listeners[iot_ip]?.rpc) {
                this._poll(iot_ip);
            }
        } else {
            Object.keys(this._listeners).forEach((ip) => this.startPolling(ip));
        }
    }

    stopPolling(iot_ip) {
        if (this._listeners[iot_ip]?.rpc) {
            this._listeners[iot_ip].rpc.abort();
            this._listeners[iot_ip].rpc = false;
        }
    }

    // ---------------------------------------------------------
    // Private methods
    // ---------------------------------------------------------
    _delayedStartPolling(delay) {
        setTimeout(() => this.startPolling(), delay);
    }

    _createUUID() {
        return crypto.randomUUID(); // Uso de API nativa de JS
    }

    async _rpcIoT(iot_ip, route, data, options) {
        const protocol = window.location.protocol;
        const port = protocol === "http:" ? ":8069" : "";
        const url = `${protocol}//${iot_ip}${port}${route}`;

        const requestOptions = Object.assign(
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify(data),
                signal: options?.signal,
            },
            options
        );

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (route === POLL_ROUTE && this._listeners[iot_ip]) {
            this._listeners[iot_ip].rpc = result;
            return this._listeners[iot_ip].rpc;
        } else {
            return result;
        }
    }

    async _poll(iot_ip) {
        const listener = this._listeners[iot_ip];
        if (!listener) return;

        const payload = {
            params: {
                listener: listener,
            },
        };

        try {
            const result = await this._rpcIoT(iot_ip, POLL_ROUTE, payload, {
                timeout: POLL_TIMEOUT,
            });

            if (result.result && this._session_id === result.result.session_id) {
                this._onSuccess(iot_ip, result.result);
            } else if (Object.keys(listener.devices).length > 0) {
                this._poll(iot_ip);
            }
        } catch (error) {
            console.error("Polling error:", error);
            this._onError();
        }
    }

    _onSuccess(iot_ip, result) {
        this._listeners[iot_ip].last_event = result.time;

        const devices = this._listeners[iot_ip].devices;
        if (devices[result.device_identifier]) {
            devices[result.device_identifier].callback(result);
        }

        if (Object.keys(devices).length > 0) {
            this._poll(iot_ip);
        }

        this._retries = 0;
    }

    _onError() {
        this._retries++;
        this._delayedStartPolling(Math.min(RPC_DELAY * this._retries, MAX_RPC_DELAY));
    }
}

// Registrar el servicio en el registro global de servicios
registry.category("services").add("iot_longpolling", IoTLongpolling);
