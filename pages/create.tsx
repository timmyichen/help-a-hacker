import * as React from 'react';
import EventEditorForm from 'client/eventPage/EventEditorForm';

export default () => {
  return (
    <div className="create-event-page">
      <EventEditorForm />
      <style jsx>{`
        .create-event-page {
          max-width: 400px;
          margin: 50px auto;
        }
        .create-event-page :global(.alert-danger) {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};
