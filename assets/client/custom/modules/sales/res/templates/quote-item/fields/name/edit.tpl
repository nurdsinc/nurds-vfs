{{#if hasSelectProduct}}
<div class="input-group">
{{/if}}
    <input
        type="text"
        class="main-element form-control"
        data-name="{{name}}"
        {{#if isProduct}}readonly="readonly"{{/if}}
        value="{{value}}"
        {{#if params.maxLength}}maxlength="{{params.maxLength}}"{{/if}}
        autocomplete="espo-{{name}}"
    >
{{#if hasSelectProduct}}
    <span class="input-group-btn">
        <button
            class="btn btn-default{{#if productSelectDisabled}} disabled{{/if}} btn-icon"
            data-action="selectProduct"
            title="{{translate 'Select Product' scope='Quote'}}"
        >
            <span class="fas fa-angle-up"></span>
        </button>
    </span>
</div>
{{/if}}
