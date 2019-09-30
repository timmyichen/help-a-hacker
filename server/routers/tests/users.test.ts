import App from 'server/tests/app';
import usersRouter from 'server/routers/users';
import { createRandomUser } from 'server/tests/utils';
import { User } from 'server/models';
import { IUser } from 'server/models/types';

describe('users router', () => {
  const app = new App();

  beforeAll(async () => {
    app.setRouter(usersRouter);
    await app.initialize();
  });

  afterAll(async () => {
    await app.destroy();
  });

  describe('/api/delete_account', () => {
    let user: IUser;

    beforeAll(async () => {
      user = await createRandomUser();
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request.post('/api/delete_account').expect(401);
    });

    it('deletes the account', async () => {
      app.login(user);

      await app.request.post('/api/delete_account').expect(200);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeFalsy();
    });
  });
});
