# Kadira UI

This is the main UI of kadira.

This app connects to multiple databases. They are:

* App MongoDB (MONGO_URL) - Which has the user/app info
* Data MongoDB Shard (MONGO_SHARD_URL_<shard-name>) - Accept any number of replica sets as the shard

When creating an app, the app will choose a shard (with the smallest dbsize) and assign to the app.

It's safe to run multiple instance of this for horizontal scaling.

## Running

Add correct configurations to `../init-shell.sh`.
Configure `settings.json` as needed.

Then apply these commands:

```sh
. ../init-shell.sh
sh run.sh
```
