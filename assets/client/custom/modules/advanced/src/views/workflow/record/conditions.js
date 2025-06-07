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

define('advanced:views/workflow/record/conditions', ['view'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/record/conditions',

        ignoreFieldList: [],

        events: {
            'click [data-action="showAddCondition"]': function (e) {
                const $target = $(e.currentTarget);
                const conditionType = $target.data('type');

                this.createView('modal', 'advanced:views/workflow/modals/add-condition', {
                    scope: this.entityType,
                    createdEntitiesData: this.options.flowchartCreatedEntitiesData,
                }, view => {
                    view.render();

                    this.listenToOnce(view, 'add-field', field => {
                        this.clearView('modal');
                        this.addCondition(conditionType, field, {}, true);
                    });
                });
            },
            'click [data-action="removeCondition"]': function (e) {
                const $target = $(e.currentTarget);
                const id = $target.data('id');

                this.clearView('condition-' + id);

                const $conditionContainer = $target.parent();
                const $container = $conditionContainer.parent();

                $conditionContainer.remove();

                if (!$container.find('.condition').length) {
                    $container.find('.no-data').removeClass('hidden');
                }

                this.trigger('change');
            }
        },

        data: function () {
            const hasConditionsAll = !!(this.model.get('conditionsAll') || []).length;
            const hasConditionsAny = !!(this.model.get('conditionsAny') || []).length;
            const hasConditionsFormula = !!(this.model.get('conditionsFormula') || '');

            return {
                fieldList: this.fieldList,
                entityType: this.entityType,
                readOnly: this.readOnly,
                showFormula: !this.readOnly || hasConditionsFormula,
                showConditionsAny: !this.readOnly || hasConditionsAny,
                showConditionsAll: !this.readOnly || hasConditionsAll,
                showNoData: this.readOnly && !hasConditionsFormula && !hasConditionsAny && !hasConditionsAll,
                marginForConditionsAny: !this.readOnly || hasConditionsAll,
                marginForFormula: !this.readOnly || hasConditionsAll || hasConditionsAny,
            }
        },

        afterRender: function () {
            const conditionsAll = this.model.get('conditionsAll') || [];
            const conditionsAny = this.model.get('conditionsAny') || [];

            conditionsAll.forEach(data => {
                this.addCondition('all', data.fieldToCompare, data);
            });

            conditionsAny.forEach(data => {
                this.addCondition('any', data.fieldToCompare, data);
            });

            if (!this.readOnly || this.model.get('conditionsFormula')) {
                this.createView('conditionsFormula', 'views/fields/formula', {
                    name: 'conditionsFormula',
                    model: this.model,
                    mode: this.readOnly ? 'detail' : 'edit',
                    height: 50,
                    el: this.getSelector() + ' .formula-conditions',
                    inlineEditDisabled: true,
                    targetEntityType: this.entityType,
                }, view => {
                    view.render();

                    this.listenTo(view, 'change', () => {
                        this.trigger('change');
                    });
                });
            }
        },

        setup: function () {
            this.entityType = this.scope = this.options.entityType || this.model.get('entityType');

            const conditionFieldTypes = this.getMetadata().get('entityDefs.Workflow.conditionFieldTypes') || {};
            const defs = this.getMetadata().get(`entityDefs.${this.entityType}.fields`) || {};

            this.fieldList = Object.keys(defs)
                .filter(field => {
                    let type = defs[field].type || 'base';

                    if (
                        defs[field].disabled ||
                        defs[field].utility
                    ) {
                        return;
                    }

                    return !~this.ignoreFieldList.indexOf(field) && (type in conditionFieldTypes);
                })
                .sort((v1, v2) => {
                     return this.translate(v1, 'fields', this.scope)
                         .localeCompare(this.translate(v2, 'fields', this.scope));
                });

            this.lastCid = 0;
            this.readOnly = this.options.readOnly || false;
        },

        addCondition: function (conditionType, field, data, isNew) {
            data = data || {};

            let numberId;
            let fieldType;
            let link = null;
            let foreignField = null;
            let isCreatedEntity = false;

            let overriddenEntityType = null;
            let overriddenField;
            let foreignEntityType;
            let aliasId;

            if (~field.indexOf('.')) {
                if (field.indexOf('created:') === 0) {
                    isCreatedEntity = true;

                    const arr = field.split('.');
                    overriddenField = arr[1];

                    aliasId = arr[0].substr(8);

                    if (
                        !this.options.flowchartCreatedEntitiesData ||
                        !this.options.flowchartCreatedEntitiesData[aliasId]
                    ) {
                        return;
                    }

                    overriddenEntityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;
                    link = this.options.flowchartCreatedEntitiesData[aliasId].link;
                    numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;

                    fieldType = this.getMetadata()
                        .get(['entityDefs', overriddenEntityType, 'fields', overriddenField, 'type']) || 'base';
                }
                else {
                    let arr = field.split('.');

                    foreignField = arr[1];
                    link = arr[0];

                    foreignEntityType = this.getMetadata()
                        .get(['entityDefs', this.entityType, 'links', link, 'entity']);

                    fieldType = this.getMetadata()
                        .get(['entityDefs', foreignEntityType, 'fields', foreignField, 'type']) || 'base';
                }
            }
            else {
                fieldType = this.getMetadata()
                    .get(['entityDefs', this.entityType, 'fields', field, 'type']) || 'base';
            }

            const type = this.getMetadata()
                .get('entityDefs.Workflow.conditionFieldTypes.' + fieldType) || 'base';

            const $container = this.$el.find('.' + conditionType.toLowerCase() + '-conditions');

            $container.find('.no-data').addClass('hidden');

            const id = data.cid = this.lastCid;

            this.lastCid++;

            let label;

            let actualField = field;
            let actualEntityType = this.entityType;

            if (isCreatedEntity) {
                let labelLeftPart = this.translate('Created', 'labels', 'Workflow') + ': ';

                if (link) {
                    labelLeftPart += this.translate(link, 'links', this.entityType) + ' - ';
                }

                labelLeftPart += this.translate(overriddenEntityType, 'scopeNames');

                const text = this.options.flowchartCreatedEntitiesData[aliasId].text;

                if (text) {
                    labelLeftPart += ' \'' + text + '\'';
                } else {
                    if (numberId) {
                        labelLeftPart += ' #' + numberId.toString();
                    }
                }

                label = labelLeftPart + '.' + this.translate(overriddenField, 'fields', overriddenEntityType);

                actualField = overriddenField;
                actualEntityType = overriddenEntityType;
            }
            else if (link) {
                label = this.translate(link, 'links', this.entityType) + '.' +
                    this.translate(foreignField, 'fields', foreignEntityType);

                actualField = foreignField;
                actualEntityType = foreignEntityType;
            }
            else {
                label = this.translate(field, 'fields', this.entityType);
            }

            const escapedId = this.getHelper().escapeString(id);
            const escapedLabel = this.getHelper().escapeString(label);

            const fieldNameHtml = '<label class="field-label-name control-label small">'
                + escapedLabel + '</label>';

            const removeLinkHtml = this.readOnly ? '' :
                '<a role="button" tabindex="0" class="pull-right" data-action="removeCondition" ' +
                'data-id="' + escapedId + '">' +
                '<span class="fas fa-times"></span></a>';

            const $item = $('<div class="cell form-group">' +
                removeLinkHtml + fieldNameHtml +
                '<div class="condition small" data-id="' + escapedId + '"></div></div>');

            $item.css({
                marginLeft: '10px',
            });

            $container.append($item);

            const viewName = `advanced:views/workflow/conditions/${Espo.Utils.camelCaseToHyphen(type)}`;

            this.createView('condition-' + id, viewName, {
                selector: `.condition[data-id="${id}"]`,
                conditionData: data,
                model: this.model,
                field: field,
                entityType: overriddenEntityType || this.entityType,
                originalEntityType: this.entityType,
                actualField: actualField,
                actualEntityType: actualEntityType,
                type: type,
                fieldType: fieldType,
                conditionType: conditionType,
                isNew: isNew,
                readOnly: this.readOnly,
                isChangedDisabled: this.options.isChangedDisabled,
            }, view => {
                view.render();

                if (isNew) {
                    const $form = view.$el.closest('.form-group');

                    $form.addClass('has-error');

                    setTimeout(() => $form.removeClass('has-error'), 1500);

                    this.trigger('change');
                }
            });
        },

        fetch: function () {
            if (!this.hasView('conditionsFormula')) {
                // Prevents fetching on duplicate action, when fields are not yet rendered (in afterRender).
                return null;
            }

            const conditions = {
                all: [],
                any: [],
            };

            for (let i = 0; i < this.lastCid; i++) {
                const view = this.getView('condition-' + i);

                if (!view) {
                    continue;
                }

                if (!(view.conditionType in conditions)) {
                    continue;
                }

                const data = view.fetch();

                data.type = view.conditionType;
                conditions[view.conditionType].push(data);
            }

            const view = this.getView('conditionsFormula');

            if (view) {
                conditions.formula = (view.fetch() || {}).conditionsFormula;
            }

            return conditions;
        },
    });
});
