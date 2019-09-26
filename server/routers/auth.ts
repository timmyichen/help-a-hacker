import * as express from 'express';
import * as bluebird from 'bluebird';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import { User } from 'server/models';
import { IUser, OId } from 'server/models/types';

export interface ReqWithUser extends express.Request {
  user: IUser;
}

const bcrypt = bluebird.promisifyAll(require('bcrypt-nodejs'));

function init() {
  const LocalStrategy = passportLocal.Strategy;

  passport.use(
    'local-login',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({
        email: email.toLowerCase(),
      })
        .exec()
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'Login failed' });
          }

          bcrypt
            .compareAsync(password, user.password)
            .then((isValid: boolean) => {
              if (!isValid) {
                return done(null, false, { message: 'Login failed' });
              }

              return done(null, user);
            })
            .catch((e: any) => {
              done(e);
            });
        })
        .catch((e: any) => {
          done(e);
        });
    }),
  );

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passReqToCallback: true,
      },
      async (
        req: express.Request,
        email: string,
        password: string,
        done: any,
      ) => {
        const { name } = req.body;

        if (!email) {
          return done(null, false, { message: 'missing required field' });
        }

        const salt = await bcrypt.genSaltAsync(10);
        const hash = await bcrypt.hashAsync(password, salt, null);

        let user: IUser;
        try {
          user = await User.create({
            email: email.toLowerCase(),
            name,
            password: hash,
          });
        } catch (e) {
          if (e.name === 'SequelizeUniqueConstraintError') {
            return done(null, false, {
              message: 'A user with that email or username exists.',
            });
          } else if (e.name === 'SequelizeValidationError') {
            return done(null, false, {
              message: 'Validation failed',
            });
          }

          return done(null, false, { message: 'Something went wrong' });
        }

        return done(null, user);
      },
    ),
  );

  passport.serializeUser<IUser, any>((user, cb) => {
    cb(undefined, user._id);
  });

  passport.deserializeUser((id: OId, done) => {
    User.findById(id)
      .exec()
      .then(user => {
        if (!user) {
          return done(new Error('User not found'));
        }

        const withoutPw = { ...user.toObject() };
        if (withoutPw.password) {
          delete withoutPw.password;
        }
        done(null, withoutPw);
      })
      .catch((err: Error) => {
        return done(err);
      });
  });

  const router = express.Router();

  router.post(
    '/login',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      passport.authenticate(
        'local-login',
        {
          session: true,
          failWithError: true,
        },
        (err, user, info) => {
          if (err) {
            // this should never happen
            throw new Error(err.message);
          }

          if (!user) {
            return res.status(400).json({ success: false, ...info });
          }

          req.login(user, err => {
            if (err) {
              return res.status(500).send('Unknown error in auth');
            }

            return res.json({ success: true });
          });
        },
      )(req, res, next);
    },
  );

  router.post(
    '/signup',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      passport.authenticate(
        'local-signup',
        {
          session: true,
          failWithError: true,
        },
        (err, user, info) => {
          if (err) {
            // this should never happen
            throw new Error(err.message);
          }

          if (!user) {
            return res.status(400).json({ success: false, ...info });
          }

          req.login(user, err => {
            if (err) {
              return res.status(500).send('Unknown error in auth');
            }

            return res.json({ success: true });
          });
        },
      )(req, res, next);
    },
  );

  router.post('/logout', (req: express.Request, res: express.Response) => {
    req.logout();
    res.json({ success: true });
  });

  router.get(
    '/api/user_info',
    (req: express.Request, res: express.Response) => {
      if (!req.user) {
        return res.json({ error: 'not logged in' });
      }

      res.json(req.user);
    },
  );

  return router;
}

export default init;
