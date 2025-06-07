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

define('advanced:views/workflow/action-fields/subjects/field', ['view', 'model'], function (Dep, Model) {

    // noinspection JSUnresolvedReference
    return Dep.extend({

        template: 'advanced:workflow/action-fields/subjects/field',

        data: function () {
            return {
                value: this.options.value,
                entityType: this.entityType,
                listHtml: this.listHtml,
                readOnly: this.readOnly,
            };
        },

        setup: function () {
            const entityType = this.entityType = this.options.entityType;
            const scope = this.options.scope;
            const field = this.options.field;
            this.readOnly = this.options.readOnly;

            this.foreignScope = null;

            let value = /** @type {string} */this.options.value;

            const fieldType = this.fieldType =
                this.getMetadata().get(`entityDefs.${scope}.fields.${field}.type`) || 'base';

            if (fieldType === 'link' || fieldType === 'linkMultiple') {
                this.foreignScope = this.getMetadata().get(`entityDefs.${scope}.links.${field}.entity`);
            }

            if (this.readOnly) {
                if (value && ~value.indexOf('.')) {
                    const values = value.split('.');

                    const foreignEntityType =  this.getMetadata()
                        .get(`entityDefs.${entityType}.links.${values[0]}.entity`);

                    this.listHtml = this.translate('Field', 'labels', 'Workflow') + ': ' +
                        this.translate(values[0], 'links', entityType) + '.' +
                        this.translate(values[1], 'fields', foreignEntityType);
                } else {
                    this.listHtml = this.translate('Field', 'labels', 'Workflow') + ': ' +
                        this.translate(value, 'fields', entityType);
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

        /**
         * @return {string[][]}
         */
        getFieldOptions: function () {
            const options = [];

            const fieldType = this.fieldType;
            const entityType = this.entityType;

            const list = [];

            const fieldDefs = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${entityType}.fields`);

            const fieldTypeList = /** @type {string[]} */
                this.getMetadata().get(`entityDefs.Workflow.fieldTypeComparison.${fieldType}`) || [];

            Object.keys(fieldDefs).forEach(field => {
                if (
                    !(
                        fieldDefs[field].type === fieldType ||
                        fieldTypeList.includes(fieldDefs[field].type)
                    )
                ) {
                    return;
                }

                if (
                    fieldDefs[field].directAccessDisabled ||
                    fieldDefs[field].disabled ||
                    fieldDefs[field].utility
                ) {
                    return;
                }

                if (fieldType === 'link' || fieldType === 'linkMultiple') {
                    const fScope = this.getMetadata().get(`entityDefs.${entityType}.links.${field}.entity`);

                    if (fScope !== this.foreignScope) {
                        return;
                    }
                }

                list.push(field);
            });

            list.forEach(field => {
                /*if (i === 0) {
                    const label = this.translate('Target Entity', 'labels', 'Workflow') +
                        ' (' + this.translate(entityType, 'scopeNames') + ')';

                    listHtml += `<optgroup label="${label}">`;
                }*/

                const label = this.translate(field, 'fields', entityType);

                options.push([field, label]);
            });

            const relatedFields = {};
            const linkDefs = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${entityType}.links`);

            Object.keys(linkDefs).forEach(link => {
                const list = [];

                if (linkDefs[link].type !== 'belongsTo') {
                    return;
                }

                if (
                    linkDefs[link].disabled ||
                    linkDefs[link].utility
                ) {
                    return;
                }

                const foreignEntityType = linkDefs[link].entity;

                if (!foreignEntityType) {
                    return;
                }

                const fieldDefs = /** @type {Record<string, Record>} */
                    this.getMetadata().get(`entityDefs.${foreignEntityType}.fields`);

                Object.keys(fieldDefs).forEach(field => {
                    if (
                        !(
                            fieldDefs[field].type === fieldType ||
                            fieldTypeList.includes(fieldDefs[field].type)
                        )
                    ) {
                        return;
                    }

                    if (
                        fieldDefs[field].directAccessDisabled ||
                        fieldDefs[field].disabled ||
                        fieldDefs[field].utility
                    ) {
                        return;
                    }

                    if (fieldType === 'link' || fieldType === 'linkMultiple') {
                        const fScope = this.getMetadata().get(`entityDefs.${foreignEntityType}.links.${field}.entity`);

                        if (fScope !== this.foreignScope) {
                            return;
                        }
                    }

                    list.push(field);
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

        fetchValue: function () {
            return this.formModel.attributes.value;
        },
    });
});
