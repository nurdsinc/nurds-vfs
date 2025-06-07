{{#if isEmpty}}
    {{#ifNotEqual mode 'edit'}}
        <div class="form-group none-value">{{translate 'None'}}</div>
    {{/ifNotEqual}}
{{/if}}

<div class="item-list-container list no-side-margin margin-bottom">{{{itemList}}}</div>
