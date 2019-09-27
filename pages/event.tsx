import * as React from 'react';
import JoinForm from 'client/eventPage/JoinForm';

export default () => {
  return (
    <div className="event-page">
      <JoinForm />
      <style jsx>{`
        .event-page {
          margin: 50px auto;
        }
      `}</style>
    </div>
  );
};
