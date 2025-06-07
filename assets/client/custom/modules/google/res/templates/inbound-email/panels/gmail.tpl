
{{#if viewObject.isNotConfigured}}
    {{translate 'notConfigured' scope='Google' category='messages'}}
{{else}}
    {{#if viewObject.isLoaded}}
        {{#if viewObject.isConnected}}
        <div><span class="connected-label label label-success">{{translate 'Connected' scope='ExternalAccount'}}</span></div>
        <div style="margin-top: 10px;">
        	<button class="btn btn-default" data-action="disconnect">{{translate 'Disconnect' scope='ExternalAccount'}}</button>
        </div>
        {{else}}
        <div><span class="disconnected-label label label-default">{{translate 'Disconnected' scope='ExternalAccount'}}</span></div>
        <div style="margin-top: 10px;">
        	<button class="btn btn-default" data-action="connect">{{translate 'Connect' scope='ExternalAccount'}}</button>
    	</div>
        {{/if}}
    {{else}}...{{/if}}
{{/if}}