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

define('advanced:views/workflow/condition-fields/subjects/field',
['view', 'advanced:workflow-helper', 'model'], function (Dep, Helper, Model) {

    return Dep.extend({

        template: 'advanced:workflow/condition-fields/subjects/field',

        data: function () {
            return {
                value: this.options.value,
                entityType: this.options.entityType,
                listHtml: this.listHtml,
                readOnly: this.readOnly,
            };
        },

        setup: function () {
            this.readOnly = this.options.readOnly;

            this.fieldType = this.options.fieldType;
            this.field = this.options.field;
            const entityType = this.entityType = this.options.entityType;
            let value = this.value = this.options.value;

            if (this.readOnly) {
                if (~value.indexOf('.')) {
                    const values = value.split('.');

                    const foreignScope = this.getMetadata()
                        .get(`entityDefs.${entityType}.links.${values[0]}.entity`) || entityType;

                    this.listHtml = this.translate(values[0], 'links', entityType) + '.' +
                        this.translate(values[1], 'fields', foreignScope);
                } else {
                    this.listHtml = this.translate(value, 'fields', entityType);
                }

                return;
            }

            const model = this.formModel = new Model();
            model.name = 'Dummy';

            const options = this.getFieldOptions();

            if (!value && options.length) {
                value = options[0][0];
            }

            model.set({
                value: value,
            });

            // noinspection JSUnresolvedReference
            this.createView('valueField', 'views/fields/enum', {
                selector: '[data-field="value"]',
                model: model,
                name: 'value',
                mode: 'edit',
                params: {
                    options: options.map(it => it[0]),
                },
                translatedOptions: options.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
            });
        },

        fetchValue: function () {
            return this.formModel.attributes.value;
        },

        /**
         * @return {string[][]}
         */
        getFieldOptions: function () {
            const options = [];

            const fieldType = this.fieldType;
            const entityType = this.entityType;
            const targetField = this.field;

            const fieldTypeList = this.getMetadata().get(`entityDefs.Workflow.fieldTypeComparison.${fieldType}`) || [];

            const list = [];

            const fieldDefs = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${entityType}.fields`) || {};

            const fieldList = Object.keys(fieldDefs);

            fieldList.sort((v1, v2) => {
                return this.translate(v1, 'fields', entityType)
                    .localeCompare(this.translate(v2, 'fields', entityType));
            });

            let targetLinkEntityType = null;

            const helper = new Helper(this.getMetadata());

            if (fieldType === 'link' || fieldType === 'linkMultiple') {
                targetLinkEntityType = helper.getComplexFieldForeignEntityType(targetField, entityType);
            }

            fieldList.forEach(itemField => {
                if (fieldDefs[itemField].utility) {
                    return;
                }

                if (
                    (
                        fieldDefs[itemField].type === fieldType ||
                        ~fieldTypeList.indexOf(fieldDefs[itemField].type)
                    ) &&
                    itemField !== targetField
                ) {
                    if (fieldType === 'link' || fieldType === 'linkMultiple') {
                        const linkEntityType = this.getMetadata()
                            .get(['entityDefs', entityType, 'links', itemField, 'entity']);

                        if (linkEntityType !== targetLinkEntityType) {
                            return;
                        }
                    }

                    list.push(itemField);
                }
            });

            list.forEach(field => {
                const label = this.translate(field, 'fields', entityType);

                options.push([field, label]);
            });

            const relatedFields = {};

            const linkDefs = this.getMetadata().get(`entityDefs.${entityType}.links`) || {};
            const linkList = Object.keys(linkDefs);

            linkList.sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach(link => {
                const list = [];

                if (linkDefs[link].type !== 'belongsTo') {
                    return;
                }

                const foreignEntityType = linkDefs[link].entity;

                if (!foreignEntityType) {
                    return;
                }

                const fieldDefs = this.getMetadata().get(`entityDefs.${foreignEntityType}.fields`) || {};
                const fieldList = Object.keys(fieldDefs);

                fieldList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', foreignEntityType)
                        .localeCompare(this.translate(v2, 'fields', foreignEntityType));
                });

                fieldList.forEach(field => {
                    if (targetField === `${link}.${field}`) {
                        return;
                    }

                    if (fieldDefs[field].utility) {
                        return;
                    }

                    if (
                        fieldDefs[field].type === fieldType ||
                        ~fieldTypeList.indexOf(fieldDefs[field].type)
                    ) {
                        if (fieldType === 'link' || fieldType === 'linkMultiple') {
                            const linkEntityType = this.getMetadata()
                                .get(['entityDefs', foreignEntityType, 'links', field, 'entity']);

                            if (linkEntityType !== targetLinkEntityType) {
                                return;
                            }
                        }

                        list.push(field);
                    }
                });

                relatedFields[link] = list;
            });

            for (const link in relatedFields) {
                relatedFields[link].forEach(field => {
                    const label = this.translate(link, 'links', entityType) + ' . ' +
                        this.translate(field, 'fields', linkDefs[link].entity);

                    options.push([`${link}.${field}`, label])
                });
            }

            return options;
        },

        afterRender: function () {
            if (!this.readOnly) {
                this.$el.find('.selectize-control').addClass('input-sm');
            }
        },
    });
});
