# DB settings
export APP_MONGO_URL="mongodb://app:password@candidate.53.mongolayer.com:10478,candidate.54.mongolayer.com:10216/tkadira-app?replicaSet=set-56175e62147ca745d8000761"
export APP_MONGO_OPLOG_URL="mongodb://oplog:password@candidate.53.mongolayer.com:10478,candidate.54.mongolayer.com:10216/local?authSource=tkadira-app&replicaSet=set-56175e62147ca745d8000761"
export DATA_MONGO_URL="mongodb://app:password@candidate.53.mongolayer.com:10478,candidate.54.mongolayer.com:10216/tkadira-data?replicaSet=set-56175e62147ca745d8000761"
export MAIL_URL="smtp://postmaster%40kadira.io:9jx4fqhdfbg5@smtp.mailgun.org:587"

# Engine settings
export ENGINE_PORT=11011

# UI settings
export UI_PORT=4000
export UI_URL="http://localhost:$UI_PORT"

# Monitoring Setup

export LIBRATO_EMAIL
export LIBRATO_TOKEN