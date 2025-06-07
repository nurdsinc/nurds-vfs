<div class="panel panel-default no-side-margin">
    <div class="panel-body panel-body-form">
        <div class="row">
            <div class="cell form-group col-md-6" data-name="requestType">
                <label class="control-label">{{translate 'requestType' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="requestType">{{{requestType}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell form-group col-md-12" data-name="requestUrl">
                <label class="control-label">{{translate 'requestUrl' category='fields' scope='Workflow'}} *</label>
                <div class="field" data-name="requestUrl">{{{requestUrl}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell form-group col-md-12" data-name="headers">
                <label class="control-label">{{translate 'headers' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="headers">{{{headers}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell form-group col-md-6" data-name="contentType">
                <label class="control-label">{{translate 'requestContentType' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="contentType">{{{contentType}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell form-group col-md-12" data-name="content">
                <label class="control-label">{{translate 'requestContent' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="content">{{{content}}}</div>
            </div>
        </div>

        <div class="row">
            <div class="cell form-group col-md-6" data-name="contentVariable">
                <label class="control-label">{{translate 'requestContentVariable' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="contentVariable">{{{contentVariable}}}</div>
            </div>
        </div>
    </div>
</div>
