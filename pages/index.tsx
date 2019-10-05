import * as React from 'react';
import Link from 'next/link';
import { Button } from 'react-bootstrap';

export default () => {
  return (
    <div className="landing-page">
      <div className="section hero">
        <h1>Help a Hacker</h1>
        <h2>Facilitate mentorship during Hackathons</h2>
        <Link href="/join">
          <a>
            <Button size="lg" variant="primary">
              Try it out
            </Button>
          </a>
        </Link>
      </div>
      <div className="section features">
        <div className="text">
          <h3>How it works:</h3>
          <ul>
            <li>
              <span className="em">Create an event</span> for your
              hackathon/event/classroom.
            </li>
            <li>
              Mentors and attendees{' '}
              <span className="em">join with unique invite codes</span>.
            </li>
            <li>
              <span className="em">Attendees</span> create requests for help.
            </li>
            <li>
              <span className="em">Mentors</span> get a feed of who needs help
              and can claim/resolve them.
            </li>
          </ul>
        </div>
        <div className="image">
          <img src="/img/students-working.jpg" />
          <div className="img-attribution">
            Photo by{' '}
            <a href="https://unsplash.com/@priscilladupreez" target="_blank">
              Priscilla Du Preez
            </a>{' '}
            on Unsplash
          </div>
        </div>
      </div>
      <div className="section privacy">
        <div className="image">
          <img src="/img/lock.jpg" />
          <div className="img-attribution">
            Photo by{' '}
            <a href="https://unsplash.com/@jsalvino" target="_blank">
              John Salvino
            </a>{' '}
            on Unsplash
          </div>
        </div>
        <div className="text">
          <h3>Be confident that you are in control of your data.</h3>
          <p>
            Your privacy is our priority, and your data is yours. Events are
            automatically deleted a week after the end of an event, and user
            accounts are automatically deleted when they don't belong to an
            event. Events and users can be deleted at any time.
          </p>
        </div>
      </div>
      <div className="section open-source">
        <p>
          Fancy a bit of TypeScript, React, Node, and MongoDB? This web app is
          open-source on{' '}
          <a href="https://github.com/timmyichen/help-a-hacker" target="_blank">
            GitHub
          </a>{' '}
          and is always accepting contributions!
        </p>
      </div>
      <style jsx>{`
        .landing-page > .section {
          min-height: 700px;
          padding: 0 5%;
        }
        .hero {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background-image: linear-gradient(#d6f6dd, #b0cab5);
          color: #4e5a51;
        }
        .hero h1 {
          font-size: 60px;
        }
        .hero h2 {
          margin-top: 10px;
          font-size: 24px;
        }
        .hero :global(button) {
          margin-top: 20px;
        }
        .features {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background-image: linear-gradient(#b0cab5, #758779);
        }
        .text {
          max-width: 40%;
          font-size: 20px;
          color: #3b443d;
        }
        .features h3 {
          font-size: 36px;
        }
        .features li {
          margin-top: 10px;
        }
        .features .em {
          font-weight: bold;
          color: #0e4d45;
        }
        .image img {
          max-width: 400px;
          border-radius: 100%;
        }
        .img-attribution {
          display: block;
          margin-top: 10px;
          text-align: center;
          font-size: 12px;
        }
        a {
          color: #0e4d45;
        }
        .privacy {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background-image: linear-gradient(#758779, #b0cab5);
        }
        .privacy h3 {
          font-size: 30px;
          margin-bottom: 20px;
        }
        .open-source {
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: linear-gradient(#b0cab5, #ccddcf);
        }
        .open-source p {
          max-width: 600px;
          font-size: 20px;
          text-align: center;
        }
        .open-source a {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};
