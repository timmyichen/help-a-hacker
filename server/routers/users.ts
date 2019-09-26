import * as express from 'express';
import * as asyncHandler from 'express-async-handler';
import { requiresAuth } from 'server/middleware/auth';
import { User } from 'server/models';
import { ReqWithUser } from './auth';

const router = express.Router();

router.post(
  '/api/delete_account',
  requiresAuth,
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    await User.findByIdAndDelete(req.user._id).exec();
    req.logout();

    res.json({ success: true });
  }),
);

export default router;
