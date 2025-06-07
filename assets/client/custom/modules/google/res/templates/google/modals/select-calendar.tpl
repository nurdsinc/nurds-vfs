{{#unless calendars}}
    {{translate 'No Data'}}
{{/unless}}
<ul class="list-group">
{{#each calendars}}
    <li class="list-group-item clearfix">
        {{./this}}
        <button class="btn btn-default pull-right" data-value="{{@key}}" data-action="select">{{translate 'Select'}}</button>
    </li>
{{/each}}
</ul>
