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

define('advanced:views/bpmn-flowchart-element/fields/timer', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'advanced:bpmn-flowchart-element/fields/timer/detail',
        editTemplate: 'advanced:bpmn-flowchart-element/fields/timer/edit',

        data: function () {
            var data = {};

            data.timerBaseTranslatedValue = this.translateTimerBaseValue(this.model.get('timerBase'));

            data.timerShiftOperatorTranslatedValue = this.getLanguage()
                .translateOption(this.model.get('timerShiftOperator'), 'timerShiftOperator', 'BpmnFlowchartElement');

            data.timerShiftUnitsTranslatedValue = this.getLanguage()
                .translateOption(this.model.get('timerShiftUnits'), 'timerShiftUnits', 'BpmnFlowchartElement');

            data.timerShiftValue = this.model.get('timerShift');
            data.hasShift = this.model.get('timerShift') !== 0 && this.model.get('timerBase') !== 'formula';
            data.hasFormula = this.model.get('timerBase') === 'formula';

            if (this.mode === 'edit') {
                data.timerBaseOptionDataList = [];

                this.timerBaseOptionList.forEach(item => {
                    data.timerBaseOptionDataList.push({
                        value: item,
                        label: this.translateTimerBaseValue(item),
                        isSelected: item === this.model.get('timerBase'),
                    });
                });

                data.timerShiftOperatorOptionDataList = [];

                this.timerShiftOperatorOptionList.forEach(item => {
                    data.timerShiftOperatorOptionDataList.push({
                        value: item,
                        label: this.getLanguage().translateOption(item, 'timerShiftOperator', 'BpmnFlowchartElement'),
                        isSelected: item === this.model.get('timerShiftOperator'),
                    });
                });

                data.timerShiftUnitsOptionDataList = [];

                this.timerShiftUnitsOptionList.forEach(item => {
                    data.timerShiftUnitsOptionDataList.push({
                        value: item,
                        label: this.getLanguage().translateOption(item, 'timerShiftUnits', 'BpmnFlowchartElement'),
                        isSelected: item === this.model.get('timerShiftUnits'),
                    });
                });
            }

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.timerBaseOptionList = ['moment', 'formula'];

            this.entityType = this.model.targetEntityType;

            this.timerShiftOperatorOptionList = ['plus', 'minus'];
            this.timerShiftUnitsOptionList = ['minutes', 'seconds', 'hours', 'days', 'months'];

            this.setupBaseOptionList();

            this.createView('timerFormula', 'views/fields/formula', {
                name: 'timerFormula',
                model: this.model,
                mode: this.mode,
                height: 50,
                el: this.getSelector() + ' .formula-container',
                inlineEditDisabled: true,
                targetEntityType: this.model.targetEntityType,
            });
        },

        setupBaseOptionList: function () {
            var dateTimeFieldList = [];
            var typeList = ['date', 'datetime'];

            var fieldDefs = this.getMetadata().get(['entityDefs', this.entityType, 'fields']) || {};

            Object.keys(fieldDefs).forEach(function (field) {
                if ((~typeList.indexOf(fieldDefs[field].type))) {
                    dateTimeFieldList.push(field);
                }
            }, this);

            var linkDefs = this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {};

            Object.keys(linkDefs).forEach(function (link) {
                if (linkDefs[link].type === 'belongsTo') {
                    var foreignEntityType = linkDefs[link].entity;

                    if (!foreignEntityType) {
                        return;
                    }

                    var fieldDefs = this.getMetadata().get(['entityDefs', foreignEntityType, 'fields']);

                    Object.keys(fieldDefs).forEach(function (field) {
                        if (~typeList.indexOf(fieldDefs[field].type)) {
                            dateTimeFieldList.push(link + '.' + field);
                        }
                    }, this);
                }
            }, this);

            dateTimeFieldList.forEach(function (item) {
                this.timerBaseOptionList.push('field:' + item);
            }, this);
        },

        afterRender: function () {
            this.$timerShiftUnits = this.$el.find('[data-name="timerShiftUnits"]');
            this.$timerShiftOperator = this.$el.find('[data-name="timerShiftOperator"]');
            this.$timerShift = this.$el.find('[data-name="timerShift"]');

            this.$timerFormulaContainer = this.$el.find('.formula-container');

            this.$el.find('[data-name="timerBase"]').on('change', () => {
                this.trigger('change');
                this.controlVisibility();
            });

            this.controlVisibility();
        },

        controlVisibility: function () {
            if (this.model.get('timerBase') === 'formula') {
                this.$timerShiftUnits.addClass('hidden');
                this.$timerShiftOperator.addClass('hidden');
                this.$timerShift.addClass('hidden');
                this.$timerFormulaContainer.removeClass('hidden');
            } else {
                this.$timerShiftUnits.removeClass('hidden');
                this.$timerShiftOperator.removeClass('hidden');
                this.$timerShift.removeClass('hidden');
                this.$timerFormulaContainer.addClass('hidden');
            }
        },

        fetch: function () {
            var timerBase = this.$el.find('[data-name="timerBase"]').val();
            var timerShiftUnits = this.$el.find('[data-name="timerShiftUnits"]').val();
            var timerShiftOperator = this.$el.find('[data-name="timerShiftOperator"]').val();
            var timerShift = parseInt(this.$el.find('[data-name="timerShift"]').val());

            if (timerBase === 'moment') {
                timerBase = null;
            }

            var timerFormula = null;
            if (timerBase === 'formula') {
                timerFormula = this.getView('timerFormula').fetch().timerFormula;
                timerShiftOperator = null;
                timerShift = null;
                timerShiftUnits = null;
            }

            return {
                'timerBase': timerBase,
                'timerShiftUnits': timerShiftUnits,
                'timerShiftOperator': timerShiftOperator,
                'timerShift': timerShift,
                'timerFormula': timerFormula,
            };
        },

        translateTimerBaseValue: function (value) {
            if (value === null || value === 'moment') {
                return this.getLanguage().translateOption('moment', 'timerBase', 'BpmnFlowchartElement');
            }

            if (value === 'formula') {
                return this.getLanguage().translateOption('formula', 'timerBase', 'BpmnFlowchartElement');
            }

            var label;

            if (value.indexOf('field:') === 0) {
                var part = value.substr(6);
                var field;

                var entityType = this.entityType;

                if (~part.indexOf('.')) {
                    var arr = part.split('.');
                    var link = arr[0];

                    field = arr[1];
                    entityType = this.getMetadata().get(['entityDefs', this.entityType, 'links', link, 'entity']);
                    label = this.translate(link, 'links', this.entityType) + '.' +
                        this.translate(field, 'fields', entityType);
                } else {
                    field = part;
                    label = this.translate(field, 'fields', entityType);
                }

                return this.translate('Field', 'labels', 'BpmnFlowchartElement') + ': ' + label;
            }

            return value;
        },
    });
});
