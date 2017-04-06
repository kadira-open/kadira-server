EmailTemplates = {};

var newCollabTmpl = i18n("share.collaborator_invite_email_tmpl");
EmailTemplates.notifyNewCollaborator = _.template(newCollabTmpl);

var newOwnerTemp = i18n("share.notify_new_owner_email_templ");
EmailTemplates.notifyNewOwner = _.template(newOwnerTemp);