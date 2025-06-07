{{#if itemDataList.length}}
<table class="table less-padding table-bottom-bordered">
    <thead>
        <tr>
            {{#each listLayout}}
            <th
                {{#if width}}
                    width="{{width}}%"
                {{else}}
                    {{#if widthPx}} width="{{widthPx}}"{{/if}}
                {{/if}}
                {{#if align}} style="text-align: {{align}}"{{/if}}
            >
                <span>
                    {{#if customLabel}}{{customLabel}}{{else}}{{translate name category='fields' scope=@root.itemEntityType}}{{/if}}
                </span>
            </th>
            {{/each}}
            {{#ifEqual mode 'edit'}}
            <th width="{{#ifEqual mode 'edit'}}51{{else}}1{{/ifEqual}}">
                &nbsp;
            </th>
            {{/ifEqual}}
            {{#if showRowActions}}
            <td width="25">
               &nbsp;
            </td>
            {{/if}}
        </tr>
    </thead>

    <tbody class="item-list-internal-container">
    {{#each itemDataList}}
        <tr class="item-container item-container-{{id}}" data-id="{{id}}">
        {{{var key ../this}}}
        </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
