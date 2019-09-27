import * as express from 'express';

export const requiresAuth = ({ error }: { error?: boolean } = {}) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!req.user) {
    if (error) {
      return res.status(401).send({ message: 'Unauthorized, please log in' });
    }

    return res.redirect('/login');
  }

  next();
};

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
