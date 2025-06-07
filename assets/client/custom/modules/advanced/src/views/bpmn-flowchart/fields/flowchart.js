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

define('advanced:views/bpmn-flowchart/fields/flowchart', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'advanced:bpmn-flowchart/fields/flowchart/detail',
        editTemplate: 'advanced:bpmn-flowchart/fields/flowchart/edit',

        height: 500,
        inlineEditDisabled: true,
        dataAttribute: 'data',

        events: {
            'click .action[data-action="setStateCreateFigure"]': function (e) {
                let type = $(e.currentTarget).data('name');
                this.setStateCreateFigure(type);
            },
            'click .action[data-action="resetState"]': function () {
                this.resetState(true);
            },
            'click .action[data-action="setStateCreateFlow"]': function () {
                this.setStateCreateFlow();
            },
            'click .action[data-action="setStateRemove"]': function () {
                this.setStateRemove();
            },
            'click .action[data-action="apply"]': function () {
                this.apply();
            },
            'click .action[data-action="zoomIn"]': function () {
                this.zoomIn();
            },
            'click .action[data-action="zoomOut"]': function () {
                this.zoomOut();
            },
            'click .action[data-action="switchFullScreenMode"]': function (e) {
                e.preventDefault();

                if (this.isFullScreenMode) {
                    this.unsetFullScreenMode();
                }
                else {
                    this.setFullScreenMode();
                }
            }
        },

        getAttributeList: function () {
            return [this.dataAttribute];
        },

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.heightString = this.height.toString() + 'px';

            if (this.mode  === 'edit') {
                data.elementEventDataList = this.elementEventDataList;
                data.elementGatewayDataList = this.elementGatewayDataList;
                data.elementTaskDataList = this.elementTaskDataList;
                data.currentElement = this.currentElement;
            }

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            let startColor = '#69a345';
            let intermediateColor = '#5d86b0';
            let endColor = '#b34646';

            this.elementEventList = [
                'eventStart',
                'eventStartConditional',
                'eventStartTimer',
                'eventStartError',
                'eventStartEscalation',
                'eventStartSignal',
                'eventStartCompensation',
                'eventIntermediateConditionalCatch',
                'eventIntermediateTimerCatch',
                'eventIntermediateSignalCatch',
                'eventIntermediateMessageCatch',
                'eventIntermediateEscalationThrow',
                'eventIntermediateSignalThrow',
                'eventIntermediateCompensationThrow',
                'eventEnd',
                'eventEndTerminate',
                'eventEndError',
                'eventEndEscalation',
                'eventEndSignal',
                'eventEndCompensation',
                'eventIntermediateErrorBoundary',
                'eventIntermediateConditionalBoundary',
                'eventIntermediateTimerBoundary',
                'eventIntermediateEscalationBoundary',
                'eventIntermediateSignalBoundary',
                'eventIntermediateMessageBoundary',
                'eventIntermediateCompensationBoundary',
            ];

            this.elementGatewayList = [
                'gatewayExclusive',
                'gatewayInclusive',
                'gatewayParallel',
                'gatewayEventBased',
            ];

            this.elementTaskList = [
                'task',
                'taskSendMessage',
                'taskUser',
                'taskScript',
                '_divider',
                'subProcess',
                'eventSubProcess',
                'callActivity',
            ];

            this.elementEventDataList = [
                {name: 'eventStart', color: startColor},
                {name: 'eventStartConditional', color: startColor},
                {name: 'eventStartTimer', color: startColor},
                {name: 'eventStartError', color: startColor},
                {name: 'eventStartEscalation', color: startColor},
                {name: 'eventStartSignal', color: startColor},
                {name: 'eventStartCompensation', color: startColor},
                {name: '_divider', color: null},
                {name: 'eventIntermediateConditionalCatch', color: intermediateColor},
                {name: 'eventIntermediateTimerCatch', color: intermediateColor},
                {name: 'eventIntermediateSignalCatch', color: intermediateColor},
                {name: 'eventIntermediateMessageCatch', color: intermediateColor},
                {name: '_divider', color: null},
                {name: 'eventIntermediateEscalationThrow', color: intermediateColor},
                {name: 'eventIntermediateSignalThrow', color: intermediateColor},
                {name: 'eventIntermediateCompensationThrow', color: intermediateColor},
                {name: '_divider', color: null},
                {name: 'eventEnd', color: endColor},
                {name: 'eventEndTerminate', color: endColor},
                {name: 'eventEndError', color: endColor},
                {name: 'eventEndEscalation', color: endColor},
                {name: 'eventEndSignal', color: endColor},
                {name: 'eventEndCompensation', color: endColor},
                {name: '_divider', color: null},
                {name: 'eventIntermediateErrorBoundary', color: intermediateColor},
                {name: 'eventIntermediateConditionalBoundary', color: intermediateColor},
                {name: 'eventIntermediateTimerBoundary', color: intermediateColor},
                {name: 'eventIntermediateEscalationBoundary', color: intermediateColor},
                {name: 'eventIntermediateSignalBoundary', color: intermediateColor},
                {name: 'eventIntermediateMessageBoundary', color: intermediateColor},
                {name: 'eventIntermediateCompensationBoundary', color: intermediateColor},
            ];

            this.elementGatewayDataList = [];
            this.elementGatewayList.forEach(item => {
                this.elementGatewayDataList.push({name: item});
            });

            this.elementTaskDataList = [];
            this.elementTaskList.forEach(item => {
                this.elementTaskDataList.push({name: item});
            });

            this.dataHelper = {
                getAllDataList: () => {
                    return this.getAllDataList();
                },
                getElementData: (id) => {
                    return this.getElementData(id);
                },
            };

            this.wait(true);

            Espo.loader.require('lib!client/custom/modules/advanced/lib/espo-bpmn.js', () => this.wait(false));

            this.on('inline-edit-off', () => {
                this.currentState = null;
                this.currentElement = null;
            });

            let data = Espo.Utils.cloneDeep(this.model.get(this.dataAttribute) || {});

            this.dataList = data.list || [];

            this.createdEntitiesData = data.createdEntitiesData || {};

            this.listenTo(this.model, 'change:' + this.dataAttribute, (model, value, o) => {
                if (o.ui) {
                    return;
                }

                let data = Espo.Utils.cloneDeep(this.model.get(this.dataAttribute) || {});

                this.dataList = data.list || [];
            });

            this.on('render', () => {
                if (this.canvas) {
                    this.offsetX = this.canvas.offsetX;
                    this.offsetY = this.canvas.offsetY;
                    this.scaleRatio = this.canvas.scaleRatio;
                }
            });

            this.offsetX = null;
            this.offsetY = null;
            this.scaleRatio = null;
        },

        afterRender: function () {
            this.$groupContainer = this.$el.find('.flowchart-group-container');
            this.$container = this.$el.find('.flowchart-container');

            if (this.isFullScreenMode) {
                this.setFullScreenMode();
            }

            let containerElement = this.$container.get(0);
            let dataList = this.dataList;

            let dataDefaults = {};
            let elements = this.getMetadata().get(['clientDefs', 'BpmnFlowchart', 'elements']) || {};

            for (let type in elements) {
                if ('defaults' in elements[type]) {
                    dataDefaults[type] = Espo.Utils.cloneDeep(elements[type].defaults);
                }
            }

            dataDefaults.subProcess = dataDefaults.subProcess || {};
            dataDefaults.subProcess.targetType = this.model.get('targetType');

            dataDefaults.eventSubProcess = dataDefaults.eventSubProcess || {};
            dataDefaults.eventSubProcess.targetType = this.model.get('targetType');

            let o = {
                canvasWidth: '100%',
                canvasHeight: '100%',
                dataDefaults: dataDefaults,
                events: {
                    change: () => {
                        if (this.mode === 'edit') {
                            this.trigger('change');
                        }
                    },
                    resetState: () => {
                        this.currentElement = null;
                        this.currentState = null;
                        this.resetTool(true);
                    },
                    figureLeftClick: (e) => {
                        let id = e.figureId;

                        if (!id) {
                            return;
                        }

                        this.openElement(id);
                    },
                    removeFigure: (e) => {
                        this.onRemoveElement(e.figureId);
                        this.trigger('change');
                    },
                    createFigure: (e) => {
                        this.onCreateElement(e.figureId, e.figureData);
                    },
                },
                isReadOnly: this.mode !== 'edit',
                scaleDisabled: true,
                isEventSubProcess: this.isEventSubProcess,
            };

            if (this.getThemeManager().getParam('isDark')) {
                this.applyDarkColorsToCanvasOptions(o);
            }

            if (this.offsetX !== null) {
                o.offsetX = this.offsetX;
            }

            if (this.offsetY !== null) {
                o.offsetY = this.offsetY;
            }

            if (this.scaleRatio !== null) {
                o.scaleRatio = this.scaleRatio;
            }

            this.canvas = new window.EspoBpmn.Canvas(containerElement, o, dataList);

            if (this.mode === 'edit') {
                if (this.currentState) {
                    //let o = null;

                    if (this.currentState === 'createFigure') {
                        this.setStateCreateFigure(this.currentElement);
                    }
                    else {
                        let methodName = 'setState' + Espo.Utils.upperCaseFirst(this.currentState);

                        this[methodName]();
                    }
                }
                else {
                    this.resetTool(true);
                }
            }
        },

        openElement: function (id) {
            let elementData = this.getElementData(id);

            if (!elementData) {
                return;
            }

            let parentSubProcessData = this.getParentSubProcessData(id);

            let targetType = this.model.get('targetType');

            if (parentSubProcessData) {
                targetType = parentSubProcessData.targetType || targetType;
            }

            let isInSubProcess = this.isSubProcess;

            if (!isInSubProcess) {
                isInSubProcess = !!parentSubProcessData;
            }

            if (!isInSubProcess) {
                isInSubProcess = !!this.model.get('parentProcessId');
            }

            if (this.mode === 'detail') {
                this.createView('modalView', 'advanced:views/bpmn-flowchart/modals/element-detail', {
                    elementData: elementData,
                    targetType: targetType,
                    flowchartDataList: this.dataList,
                    flowchartModel: this.model,
                    flowchartCreatedEntitiesData: this.createdEntitiesData,
                    dataHelper: this.dataHelper,
                    isInSubProcess: isInSubProcess,
                    isInSubProcess2: !!parentSubProcessData,
                }, (view) => {
                    view.render();

                    this.listenToOnce(view, 'remove', () => {
                        this.clearView('modalView');
                    });
                });

                return;
            }

            if (this.mode === 'edit') {
                this.createView('modalEdit', 'advanced:views/bpmn-flowchart/modals/element-edit', {
                    elementData: elementData,
                    targetType: targetType,
                    flowchartDataList: this.dataList,
                    flowchartModel: this.model,
                    flowchartCreatedEntitiesData: this.createdEntitiesData,
                    dataHelper: this.dataHelper,
                    isInSubProcess: isInSubProcess,
                }, (view) => {
                    view.render();

                    this.listenTo(view, 'apply', (data) => {
                        for (let attr in data) {
                            elementData[attr] = data[attr];
                        }

                        if ('defaultFlowId' in data) {
                            this.updateDefaultFlow(id);
                        }

                        if ('actionList' in data) {
                            this.updateCreatedEntitiesData(id, data.actionList, targetType);
                        }
                        else if (elementData.type === 'taskUser') {
                            this.updateCreatedEntitiesDataUserTask(id, data);
                        }
                        else if (elementData.type === 'taskSendMessage') {
                            this.updateCreatedEntitiesDataSendMessageTask(id, data);
                        }

                        if (parentSubProcessData && parentSubProcessData.type === 'eventSubProcess') {
                            if ((elementData.type || '').indexOf('eventStart') === 0) {
                                this.updateEventSubProcessStartData(parentSubProcessData.id, data);
                            }
                        }

                        this.trigger('change');
                        view.remove();
                        this.reRender();
                    });

                    this.listenToOnce(view, 'remove', () => {
                        this.clearView('modalEdit');
                    });
                });
            }
        },

        updateCreatedEntitiesDataUserTask: function (id, data) {
            let numberId = (id in this.createdEntitiesData) ?
                this.createdEntitiesData[id].numberId :
                this.getNextCreatedEntityNumberId('BpmnUserTask');

            this.createdEntitiesData[id] = {
                elementId: id,
                actionId: null,
                entityType: 'BpmnUserTask',
                numberId: numberId,
                text: data.text || null,
            };
        },

        updateCreatedEntitiesDataSendMessageTask: function (id, data) {
            if (data.messageType === 'Email' && !data.doNotStore) {
                let numberId = (id in this.createdEntitiesData) ?
                    this.createdEntitiesData[id].numberId :
                    this.getNextCreatedEntityNumberId('Email');

                this.createdEntitiesData[id] = {
                    elementId: id,
                    actionId: null,
                    entityType: 'Email',
                    numberId: numberId,
                    text: data.text || null,
                };

                return;
            }

            delete this.createdEntitiesData[id];
        },

        removeCreatedEntitiesDataUserTask: function (id) {
            delete this.createdEntitiesData[id];
        },

        updateCreatedEntitiesData: function (id, actionList, targetType) {
            let toRemoveEIdList = [];

            for (let eId in this.createdEntitiesData) {
                let item = this.createdEntitiesData[eId];

                if (item.elementId === id) {
                    let isMet = false;

                    actionList.forEach(actionItem => {
                        if (item.actionId === actionItem.id) {
                            isMet = true;
                        }
                    });

                    if (!isMet) {
                        toRemoveEIdList.push(eId);
                    }
                }
            }

            toRemoveEIdList.forEach((eId) => {
                delete this.createdEntitiesData[eId];
            });

            actionList.forEach(item => {
                if (!~['createRelatedEntity', 'createEntity'].indexOf(item.type)) {
                    return;
                }

                let eId = id + '_' + item.id;

                let entityType;
                let link = null;

                if (item.type === 'createEntity') {
                    entityType = item.entityType;
                }
                else if (item.type === 'createRelatedEntity') {
                    link = item.link;
                    targetType = targetType || this.model.get('targetType');
                    entityType = this.getMetadata().get(['entityDefs', targetType, 'links', item.link, 'entity']);
                }

                if (!entityType) {
                    return;
                }

                let numberId = (eId in this.createdEntitiesData) ?
                    this.createdEntitiesData[eId].numberId :
                    this.getNextCreatedEntityNumberId(entityType);

                this.createdEntitiesData[eId] = {
                    elementId: id,
                    actionId: item.id,
                    link: link,
                    entityType: entityType,
                    numberId: numberId,
                };
            });
        },

        getNextCreatedEntityNumberId: function (entityType) {
            let numberId = 0;

            for (let eId in this.createdEntitiesData) {
                let item = this.createdEntitiesData[eId];

                if (entityType === item.entityType) {
                    if ('numberId' in item) {
                        numberId = item.numberId + 1;
                    }
                }
            }

            return numberId;
        },

        updateDefaultFlow: function (id) {
            let data = this.getElementData(id);
            let flowIdItemList = this.getElementFlowIdList(id);

            flowIdItemList.forEach(flowId => {
                let flowData = this.getElementData(flowId);

                if (!flowData) {
                    return;
                }

                flowData.isDefault = data.defaultFlowId === flowId;
            });
        },

        getElementFlowIdList: function (id) {
            let idList = [];

            this.getAllDataList().forEach(item => {
                if (item.type !== 'flow') {
                    return;
                }

                if (item.startId === id && item.endId) {
                    let endItem = this.getElementData(item.endId);

                    if (!endItem) {
                        return;
                    }

                    idList.push(item.id);
                }
            });

            return idList;
        },

        getElementData: function (id) {
            let o = {};
            this._findElementData(id, this.dataList, o);

            return o.data || null;
        },

        _findElementData: function (id, dataList, o) {
            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i].id === id) {
                    o.data = dataList[i];

                    return;
                }

                if (dataList[i].type === 'subProcess' || dataList[i].type === 'eventSubProcess') {
                    this._findElementData(id, dataList[i].dataList || [], o);

                    if (o.data) {
                        return;
                    }
                }
            }
        },

        getParentSubProcessId: function (id) {
            let o = {};
            this._findParentSubProcessId(id, this.dataList, o);

            return o.id || null;
        },

        _findParentSubProcessId: function (id, dataList, o, parentId) {
            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i].id === id) {
                    o.id = parentId;

                    return;
                }

                if (dataList[i].type === 'subProcess' || dataList[i].type === 'eventSubProcess') {
                    this._findParentSubProcessId(id, dataList[i].dataList || [], o, dataList[i].id);

                    if (o.id) {
                        return;
                    }
                }
            }
        },

        getParentSubProcessData: function (id) {
            let o = {};
            this._findParentSubProcessData(id, this.dataList, o);

            return o.data || null;
        },

        _findParentSubProcessData: function (id, dataList, o, parentData) {
            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i].id === id) {
                    o.data = parentData;

                    return;
                }

                if (dataList[i].type === 'subProcess' || dataList[i].type === 'eventSubProcess') {
                    this._findParentSubProcessData(id, dataList[i].dataList || [], o, dataList[i]);

                    if (o.data) {
                        return;
                    }
                }
            }
        },

        updateEventSubProcessStartData: function (id, data) {
            let item = this.getElementData(id);

            item.eventStartData = _.extend(item.eventStartData, Espo.Utils.cloneDeep(data));
        },

        resetTool: function (isHandTool) {
            this.$el.find('.action[data-action="setStateCreateFigure"] span').addClass('hidden');
            this.$el.find('.button-container .btn').removeClass('active');

            if (isHandTool) {
                this.$el.find('.button-container .btn[data-action="resetState"]').addClass('active');
            }
        },

        setStateCreateFigure: function (type) {
            this.currentElement = type;

            this.currentState = 'createFigure';
            this.canvas.setState('createFigure', {type: type});

            this.resetTool();

            this.$el
                .find('.action[data-action="setStateCreateFigure"][data-name="'+type+'"] span')
                .removeClass('hidden');

            if (~this.elementEventList.indexOf(type)) {
                this.$el.find('.button-container .btn.add-event-element').addClass('active');
            }
            else if (~this.elementGatewayList.indexOf(type)) {
                this.$el.find('.button-container .btn.add-gateway-element').addClass('active');
            }
            else if (~this.elementTaskList.indexOf(type)) {
                this.$el.find('.button-container .btn.add-task-element').addClass('active');
            }
        },

        setStateCreateFlow: function () {
            this.resetState();
            this.currentState = 'createFlow';
            this.canvas.setState('createFlow');

            this.$el.find('.button-container .btn[data-action="setStateCreateFlow"]').addClass('active');
        },

        setStateRemove: function () {
            this.resetState();
            this.currentState = 'remove';
            this.canvas.setState('remove');

            this.$el.find('.button-container .btn[data-action="setStateRemove"]').addClass('active');
        },

        resetState: function (isHandTool) {
            this.canvas.resetState();
            this.currentState = null;
            this.currentElement = null;
            this.resetTool(isHandTool);
        },

        getAllDataList: function () {
            let list = [];
            this._populateAllList(this.dataList, list);

            return list;
        },

        _populateAllList: function (dataList, list) {
            for (let i = 0; i < dataList.length; i++) {
                list.push(dataList[i]);

                if (dataList[i].type === 'subProcess' || dataList[i].type === 'eventSubProcess') {
                    this._populateAllList(dataList[i].dataList || [], list);
                }
            }
        },

        onCreateElement: function (id, data) {
            let item = this.getElementData(id);

            if (item.type === 'taskUser') {
                this.updateCreatedEntitiesDataUserTask(id, item);
            }
            else if (item.type === 'taskSendMessage') {
                this.updateCreatedEntitiesDataSendMessageTask(id, item);
            }
        },

        onRemoveElement: function (id) {
            this.getAllDataList().forEach(item => {
                if (item.defaultFlowId === id) {
                    item.defaultFlowId = null;
                }

                if (item.flowList) {
                    let flowList = item.flowList;
                    let flowListCopy = [];
                    let isMet = false;

                    flowList.forEach(flowItem => {
                        if (flowItem.id === id) {
                            isMet = true;

                            return;
                        }

                        flowListCopy.push(flowItem);
                    });

                    if (isMet) {
                        item.flowList = flowListCopy;
                    }
                }
            });

            this.updateCreatedEntitiesData(id, []);
            this.removeCreatedEntitiesDataUserTask(id);
        },

        setFullScreenMode: function () {
            this.isFullScreenMode = true;

            let color = null;
            let $ref = this.$groupContainer;

            while (1) {
                color = window.getComputedStyle($ref.get(0), null).getPropertyValue('background-color');

                if (color && color !== 'rgba(0, 0, 0, 0)') {
                    break;
                }

                $ref = $ref.parent();

                if (!$ref.length) {
                    break;
                }
            }

            this.$groupContainer.css({
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                zIndex: 1050,
                left: 0,
                backgroundColor: color,
            });

            this.$container.css('height', '100%');
            this.$el.find('button[data-action="apply"]').removeClass('hidden');

            this.canvas.params.scaleDisabled = false;
        },

        unsetFullScreenMode: function () {
            this.isFullScreenMode = false;

            this.$groupContainer.css({
                width: '',
                height: '',
                position: 'static',
                top: '',
                left: '',
                zIndex: '',
                backgroundColor: '',
            });

            this.$container.css('height', this.height.toString() + 'px');

            this.$el.find('button[data-action="apply"]').addClass('hidden');

            this.canvas.params.scaleDisabled = true;
        },

        apply: function () {
            this.model
                .save()
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));
                });
        },

        zoomIn: function () {
            this.canvas.scaleCentered(2);
        },

        zoomOut: function () {
            this.canvas.scaleCentered(-2);
        },

        fetch: function () {
            let fieldData = {};

            fieldData.list = Espo.Utils.cloneDeep(this.dataList);
            fieldData.createdEntitiesData = Espo.Utils.cloneDeep(this.createdEntitiesData);

            let data = {};

            data[this.dataAttribute] = fieldData;

            return data;
        },

        applyDarkColorsToCanvasOptions: function (o) {
            o.textColor = this.getThemeManager().getParam('textColor') || '#fff';
            o.strokeColor = '#8a8f89';
            o.rectangleExpandedFillColor = '#242424';
            o.taskStrokeColor = o.strokeColor;
            o.taskFillColor = '#1a1a1a';
            o.eventStartFillColor = '#70995e';
            o.eventStartStrokeColor = '#426e26';
            o.gatewayStrokeColor = '#7e7437';
            o.gatewayFillColor = '#afa152';
            o.eventEndFillColor = '#ab5b5b';
            o.eventEndStrokeColor = '#6a3b3b';
            o.eventIntermediateFillColor = '#6c88b3';
            o.eventIntermediateStrokeColor = '#435d87';
        },
    });
});
