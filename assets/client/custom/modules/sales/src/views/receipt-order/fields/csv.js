/***********************************************************************************
 * The contents of this file are subject to the Extension License Agreement
 * ("Agreement") which can be viewed at
 * https://www.espocrm.com/extension-license-agreement/.
 * By copying, installing downloading, or using this file, You have unconditionally
 * agreed to the terms and conditions of the Agreement, and You may not use this
 * file except in compliance with the Agreement. Under the terms of the Agreement,
 * You shall not license, sublicense, sell, resell, rent, lease, lend, distribute,
 * redistribute, market, publish, commercialize, or otherwise transfer rights or
 * usage to the software or any modified version or derivative work of the software
 * created by or for you.
 *
 * Copyright (C) 2015-2024 Letrium Ltd.
 *
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:views/receipt-order/fields/csv', ['views/fields/base'], function (Dep) {

    return class extends Dep {

        // noinspection JSUnusedGlobalSymbols
        editTemplateContent = `
            <label class="attach-file-label">
                <span class="btn btn-default btn-icon">
                    <span class="fas fa-paperclip"></span>
                </span>
                <input type="file" accept=".csv" class="file">
            </label>
            {{#if fileName}}
                <div class="import-file-name">{{fileName}}</div>
            {{/if}}
        `

        data() {
            return {
                name: this.name,
                fileName: this.fileName,
            };
        }

        setup() {
            this.fileName = null;

            this.addHandler('change', `input.file`, (e, target) => {
                if (!target.files.length) {
                    return;
                }

                this.loadFile(target.files[0]);
            });
        }

        /**
         * @param {File} file
         */
        loadFile(file) {
            const blob = file.slice(0, 1024 * 16);
            const reader = new FileReader();

            reader.onloadend = e => {
                if (e.target.readyState !== FileReader.DONE) {
                    return;
                }

                this.setContent(e.target.result);
                this.setFileName(file.name);
            };

            reader.readAsText(blob);
        }

        setFileName(name) {
            this.fileName = name;

            this.reRender();
        }

        setContent(content) {
            this.model.set({
                content: content,
                columnNumber: 1,
            }, {ui: true});
        }
    };
});
