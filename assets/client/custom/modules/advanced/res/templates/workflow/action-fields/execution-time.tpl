{{#if readOnly}}
    {{translate type scope='Workflow' category='labels'}}
    <span class="field-container hidden">{{{field}}}</span>
    <span class="shift-days-container hidden">{{{shiftDays}}}</span>
{{else}}
    <div class="row">
        <div class="col-sm-2">
            <span data-field="type">{{{typeField}}}</span>
        </div>
        <div class="field-container col-sm-4 hidden">{{{field}}}</div>
        <div class="shift-days-container col-sm-6 hidden">{{{shiftDays}}}</div>
    </div>
{{/if}}
