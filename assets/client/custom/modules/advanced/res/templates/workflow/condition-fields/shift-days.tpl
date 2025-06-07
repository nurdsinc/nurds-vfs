{{#if readOnly}}
    {{translate shiftDaysOperator scope='Workflow'}} {{value}} {{translate 'days' scope='Workflow'}}
{{else}}
    <div class="row">
        <div class="col-sm-11">
            <div class="input-group input-group-sm">
                <span data-field="operator" class="input-group-item" style="width: 40px;">{{{operatorField}}}</span>
                <span data-field="value" class="input-group-item input-group-item-middle">{{{valueField}}}</span>
                <span class="small input-group-addon radius-right" style="max-width: 60px;">{{translate 'days' scope='Workflow'}}</span>
            </div>
        </div>
    </div>
{{/if}}
