import fetch from 'isomorphic-fetch';

export const get = fetch;

export const post = (uri: string, body?: Object) =>
  fetch(uri, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
