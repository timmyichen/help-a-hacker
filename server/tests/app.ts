import 'module-alias/register';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as getPort from 'get-port';
import * as request from 'supertest';
import initDB from 'server/lib/db';
import checkCollectionExistence from 'server/lib/checkCollectionExistence';
import { responseErrorHandler } from 'express-response-errors/lib/middleware';
import { Server } from 'http';
import { IUser } from 'server/models/types';

dotenv.config();

if (!process.env.MONGO_URI_TEST) {
  throw new Error('expected MONGO_URI_TEST');
}

class App {
  server: express.Application;
  authedUser: IUser | null;
  _server: Server;
  testedRouter: express.Router;

  request: request.SuperTest<request.Test>;

  constructor() {
    const app: express.Application = express();
    this.server = app;
  }

  setRouter(router: express.Router) {
    this.testedRouter = router;
  }

  async initialize() {
    try {
      const db = await initDB(process.env.MONGO_URI_TEST);
      await checkCollectionExistence();
      this.server.locals.db = db;
    } catch (e) {
      throw e;
    }

    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));

    this.server.use((req, _, next) => {
      if (this.authedUser) {
        req.user = this.authedUser;
        req.logout = this.logout;
      }

      next();
    });

    if (this.testedRouter) {
      this.server.use(this.testedRouter);
    }
    this.server.use(responseErrorHandler);

    const server = this.server.listen(
      await getPort({ port: getPort.makeRange(9000, 10000) }),
    );

    this._server = server;
    this.request = request(this.server);
  }

  async destroy() {
    this._server.close();
    await this.server.locals.db.connection.close();
  }

  login(user: IUser) {
    this.authedUser = user;
  }

  logout() {
    this.authedUser = null;
  }
}

export default App;
