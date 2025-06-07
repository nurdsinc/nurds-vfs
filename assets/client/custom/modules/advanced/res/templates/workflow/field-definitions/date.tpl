{{#if readOnly}}
    <span class="subject">
        {{#if subject}} {{{subject}}} {{else}} {{translate 'today' scope='Workflow' category='labels'}} {{/if}}
    </span>
    <span class="shift-days">
        {{{shiftDays}}}
    </span>
{{else}}
    <div class="row">
        <div class="col-sm-2 subject-type">
            <span data-field="subjectType">{{{subjectTypeField}}}</span>
        </div>

        <div class="col-sm-4 subject">
            {{{subject}}}
        </div>

        <div class="col-sm-5 shift-days">
            {{{shiftDays}}}
        </div>
    </div>
{{/if}}
