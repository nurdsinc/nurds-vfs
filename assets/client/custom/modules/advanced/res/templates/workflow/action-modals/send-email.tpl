<style type="text/css">
    .field-toSpecifiedTeams .list-group, .field-toSpecifiedUsers .list-group, .field-toSpecifiedContacts .list-group {
        margin-bottom: 0;
    }
</style>

<div class="panel panel-default no-side-margin">
    <div class="panel-body panel-body-form">
        <div class="execution-time-container form-group">{{{executionTime}}}</div>
        <div class="row">
            <div class="cell col-sm-6 form-group">
                <label class="control-label">{{translate 'From' scope='Workflow'}}</label>
                <div class="field field-from">{{{from}}}</div>
            </div>
            <div class="cell col-sm-6 from-email-container hidden form-group">
                <label class="control-label">{{translate 'Email Address' scope='Workflow'}}</label>
                <div class="field" data-name="fromEmailAddress">{{{fromEmailAddress}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell col-sm-6 form-group">
                <label class="control-label">{{translate 'To' scope='Workflow'}}</label>
                <div class="field field-to">{{{to}}}</div>
            </div>
            <div class="cell col-sm-6 to-email-container hidden form-group">
                <label class="control-label">{{translate 'Email Address' scope='Workflow'}}</label>
                <div class="field" data-name="toEmailAddress">{{{toEmailAddress}}}</div>
            </div>
            <div class="cell col-sm-6 toSpecifiedTeams-container hidden form-group">
                <label class="control-label">{{translate 'Team' category='scopeNamesPlural'}}</label>
                <div class="field-toSpecifiedTeams">
                    {{{toSpecifiedTeams}}}
                </div>
            </div>
            <div class="cell col-sm-6 toSpecifiedUsers-container hidden form-group">
                <label class="control-label">{{translate 'User' category='scopeNamesPlural'}}</label>
                <div class="field-toSpecifiedUsers">
                    {{{toSpecifiedUsers}}}
                </div>
            </div>
            <div class="cell col-sm-6 toSpecifiedContacts-container hidden form-group">
                <label class="control-label">{{translate 'Contact' category='scopeNamesPlural'}}</label>
                <div class="field-toSpecifiedContacts">
                    {{{toSpecifiedContacts}}}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="cell col-sm-6 form-group">
                <label class="control-label">{{translate 'Reply-To' scope='Workflow'}}</label>
                <div class="field field-replyTo">{{{replyTo}}}</div>
            </div>
            <div class="cell col-sm-6 reply-to-email-container hidden form-group">
                <label class="control-label">{{translate 'Email Address' scope='Workflow'}}</label>
                <div class="field" data-name="replyToEmailAddress">{{{replyToEmailAddress}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell cell-emailTemplate col-sm-6 form-group">
                <label class="control-label">{{translate 'Email Template' scope='Workflow'}}</label>
                <div class="field field-emailTemplate">{{{emailTemplate}}}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell col-sm-6 doNotStore-container form-group">
                <label class="control-label">{{translate 'doNotStore' scope='Workflow'}}</label>
                <div class="field-doNotStore">
                    {{{doNotStore}}}
                </div>
            </div>
            <div class="cell col-sm-6 form-group">
                <label class="control-label">{{translate 'optOutLink' scope='Workflow' category='fields'}}</label>
                <div class="field" data-name="optOutLink">
                    {{{optOutLink}}}
                </div>
            </div>
        </div>

    </div>
</div>
