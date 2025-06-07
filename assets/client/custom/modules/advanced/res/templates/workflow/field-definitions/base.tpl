{{#if readOnly}}
    <div class="subject">
        {{{subject}}}
    </div>
{{else}}
<div class="row">
    <div class="col-sm-2 subject-type">
        <span data-field="subjectType">{{{subjectTypeField}}}</span>
    </div>

    <div class="col-sm-6 subject">
        {{{subject}}}
    </div>

    {{#if hasActionType}}
        <div class="col-sm-3" data-field="actionType">{{{actionTypeField}}}</div>
    {{/if}}
</div>
{{/if}}
