import * as React from 'react';

const email = 'timmy.i.chen.pub@gmail.com';

export default () => (
  <h1>
    hey you hit an error thats a real shame can you let me know what happened at
    <a href={`mailto:${email}`}>{email}</a> thanks
    <style jsx>{`
      h1 {
        max-width: 600px;
      }
    `}</style>
  </h1>
);
