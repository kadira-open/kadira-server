/* eslint max-len:0 */

import http from 'http';
import express from 'express';
import MongoCluster from 'mongo-sharded-cluster';
import {MongoClient} from 'mongodb';
import Promise from 'bluebird';
import cors from 'cors';
import {loadSchemas} from './schemas';
import {configureAuth} from './authlayer';
import {loadExplorer, sendPong, handleAuth} from './transports/http';
const logger = console;

(async () => {
  try {
    const {
      PORT, AUTH_SECRET, MAIL_URL, JWT_SECRET, JWT_LIFETIME
    } = process.env;

    const appDb = await Promise.promisify(MongoClient.connect)(process.env.MONGO_APP_URL);
    const mongoCluster = await Promise.promisify(MongoCluster.initFromEnv)();

    const schemas = loadSchemas({
      appDb,
      mailUrl: MAIL_URL,
      mongoCluster
    });

    configureAuth({
      secret: JWT_SECRET,
      lifetime: JWT_LIFETIME,
    });

    const server = http.createServer();
    const app = express();

    // Configurations for CORS
    const corsOptions = { origin: true, credentials: true };
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    server.on('request', app);

    app.use('/auth', handleAuth(appDb));
    app.use('/ping', sendPong());
    app.use('/:schema?', loadExplorer(AUTH_SECRET, schemas));

    server.listen(PORT);
    logger.log(`Fetchman started on port: ${PORT}`);
  } catch (ex) {
    console.log('EEEEEE', ex)
    setTimeout(() => {throw ex;});
  }
})();
