/** @odoo-module **/

import { KanbanView } from "@web/views/kanban/kanban_view";
import { ListView } from "@web/views/list/list_view";
import { viewRegistry } from "@web/views/view_registry";
import { IoTBoxKanbanController, IoTBoxListController } from "./iot_box_controllers";

class IoTBoxKanbanView extends KanbanView {
    setup() {
        super.setup();
        this.config = Object.assign({}, this.config, {
            Controller: IoTBoxKanbanController,
        });
    }
}

class IoTBoxListView extends ListView {
    setup() {
        super.setup();
        this.config = Object.assign({}, this.config, {
            Controller: IoTBoxListController,
        });
    }
}

// Registrar las vistas en el registro global de vistas
viewRegistry.add("box_kanban_view", IoTBoxKanbanView);
viewRegistry.add("box_list_view", IoTBoxListView);
