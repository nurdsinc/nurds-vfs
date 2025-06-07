{{#if readOnly}}
    {{translate shiftDaysOperator scope='Workflow' category='labels'}} {{value}} {{translate unitValue scope='Workflow' category='labels'}}
{{else}}
<div class="row">
    <div class="col-sm-4">
        <span data-field="operator">{{{operatorField}}}</span>
    </div>
    <div class="col-sm-4">
        <span data-field="value">{{{valueField}}}</span>
    </div>
    <div class="col-sm-4">
        <span data-field="unit">{{{unitField}}}</span>
    </div>
</div>
{{/if}}
