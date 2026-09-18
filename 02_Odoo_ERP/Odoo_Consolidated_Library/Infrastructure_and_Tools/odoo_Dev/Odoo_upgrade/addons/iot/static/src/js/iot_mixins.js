/** @odoo-module **/

import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";

export const IoTConnectionMixin = {
    _doWarnFail(url) {
        const content = `
            <div>
                <p>${_t("Odoo cannot reach the IoT Box.")}</p>
                <span>${_t("Please check if the IoT Box is still connected.")}</span>
                <p>${_t("If you are on a secure server (HTTPS) check if you accepted the certificate:")}</p>
                <p>
                    <a href="https://${url}" target="_blank">
                        <i class="fa fa-external-link"></i> ${_t("Click here to open your IoT Homepage")}
                    </a>
                </p>
                <ul>
                    <li>${_t("Please accept the certificate of your IoT Box (procedure depends on your browser):")}</li>
                    <li>${_t("Click on Advanced/Show Details/Details/More information")}</li>
                    <li>${_t("Click on Proceed to .../Add Exception/Visit this website/Go on to the webpage")}</li>
                    <li>${_t("Firefox only: Click on Confirm Security Exception")}</li>
                    <li>${_t("Close this window and try again")}</li>
                </ul>
            </div>
        `;

        const dialog = new Dialog(this, {
            title: _t("Connection to IoT Box failed"),
            body: content,
            buttons: [
                {
                    name: _t("Close"),
                    classes: "btn-secondary o_form_button_cancel",
                    close: true,
                },
            ],
        });

        dialog.open();
    },
};
