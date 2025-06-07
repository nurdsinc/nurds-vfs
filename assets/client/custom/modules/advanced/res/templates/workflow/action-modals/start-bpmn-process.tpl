<div class="panel panel-default no-side-margin">
    <div class="panel-body panel-body-form">
        <div class="row">
            <div class="cell col-sm-6 form-group" data-name="target">
                <label class="control-label">{{translate 'target' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="target">
                    {{{target}}}
                </div>
            </div>
        </div>

        <div class="row">
            <div class="cell cell-workflow col-sm-6 form-group">
                <label class="control-label">{{translate 'BpmnFlowchart' category='scopeNames'}}</label>
                <div class="field"  data-name="flowchart">{{{flowchart}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell cell-workflow col-sm-6 form-group">
                <label class="control-label">{{translate 'startElementId' scope='BpmnProcess' category='fields'}}</label>
                <div class="field" data-name="elementId">{{{elementId}}}</div>
            </div>
        </div>

    </div>
</div>
