/* eslint max-len: 0 */

i18n.setDefaultLanguage("en");

var strings = {};

strings.common = {
  "or": "or",
  "copied_to_clipboard": "Copied '{$1}' to clipboard",
  "creating": "Creating ...",
  "loading": "Loading ...",
  "no_data": "No Data Found",
  "sorted_by": "Sorted By",
  "settings": "Settings",
  "share": "Share",
  "alerts": "Alerts",
  "change": "Change",
  "save": "Save",
  "saving": "Saving..",
  "cancel": "Cancel",
  "close": "Close",
  "confirm": "Confirm",
  "add": "Add",
  "resend": "Resend",
  "load_more": "Load more",
  "back": "Back",
  "delete": "Delete",
  "share_this": "SHARE THIS",
  "show_hosts": "Show Hosts",
  "site_name": "Kadira",
  "analyze": "Analyze",
  "upgrade": "Upgrade"
};

strings.signIn = {
  "already_connected_meteor_dev_account":
    "This Meteor Developer account is already associated with an existing Kadira account.",
  "already_registed_via_email":
    "Please login with your email: \"{$1}\" and connect your Meteor developer account from the profile.",
  "privacy_policy_links": "By clicking Sign Up, you agree to our <a href='{{$1}}'>Privacy Policy</a> and <a href='{{$2}}'>Terms of Use</a>",
  "sign_in_with_email": "Sign In with your email address",
  "forgot_your_password": "Forgot your password?",
  "sign_in": "Sign In",
  "sign_up": "Sign Up",
  "dont_have_a_kadira_account": "Dont have a Kadira account?",
  "already_have_a_kadira_account": "Already have a Kadira account?",
  "email": "Email",
  "password": "Password",
  "sign_in_message": "Sign in to view this page"
};

strings.apps = {
  "create_app_form_title": "create new app",
  "create_app": "Create App",
  "create_new": "Create New",
  "app_name": "App Name",
  "my_apps": "My Apps",
  "created_date": "Created Date"
};

strings.app = {
  "configure_your_app": "Configure Your App",
  "config_install_pkg": "Install our Smart Package",
  "config_connect_code": "Connect to Kadira using one of the following methods.",
  "config_learn_more": "Your data will be available within one minute. For more info, please refer the <a href=\"https://kadira.io/academy/getting-started-with-kadira/\" class='link'>Getting Started Guide</a>.",
  "config_configurations": "Raw AppId and appSecret",
  "config_other_way": "If you need to configure your app in some other way",
  "app_id": "App ID",
  "app_secret": "App Secret",
  "summary": "Summary",
  "trends": "Trends",
  "predictions": "Relations & Predictions",
  "cpu_profiler": "CPU Profiler",
  "pub_sub": "Pub/Sub",
  "methods": "Methods",
  "overview": "Overview",
  "live_queries": "Live Queries",
  "charts": "Charts",
  "observer_info": "Observer Info",
  "viewing_app_as_admin": "Viewing app as admin",
  "documents": "Documents & Updates"
};

strings.validations = {
  "app_name_validation_failed": "Please enter App Name using alphanumerical characters and \"-\" only!",
  "app_name_too_long": "App Name should not be longer than 50 characters!",
  "url_validation_failed": "Please enter a valid url",
  "email_validation_failed": "Please enter a valid email"
};

strings.share = {
  "application_sharing": "Application Sharing",
  "owner": "Owner",
  "app_owner_email_empty": "Please enter new app owner's email",
  "enter_app_name_to_confirm": "Please enter app name to confirm ownership change",
  "enter_app_name_to_confirm_failed": "Please enter app name correctly to confirm ownership change",
  "collaborator_email_empty": "Please enter collaborator's email",
  "changed_app_ownership_to": "Changed app ownership to {$1}",
  "add_collaborator_not_permitted": "You are not authorized to add collaborators",
  "remove_collaborator_not_permitted": "You are not authorized to remove collaborators",
  "reached_collaborators_limit": "You have reached maximum number of collaborators limit. Please upgrade.",
  "could_not_add_collaborator": "could not add collaborator: {$1}",
  "pending_collaborator_already_invited": "you have already invited {$1} to collaborate",
  "pending_collaborators": "Pending Collaborators",
  "pending_user_invite_email_tmpl_subject": "Accept Invitation for App: <%= appName %>",
  "collaborator_invite_email_tmpl": "Hello, <br/><br> Congratulations! You now have access to <b><%= appName %></b> on Kadira. We look forward to see you at kadira often. <br> Please <a href='<%= inviteUrl %>'>Visit Kadira</a> to begin.<br><br>Thank You!",
  "new_app_owner_not_registered": "{$1} is not a registered user in Kadira. Please ask him to register first.",
  "invite_not_found": "Invite not found",
  "invite_again_success": "Invited again successfully",
  "already_invited_collaborator": "You have added this collaborator already",
  "failed_to_add_collaborator": "failed to add collaborator",
  "notify_new_owner_subject": "You received ownership of application : <%= appName %>",
  "notify_new_owner_email_templ": "Hello, <br/><br> Congratulations! You are invited to become the owner of application <a href='<%= appLink %>'><%= appName %></a> on Kadira. Click <a href='<%= inviteUrl %>'> here </a> to accept invitation.",
  "change_owner_not_permitted": "You are not authorized to change app ownership",
  "remove_collaborator_success": "Collaborator removed successfully",
  "add_collaborator_success": "Collaborator added successfully",
  "new_owner_email": "New Owner Email",
  "enter_app_name": "Enter App Name",
  "collaborator_email": "collaborator's email",
  "cancel_invite_success": "Canceled collaboration invite successfully",
  "processing_invitation": "please wait ...",
  "collaborators": "Collaborators",
  "app_not_found": "App Not found",
  "already_owner": "you are already the owner of this application",
  "remove_pending_user_denied": "You are not authorized to remove pending users",
  "resending_invite_defenied": "You are not authorized to reinvite users",
  "upgrade_to_add_collaborators": "Please upgrade your plan to manage collaborators",
  "only_paid_users_can_accept_apps": "Please upgrade your plan to accept this app ownership"
};

strings.tools = {
  "take_remote_profile": "Take a Remote Profile",
  "visit_kadira_debug_to_local_profiles": "Visit Kadira Debug to take local profiles",
  "install_kadira_profiler_msg": "Make sure you've installed <a href=\"https://github.com/meteorhacks/kadira-profiler\" target=\"_blank\"><b>Kadira Profiler package</b></a> into your app:<code>meteor add meteorhacks:kadira-profiler</code>",
  "duration": "Duration",
  "name": "Name",
  "invalid_job_name": "Please use alpha numeric charactors only",
  "seconds": "{$1} Seconds",
  "minute": "1 minute",
  "minutes": "{$1} minutes",
  "job_delete_confirm": "Are you sure you want to delete this profile? ",
  "delete_job_success": "profile deleted",
  "take_a_local_profile": "Take a Local Profile",
  "learn_how_to_analyze_profile": "Learn how to analyze a CPU Profile",
  "cpu_analyzer": "CPU Analyzer",
  "could_not_load_cpu_profile": "Could not load CPU profile"
};

strings.tools.labels = {
  "pubsub-initial-adds": "Sending initial subscription data",
  "pubsub-sendAdded": "Sending new documents",
  "pubsub-sendChanged": "Sending document changes",
  "pubsub-sendRemoved": "Sending document remove messages",
  "crossbar-listen": "Listening for Crossbar",
  "crossbar-fire": "Firing Crossbar",
  "mongo-receive": "Receiving data from MongoDB",
  "data-send": "Sending other data via DDP",
  "cursor-observeChanges": "Cursor.observeChanges",
  "cursor-fetch": "Cursor.fetch",
  "cursor-map": "Cursor.map",
  "cursor-forEach": "Cursor.forEach",
  "cursor-count": "Cursor.count",
  "cursor-observe": "Cursor.observe",
  "mongo-insert": "Inserting MongoDB documents",
  "mongo-update": "Updating MongoDB documents",
  "mongo-remove": "Removing MongoDB documents",
  "oplog-initial-query": "Initial DB Quering (with oplog)",
  "proto._runQuery": "DB Quering (with oplog)",
  "mongo-parsing": "Parsing incoming MongoDB documents"
};

strings.dashboard = {};

strings.dashboard.pubsub = {
  "sub_rate": "Sub Rate",
  "unsub_rate": "Unsub Rate",
  "avg_response_time": "Response Time",
  "low_observer_reuse": "Low Observer Reuse",
  "high_observer_reuse": "High Observer Reuse",
  "shortest_lifespan": "Shortest Lifespan",
  "active_subs": "Active Subs",
  "created_observers": "Created Observers",
  "deleted_observers": "Deleted Observers",
  "cached_observers": "Reused Observers",
  "total_observer_handlers": "Total Observer Handlers"
};

strings.dashboard.methods = {
  "throughput": "Throughput",
  "response_time": "Response Time",
  "errors": "Errors",
  "wait_time": "Wait Time",
  "db_time": "DB Time",
  "email_time": "Email Time",
  "async_time": "Async Time",
  "compute_time": "Compute Time",
  "http_time": "HTTP Time"
};

strings.dashboard.errors = {
  "count": "Error Count",
  "last_seen": "Last Seen"
};

strings.dashboard.liveQueries = {
  "polled_doc_count": "Fetched Doc. Count",
  "changed_doc_count": "Changed Doc. Count",
  "inserted_doc_count": "Inserted Doc. Count",
  "updated_doc_count": "Updated Doc. Count",
  "deleted_doc_count": "Deleted Doc. Count"
};

strings.settings = {
  "application_settings": "Application Settings",
  "app_info": "App Info",
  "app_name": "App Name",
  "update_btn_text": "Update",
  "appid_and_app_secret": "App Id and Secret",
  "via_code": "Via Code",
  "via_meteor_settings": "Via Meteor Settings",
  "via_environmental_variables": "Via Environmental Variables",
  "regenerate_btn_text": "Regenerate",
  "confirm_btn_text": "Confirm",
  "cancel_btn_text": "Cancel",
  "delete_the_app": "Delete The App",
  "delete_btn_text": "Delete",
  "pricing": "Pricing"
};

strings.alerts = {
  "application_alerts": "Alerts"
};

strings.emails = {
  "reset_password_subject": "Reset your Kadira passsword"
};

strings.profiler = {
  "profiler_denied_msg": "Update your plan to profile the <a href=\"{$1}\">CPU remotely</a>",
  "profiler_delete_denied_msg": "You are not authorized to delete this profile",
  "not_authorized": "You are not authorized to view this CPU profile"
};

strings.ranges = {
  "range_1hour": "Range: 1 Hour",
  "range_3hour": "Range: 3 Hours",
  "range_8hour": "Range: 8 Hours",
  "range_24hour": "Range: 24 Hours",
  "range_3day": "Range: 3 Days",
  "range_1week": "Range: Week",
  "range_30day": "Range: 30 Days"
};

i18n.map("en", strings);
