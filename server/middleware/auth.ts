import * as express from 'express';

export function requiresAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!req.user) {
    return res.redirect('/login');
  }

  next();
}

export function requiresAnon(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (req.user) {
    return res.redirect('/account');
  }

  next();
}
