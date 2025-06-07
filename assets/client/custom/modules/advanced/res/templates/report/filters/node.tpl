<style>
    .node-operator:last-child {
        display: none;
    }
</style>

<div class="item-list"></div>

<div class="buttons btn-group">
    <a class="small dropdown-toggle" role="button" tabindex="0" data-toggle="dropdown"><span class="fas fa-plus"></span> {{translate operator category='filtersGroupTypes' scope='Report'}}</a>
    <ul class="dropdown-menu">
        {{#unless fieldDisabled}}
        <li><a data-action="addField" role="button" tabindex="0" title="{{translate 'Add field' scope='Report'}}">{{translate 'Field' scope='Report'}}</a></li>
        {{/unless}}
        {{#unless orDisabled}}
        <li><a data-action="addOr" role="button" tabindex="0" title="{{translate 'Add OR group' scope='Report'}}">(... {{translate 'OR' scope='Report'}} ...)</a></li>
        {{/unless}}
        {{#unless andDisabled}}
        <li><a data-action="addAnd" role="button" tabindex="0" title="{{translate 'Add AND group' scope='Report'}}">(... {{translate 'AND' scope='Report'}} ...)</a></li>
        {{/unless}}
        {{#unless notDisabled}}
        <li><a data-action="addNot" role="button" tabindex="0" title="{{translate 'Add NOT group' scope='Report'}}">{{translate 'NOT' scope='Report'}} (...)</a></li>
        {{/unless}}
        {{#unless subQueryInDisabled}}
        <li><a data-action="addSubQueryIn" role="button" tabindex="0" title="{{translate 'Add IN group' scope='Report'}}">{{translate 'IN' scope='Report'}} (...)</a></li>
        {{/unless}}
        {{#unless complexExpressionDisabled}}
        <li><a data-action="addComplexExpression" role="button" tabindex="0" title="{{translate 'Add Complex expression' scope='Report'}}">{{translate 'Complex expression' scope='Report'}}</a></li>
        {{/unless}}
        {{#unless havingDisabled}}
        <li><a data-action="addHavingGroup" role="button" tabindex="0" title="{{translate 'Add Having group' scope='Report'}}">{{translate 'Having' scope='Report'}}</a></li>
        {{/unless}}
    </ul>
</div>