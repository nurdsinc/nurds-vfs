<div class="row report-control-panel margin-bottom">
    <div class="report-runtime-filters-container col-md-12">{{{runtimeFilters}}}</div>
    <div class="col-md-4 col-md-offset-8">
        <div class="button-container clearfix">
            <div class="btn-group pull-right">
                {{#if hasRuntimeFilters}}
                <button
                    class="btn btn-default"
                    data-action="run"
                >&nbsp;&nbsp;{{translate 'Run' scope='Report'}}&nbsp;&nbsp;</button>
                {{else}}
                <button
                    class="btn btn-default btn-icon btn-icon-wide"
                    data-action="refresh"
                    title="{{translate 'Refresh'}}"
                ><span class="fas fa-sync-alt"></span></button>
                {{/if}}
                <button
                    type="button"
                    class="btn btn-default dropdown-toggle"
                    data-toggle="dropdown"
                ><span class="fas fa-ellipsis-h"></span></button>
                <ul class="dropdown-menu">
                    <li><a role="button" tabindex="0" data-action="exportReport">{{translate 'Export'}}</a></li>
                    {{#if hasSendEmail}}
                    <li><a role="button" tabindex="0" data-action="sendInEmail">{{translate 'Send Email' scope='Report'}}</a></li>
                    {{/if}}
                    {{#if hasPrintPdf}}
                    <li><a role="button" tabindex="0" data-action="printPdf">{{translate 'Print to PDF'}}</a></li>
                    {{/if}}
                </ul>
            </div>
        </div>
    </div>
</div>
<div class="hidden information-box text-info margin-bottom small"></div>
<div class="report-results-container sections-container"></div>
