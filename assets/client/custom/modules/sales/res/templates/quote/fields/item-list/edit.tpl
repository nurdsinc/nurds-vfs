<div class="item-list-container list no-side-margin">{{{itemList}}}</div>
<div class="button-container{{#if isLoading}} hidden{{/if}} margin-top-2x">
    <div class="btn-group">
        <button
            class="btn btn-default btn-icon radius-right"
            data-action="addItem"
            title="{{translate 'Add Item' scope='Opportunity'}}"
        ><span class="fas fa-plus"></span></button>
        {{#if showAddProducts}}
            <button
                type="button"
                class="btn btn-text btn-icon dropdown-toggle"
                data-toggle="dropdown"
            ><span class="fas fa-ellipsis-h"></span></button>
            <ul class="dropdown-menu">
                {{#if showAddProducts}}
                    <li>
                        <a
                            role="button"
                            data-action="addProducts"
                            class="action"
                        >{{translate 'Add Products' scope='Opportunity'}}</a>
                    </li>
                {{/if}}
                {{#if showApplyPriceBook}}
                    <li>
                        <a
                            role="button"
                            data-action="applyPriceBook"
                            class="action"
                        >{{translate 'Apply Price Book' scope='Quote'}}</a>
                    </li>
                {{/if}}
            </ul>
        {{/if}}
    </div>
</div>

{{#if hasTotals}}
    <div class="row{{#unless showFields}} hidden{{/unless}} totals-row margin-top-2x">
        <div class="column col-sm-4 col-xs-6">
            {{#if hasCurrency}}
                <div class="cell form-group">
                    <label class="control-label">
                        {{translate 'currency' category='fields' scope=scope}}
                    </label>
                    <div class="field" data-name="total-currency">{{{currencyField}}}</div>
                </div>
            {{/if}}
        </div>
        <div class="column col-sm-6 col-sm-offset-2 col-xs-6">
            {{#each totalLayout}}
                <div class="cell form-group">
                    <label class="field control-label">
                        {{translate name category='fields' scope=../scope}}
                    </label>
                    <div class="field" data-name="total-{{name}}">
                        {{{var key ../this}}}
                    </div>
                </div>
            {{/each}}
        </div>
    </div>
{{/if}}

