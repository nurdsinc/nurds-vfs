<div class="button-container">
    <div class="btn-group">
        <button class="btn btn-primary btn-xs-wide" data-action="save">{{translate 'Save'}}</button>
        <button class="btn btn-default btn-xs-wide" data-action="cancel">{{translate 'Cancel'}}</button>
    </div>
</div>

<div class="row">
    <div class="col-sm-6">
        <div class="panel">
            <div class="panel-body">
                <div class="cell cell-enabled form-group">
                    <label class="control-label">{{translate 'enabled' scope='Integration' category='fields'}}</label>
                    <div class="field field-enabled">{{{enabled}}}</div>
                </div>
            </div>
        </div>
        <div class="data-panel">
            <div class="cell cell-connected form-group">
                <button type="button" class="btn btn-danger {{#if isConnected}}hidden{{/if}}" data-action="connect">{{translate 'Connect' scope='ExternalAccount'}}</button>
                <span class="connected-label label label-success {{#unless isConnected}}hidden{{/unless}}">{{translate 'Connected' scope='ExternalAccount'}}</span>
                <span class="disconnect-link {{#unless isConnected}}hidden{{/unless}} pull-right"><a href="#" role="button">{{translate 'Disconnect' scope='ExternalAccount'}}</a></span>
            </div>
            <div class="data-panel-connected">
                {{#each panels}}
                    {{var this ../this}}
                {{/each}}
                <div class="no-panels hidden">
                    {{translate 'noPanels' scope='ExternalAccount' category="messages"}}
                </div>
            </div>
        </div>
    </div>
    <div class="col-sm-6">
        {{#if helpText}}
        <div class="well">
            {{{../helpText}}}
        </div>
        {{/if}}
    </div>
</div>


