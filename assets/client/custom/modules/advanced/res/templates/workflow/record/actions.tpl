<div>
    <div class="actions{{#unless readOnly}} margin margin-bottom{{/unless}} no-side-margin"></div>
    {{#unless readOnly}}
    <div class="btn-group">
        <button
            class="btn btn-default btn-sm btn-icon radius-right"
            type="button"
            data-action="showAddAction"
            title="{{translate 'Add Action' scope='Workflow'}}"
        ><span class="fas fa-plus"></span></button>
    </div>
    {{/unless}}
</div>

{{#if showNoData}}
<div class="list-container margin-top">
    <div class="no-data">
        {{translate 'No Data'}}
    </div>
</div>
{{/if}}
