<div class="panel panel-default no-side-margin">
    <div class="panel-body panel-body-form">
        <div class="row">
            <div class="cell form-group col-md-6" data-name="whatToFollow">
                <label class="control-label">{{translate 'whatToFollow' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="whatToFollow">{{{whatToFollow}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell form-group col-md-6" data-name="recipient">
                <label class="control-label">{{translate 'whoFollow' category='fields' scope='Workflow'}}</label>
                <div class="field" data-name="recipient">{{{recipient}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell form-group col-md-6" data-name="usersToMakeToFollow">
                <label class="control-label">{{translate 'User' category='scopeNamesPlural'}}</label>
                <div class="field" data-name="usersToMakeToFollow">{{{usersToMakeToFollow}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell form-group col-md-6" data-name="specifiedTeams">
                <label class="control-label">{{translate 'Team' category='scopeNamesPlural'}}</label>
                <div class="field" data-name="specifiedTeams">{{{specifiedTeams}}}</div>
            </div>
        </div>
    </div>
</div>
