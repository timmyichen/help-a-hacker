import * as express from 'express';
import * as asyncRouter from 'express-router-async';
import nextjs from 'server/lib/next';
import { requiresAnon } from 'server/middleware/auth';

const router = asyncRouter();

router.get('/', requiresAnon, (req: express.Request, res: express.Response) => {
  nextjs.render(req, res, '/');
});

router.get(
  '/join',
  requiresAnon,
  (req: express.Request, res: express.Response) => {
    nextjs.render(req, res, '/join');
  },
);

router.get(
  '/login',
  requiresAnon,
  (req: express.Request, res: express.Response) => {
    nextjs.render(req, res, '/login');
  },
);

export default router;
