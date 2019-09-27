import * as React from 'react';
import { post } from 'client/lib/requests';

export default ({ children }: { children: React.ReactNode }) => {
  const logout = async () => {
    await post('/logout');

    window.location.href = '/';
  };

  return <div onClick={logout}>{children}</div>;
};
