import * as React from 'react';

const email = 'timmy.i.chen.pub@gmail.com';

export default () => {
  return (
    <div className="about-page">
      <p>
        Hello, my name is Tim. I made this thing. If you have questions,
        comments, or concerns, you can reach me at{' '}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <p>
        This is a simple tool for people to set up events (like Hackathons)
        where one group (attendees) get assistance from another group (mentors).
        Events have an expiration time and all accounts/data associated with the
        event are deleted afterwards.
      </p>
      <p>
        The MVP of this thing was made over a two days so things might break. If
        they do, please let me know at the email above.
      </p>
      <p>
        The code is open-source and you're welcome to make improvements via pull
        requests. Github link is here:{' '}
        <a href="https://github.com/timmyichen/help-a-hacker" target="_blank">
          timmyichen/help-a-hacker
        </a>
        . It's written in TypeScript, React, Redux, Next.js, and Bootstrap on
        the client, and TypeScript, Node, Express, and MongoDB on the server.
      </p>
      <style jsx>{`
        .about-page {
          max-width: 400px;
          margin: 0 auto;
          padding-top: 50px;
        }
      `}</style>
    </div>
  );
};
