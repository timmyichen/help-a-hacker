import * as React from 'react';
import fetch from 'isomorphic-fetch';

export default ({ children }: { children: React.ReactNode }) => {
  const logout = async () => {
    await fetch('/logout', {
      method: 'POST',
    });

    window.location.href = '/';
  };

  return <div onClick={logout}>{children}</div>;
};
