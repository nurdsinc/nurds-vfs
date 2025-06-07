{{#unless isBlocked}}
 <div class="panel panel-default panel-{{name}}" data-panel-name="{{name}}">
        <div class="panel-heading">
            <h4 class="panel-title">
                <div class="cell cell-{{name}}Enabled">
                    <div class="field field-{{name}}Enabled">
                        <label class="control-label {{name}}Enabled unselectable" >
                            <input class="product-panel enable-panel main-element" type="checkbox" name="{{name}}Enabled" {{#if isActive}} checked{{/if}}>
                                {{translate name scope='Google' category='products'}}
                        </label>
                    </div>
                </div>
            </h4>
        </div>
        {{#if hasFields}}
        <div class="panel-body">
            {{#each fields}}
                <div class="cell cell-{{./this}} form-group">
                    <label class="control-label">{{translate ./this scope='ExternalAccount' category='fields'}}</label>
                    <div class="field field-{{./this}}" data-name="{{./this}}"> {{var this ../this}} </div>
                </div>
            {{/each}}
        </div>
        {{/if}}
    </div>
{{/unless}}
