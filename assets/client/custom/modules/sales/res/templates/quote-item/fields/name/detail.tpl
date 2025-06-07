{{#if isProduct}}
    {{#if hasInventoryQuantity}}
        <span style="user-select: none;">
        <a
            role="button"
            class="inventory-info text-{{style}}"
            title="{{translate message category='messages' scope='Quote'}}"
        ><span class="fas {{#if warning}}fa-exclamation-circle{{else}}fa-check-circle{{/if}}"></span></a>
    </span>
    {{/if~}}
    <a
        href="#Product/view/{{productId}}"
        {{#if targetBlank}}target="_blank"{{/if}}
    >{{value}}</a>
{{else}}
    {{value}}
{{/if}}
