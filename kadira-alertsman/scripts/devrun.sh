#/bin/bash

APP_DB_URL=mongodb://localhost/apm \
APP_DB_OPLOG_URL=mongodb://localhost/local \
KADIRA_API_URL=http://root:secret@localhost:7007/core \
MAIL_URL=smtp://postmaster%40arunoda.mailgun.org:71d5vp8eji62@smtp.mailgun.org:587 \
TICK_TRIGGER_INTERVAL=10000 \
MESSENGER_LOGGING_ONLY=1 \
LIBRATO_METRICS_PREFIX=alertsman. \
  ./node_modules/.bin/nodemon server.js
