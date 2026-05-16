/** @odoo-module **/

import { FormView } from "@web/views/form/form_view";
import { viewRegistry } from "@web/views/view_registry";
import { IoTDeviceFormController } from "./iot_device_controllers";

class IoTDeviceFormView extends FormView {
    setup() {
        super.setup();
        this.config = Object.assign({}, this.config, {
            Controller: IoTDeviceFormController,
        });
    }
}

// Registrar la vista en el registro global de vistas
viewRegistry.add("iot_device_form", IoTDeviceFormView);

export { IoTDeviceFormView };
