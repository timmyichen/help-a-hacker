import * as express from 'express';
import * as asyncRouter from 'express-router-async';
import nextjs from 'server/lib/next';

const router = asyncRouter();

router.get('/', (req: express.Request, res: express.Response) => {
  nextjs.render(req, res, '/');
});

router.get('/create', (req: express.Request, res: express.Response) => {
  nextjs.render(req, res, '/create');
});

router.get(
  '/create/complete',
  (req: express.Request, res: express.Response) => {
    nextjs.render(req, res, '/created', req.query);
  },
);

export default router;
