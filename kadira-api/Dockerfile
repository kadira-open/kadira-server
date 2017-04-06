FROM alpine:3.2

RUN \
 apk upgrade --update && \
 apk add --no-cache ca-certificates python g++ make nodejs

WORKDIR /app

ADD ./package.json /app/
RUN npm install
ADD . /app

ENV PORT 80
ENV MONGO_APP_URL mongodb://dbserver/apm
ENV MONGO_SHARD_URL_one mongodb://dbserver/apm
ENV MAIL_URL smtp://user:pass@smtp.mailgun.org:587
ENV AUTH_SECRET secret
ENV JWT_SECRET secret
ENV JWT_LIFETIME 1d

CMD [ "npm", "run", "start" ]
