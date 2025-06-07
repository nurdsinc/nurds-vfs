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

define('advanced:views/workflow/actions/apply-assignment-rule',
['advanced:views/workflow/actions/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/apply-assignment-rule',

        type: 'applyAssignmentRule',

        defaultActionData: {
            assignmentRule: 'Round-Robin',
            targetTeamId: null,
            targetTeamName: null,
            targetUserPosition: null,
            listReportId: null,
            listReportName: null,
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            data.hasListReport = this.actionData.listReportId;
            data.hasTarget = !!this.options.flowchartCreatedEntitiesData;

            if (data.hasTarget) {
                data.targetTranslated = this.getTargetTranslated();
            }

            return data;
        },

        getTargetTranslated: function () {
            var target = this.actionData.target;

            if (!target) {
                return this.translate('Target Entity', 'labels', 'Workflow');
            }
            if (target === 'process') {
                return this.translate('Process', 'labels', 'Workflow');

            } else if (target.indexOf('created:') === 0) {
                return this.translateCreatedEntityAlias(target);
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            var model = new Model();

            model.name = 'Workflow';
            model.set({
                assignmentRule: this.actionData.assignmentRule,
                targetTeamId: this.actionData.targetTeamId,
                targetTeamName: this.actionData.targetTeamName,
                targetUserPosition: this.actionData.targetUserPosition,
                listReportId: this.actionData.listReportId,
                listReportName: this.actionData.listReportName,
            });

            this.createView('assignmentRule', 'views/fields/enum', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="assignmentRule"]',
                defs: {
                    name: 'assignmentRule',
                    params: {
                        options: this.getMetadata().get('entityDefs.Workflow.assignmentRuleList') || []
                    }
                },
                readOnly: true,
            }, view => {
                view.render();
            });

            this.createView('targetTeam', 'views/fields/link', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="targetTeam"]',
                foreignScope: 'Team',
                defs: {
                    name: 'targetTeam'
                },
                readOnly: true,
            }, view => {
                view.render();
            });

            this.createView('targetUserPosition', 'advanced:views/workflow/fields/target-user-position', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="targetUserPosition"]',
                foreignScope: 'Report',
                defs: {
                    name: 'targetUserPosition'
                },
                readOnly: true,
            }, view => {
                view.render();
            });

            this.createView('listReport', 'advanced:views/workflow/fields/list-report', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="listReport"]',
                foreignScope: 'Report',
                entityType: this.model.get('entityType'),
                defs: {
                    name: 'listReport'
                },
                readOnly: true,
            }, view => {
                view.render();
            });
        },
    });
});
