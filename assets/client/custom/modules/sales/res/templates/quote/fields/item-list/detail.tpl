{{#if isEmpty}}
    {{#ifNotEqual mode 'edit'}}
        <div class="form-group none-value">{{translate 'None'}}</div>
    {{/ifNotEqual}}
{{/if}}

<div class="item-list-container list no-side-margin {{#if showFields}} margin-bottom-2x{{/if}}">{{{itemList}}}</div>


{{#if hasTotals}}
    <div class="row{{#unless showFields}} hidden{{/unless}} totals-row margin-top-2x">
        <div class="cell col-sm-6 col-xs-6 form-group">
        </div>

        {{#each totalLayout}}
        <div class="cell{{#unless isFirst}} col-sm-offset-6 col-xs-offset-6{{/unless}} col-sm-6 col-xs-6 form-group">
            <label class="field control-label">
                {{translate name category='fields' scope=../scope}}
            </label>
            <div class="field" data-name="total-{{name}}">
                {{{var key ../this}}}
            </div>
        </div>
        {{/each}}
    </div>
{{/if}}
