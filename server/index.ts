import 'module-alias/register';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import nextjs from './lib/next';
import PagesRouter from './routers/pages';
import auth from 'server/routers/auth';
import initDB from './lib/db';

const MongoStore = require('connect-mongo')(session);
dotenv.config();

const app: express.Application = express();

if (!process.env.SESSION_SECRET) {
  throw new Error('expected session secret');
}

nextjs.nextApp.prepare().then(async () => {
  const db = await initDB();
  console.log('connected to DB');

  app.locals.db = db;

  const port = process.env.PORT || 8000;

  app.use(
    morgan(':method :url :status', {
      skip: (req: express.Request) => req.url.startsWith('/_next/'),
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      store: new MongoStore({ mongooseConnection: db.connection }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static('public'));
  app.use(
    (
      err: Error,
      _: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (err) {
        return res.redirect('/');
      }

      next();
    },
  );

  app.use(auth());
  app.use(PagesRouter);

  app.get('*', (req, res) => {
    nextjs.handle(req, res);
  });

  app.listen(port, () => {
    console.log(`\n\nstarted on port ${port}\n\n`); // tslint:disable-line no-console
  });
});
