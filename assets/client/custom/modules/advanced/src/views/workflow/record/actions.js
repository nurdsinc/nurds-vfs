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

define('advanced:views/workflow/record/actions', ['view'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/record/actions',

        events: {
            'click [data-action="showAddAction"]': function () {
                this.createView('modal', 'advanced:views/workflow/modals/add-action', {
                    scope: this.entityType,
                    actionList: this.actionTypeList,
                }, view => {
                    view.render();

                    this.listenToOnce(view, 'add', actionType => {
                        this.clearView('modal');

                        this.addAction(actionType, null, true);
                    });
                });
            },
            'click [data-action="addAction"]': function (e) {
                const $target = $(e.currentTarget);
                const actionType = $target.data('type');

                this.addAction(actionType, null, true);
            },
            'click [data-action="removeAction"]': function (e) {
                if (this.confirm) {
                    this.confirm(this.translate('Are you sure?'), () => {
                        const $target = $(e.currentTarget);
                        const id = $target.data('id');

                        this.removeAction(id);
                    });

                    return;
                }

                if (confirm(this.translate('Are you sure?'))) {
                    const $target = $(e.currentTarget);
                    const id = $target.data('id');

                    this.removeAction(id);
                }
            }
        },

        data: function () {
            return {
                actionTypeList: this.actionTypeList,
                entityType: this.entityType,
                readOnly: this.readOnly,
                showNoData: this.readOnly && !(this.model.get('actions') || []).length
            };
        },

        removeAction: function (id)    {
            const $target = this.$el.find(`[data-id="${id}"]`);

            this.clearView(`action-${id}`);

            $target.parent().remove();

            this.trigger('change');
        },

        setup: function () {
            this.readOnly = this.options.readOnly || false;
            this.entityType = this.options.entityType || this.model.get('entityType');
            this.lastCid = 0;

            this.actionTypeList = this.getMetadata().get(['entityDefs', 'Workflow', 'actionList']) || [];
            this.actionTypeList = Espo.Utils.clone(this.actionTypeList);

            this.actionTypeList = Espo.Utils.clone(this.options.actionTypeList || this.actionTypeList);

            if (!this.getMetadata().get(['entityDefs', this.entityType, 'fields', 'assignedUser'])) {
                let index = -1;

                this.actionTypeList.forEach((item, i) => {
                    if (item === 'applyAssignmentRule') {
                        index = i;
                    }
                });

                if (~index) {
                    this.actionTypeList.splice(index, 1);
                }
            }
        },

        cloneData: function (data) {
            data = Espo.Utils.clone(data);

            if (Espo.Utils.isObject(data) || _.isArray(data)) {
                for (const i in data) {
                    data[i] = this.cloneData(data[i]);
                }
            }

            return data;
        },

        afterRender: function () {
            const actions = Espo.Utils.clone(this.model.get('actions') || []);

            actions.forEach(data => {
                data = data || {};

                if (!data.type) {
                    return;
                }

                this.addAction(data.type, this.cloneData(data));
            });

            if (!this.readOnly) {
                const $container = this.$el.find('.actions');

                $container.sortable({
                    handle: '.drag-handle',
                    axis: 'y',
                    containment: '.actions',
                    stop: () => {
                        this.trigger('change');

                        // Fix issue.
                        $container.children().css({
                            position: '',
                            top: '',
                            left: '',
                        });
                    },
                    start: (e, ui) => {
                        ui.placeholder.height(ui.helper.outerHeight());
                    },
                });
            }
        },

        addAction: function (actionType, data, isNew) {
            data = data || {};

            const $container = this.$el.find('.actions');

            const id = data.cid = this.lastCid;
            this.lastCid++;

            let actionId = data.id;

            if (isNew) {
                data.id = actionId = Math.random().toString(36).substr(2, 10);
            }

            const escapedId = this.getHelper().escapeString(id);

            const removeLinkHtml = this.readOnly ? '' :
                '<a role="button" tabindex="0" class="pull-right" data-action="removeAction" data-id="' + escapedId + '">' +
                '<span class="fas fa-times"></span></a>';

            const html = '<div class="clearfix list-group-item">' + removeLinkHtml +
                '<div class="workflow-action" data-id="' + escapedId + '"></div></div>';

            $container.append($(html));

            if (isNew && !this.readOnly) {
                $container.sortable("refresh");
            }

            this.createView(`action-${id}`, `advanced:views/workflow/actions/${Espo.Utils.camelCaseToHyphen(actionType)}`,
            {
                el: this.options.el + ' .workflow-action[data-id="' + id + '"]',
                actionData: data,
                model: this.model,
                entityType: this.entityType,
                actionType: actionType,
                id: id,
                actionId: actionId,
                isNew: isNew,
                readOnly: this.readOnly,
                flowchartElementId: this.options.flowchartElementId,
                flowchartCreatedEntitiesData: this.options.flowchartCreatedEntitiesData,
            }, view => {
                view.render(() => {
                    if (isNew) {
                        view.edit(true);
                    }
                });

                this.listenTo(view, 'change', () => {
                    this.trigger('change');
                });
            });
        },

        fetch: function () {
            const actions = [];

            this.$el.find('.actions .workflow-action').each((index, el) => {
                const actionId = $(el).attr('data-id');

                if (~actionId) {
                    const view = this.getView('action-' + actionId);

                    if (view) {
                        actions.push(view.fetch());
                    }
                }
            });

            return actions;
        },
    });
});
