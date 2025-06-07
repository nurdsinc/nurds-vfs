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
 * License ID: 666d14eca4fd54205a89f2a8f2b55ea2
 ************************************************************************************/

define('advanced:views/workflow/action-fields/date-field', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-fields/date-field',

        data: function () {
            return {
                value: this.options.value,
                entityType: this.entityType,
                stringValue: this.stringValue,
                readOnly: this.readOnly,
            };
        },

        setup: function () {
            this.entityType = this.options.entityType;
            this.readOnly = this.options.readOnly;

            if (this.readOnly) {
                this.buildStringValue();
            } else {
                this.formModel = new Model();
                this.formModel.name = 'Dummy'; // @todo Remove.

                this.formModel.set({
                    executionField: this.options.value,
                });

                const options = this.getOptions();

                this.createView('executionField', 'views/fields/enum', {
                    name: 'executionField',
                    selector: '[data-field="executionField"]',
                    model: this.formModel,
                    mode: 'edit',
                    params: {
                        options: options.map(it => it[0]),
                    },
                    translatedOptions: options.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
                });
            }
        },

        /**
         * @return {string[][]}
         */
        getOptions: function () {
            const options = [];
            const fieldTypeList = ['date', 'datetime'];

            const list = [];

            const fieldDefs = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${this.entityType}.fields`) || {};

            Object.keys(fieldDefs).forEach(field => {
                if (fieldDefs[field].utility || fieldDefs[field].directAccessDisabled) {
                    return;
                }

                if (fieldTypeList.includes(fieldDefs[field].type)) {
                    list.push(field);
                }
            });

            options.push(['', this.translate('now', 'labels', 'Workflow')]);

            list.forEach((field) => {
                options.push([field, this.translate(field, 'fields', this.entityType)])
            });

            const relatedFields = {};

            const linkDefs = this.getMetadata().get(`entityDefs.${this.entityType}.links`);

            Object.keys(linkDefs).forEach(link => {
                const list = [];

                if (linkDefs[link].type === 'belongsTo') {
                    const foreignEntityType = linkDefs[link].entity;

                    if (!foreignEntityType) {
                        return;
                    }

                    const fieldDefs = /** @type {Record<string, Record>} */
                        this.getMetadata().get(`entityDefs.${foreignEntityType}.fields`) || {};

                    Object.keys(fieldDefs).forEach(field => {
                        if (fieldDefs[field].utility || fieldDefs[field].directAccessDisabled) {
                            return;
                        }

                        if (fieldTypeList.includes(fieldDefs[field].type)) {
                            list.push(field);
                        }
                    });

                    relatedFields[link] = list;
                }
            });

            for (const link in relatedFields) {
                relatedFields[link].forEach(field => {
                    const label = this.translate(link, 'links', this.entityType) + ' . ' +
                        this.translate(field, 'fields', linkDefs[link].entity)

                    options.push([`${link}.${field}`, label]);
                });
            }

            return options;
        },

        buildStringValue: function () {
            const value = this.options.value;

            if (value) {
                const entityType = this.entityType;

                if (value.includes('.')) {
                    const [link, field] = value.split('.');
                    const foreignEntityType = this.getMetadata()
                        .get(`entityDefs.${this.entityType}.links.${link}.entity`);

                    this.stringValue =
                        this.translate(link, 'links', entityType) + '.' +
                        this.translate(field, 'fields', foreignEntityType);

                    return;
                }

                this.stringValue = this.translate(value, 'fields', entityType);

                return;
            }

            this.stringValue = this.translate('now', 'labels', 'Workflow');
        },

        fetchValue: function () {
            return this.formModel.attributes.executionField;
        },
    });
});
