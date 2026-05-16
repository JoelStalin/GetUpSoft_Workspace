/** @odoo-module **/

import { KanbanController } from "@web/views/kanban/kanban_controller";
import { ListController } from "@web/views/list/list_controller";
import { useService } from "@web/core/utils/hooks";
import { Component } from "@odoo/owl";

class IoTBoxControllerMixin extends Component {
    setup() {
        this.action = useService("action");
        this.addConnectButton();
    }

    addConnectButton() {
        const button = document.createElement("button");
        button.className = "btn btn-primary o_iot_box_connect_button";
        button.innerText = this.env._t("CONNECT");
        button.addEventListener("click", () => this.onConnectIoTBox());

        const buttonContainer = this.el.querySelector(".o_kanban_buttons, .o_list_buttons");
        if (buttonContainer) {
            buttonContainer.appendChild(button);
        }
    }

    async onConnectIoTBox() {
        await this.action.doAction("iot.action_add_iot_box");
    }
}

class IoTBoxKanbanController extends KanbanController {
    setup() {
        super.setup();
        this.mixin = new IoTBoxControllerMixin();
        this.mixin.el = this.el;
        this.mixin.setup();
    }
}

class IoTBoxListController extends ListController {
    setup() {
        super.setup();
        this.mixin = new IoTBoxControllerMixin();
        this.mixin.el = this.el;
        this.mixin.setup();
    }
}

export const iotControllers = {
    IoTBoxKanbanController,
    IoTBoxListController,
};
