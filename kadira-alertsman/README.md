## Kadira Alertsman

This is the alerting system at Kadira. This connect to our app db to get data about alerts.
Then it'll use Kadira API to fetch metrics for apps.

It process them and fire alerts.

### Starting the App

```
npm i
npm run dev
```

### URL Shortening

We shorten the url of Kadira UI app's location. We do it using "Google URL Shortener"
Expose `GOOGLE_DEV_KEY` with a which you can get from [here](https://developers.google.com/url-shortener/v1/getting_started#APIKey).
