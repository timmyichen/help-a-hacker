import * as React from 'react';
import Link from 'next/link';

export default () => {
  return (
    <div className="landing-page">
      <p>
        Hey, and welcome to Help-A-Hacker. Navigate pages above or visit the
        <Link href="/about">
          <a>About Page</a>
        </Link>{' '}
        to learn some more.
      </p>
      <style jsx>{`
        .landing-page {
          max-width: 600px;
        }
      `}</style>
    </div>
  );
};
