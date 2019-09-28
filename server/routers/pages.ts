import * as express from 'express';
import nextjs from 'server/lib/next';
import { requiresAnon, requiresAuth } from 'server/middleware/auth';

const router = express.Router();

const anonRoutes = ['/join', '/login'];
const authedRoutes = ['/account', '/create', '/events', '/logout'];

router.get('/', requiresAnon, (req: express.Request, res: express.Response) => {
  nextjs.render(req, res, '/');
});

anonRoutes.forEach(route => {
  router.get(
    route,
    requiresAnon,
    (req: express.Request, res: express.Response) => {
      nextjs.render(req, res, route);
    },
  );
});

authedRoutes.forEach(route => {
  router.get(
    route,
    requiresAuth(),
    (req: express.Request, res: express.Response) => {
      nextjs.render(req, res, route);
    },
  );
});

export default router;
