{{#if readOnly}}
    {{translateOption value scope='Workflow' field='subjectType'}}
{{else}}
    <span data-field="value">{{{valueField}}}</span>
{{/if}}
