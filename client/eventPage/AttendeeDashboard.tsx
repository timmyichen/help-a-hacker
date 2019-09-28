import * as React from 'react';
import { Event } from 'client/types';
import HelpRequestList from './HelpRequestList';
import { Button } from 'react-bootstrap';
import HelpRequestEditor from './HelpRequestEditor';

interface Props {
  event: Event;
}

function AttendeeDashboard({ event }: Props) {
  const [showCreationModal, setShowCreationModal] = React.useState(false);

  const location = [event.city, event.state].filter(s => !!s).join(', ');

  return (
    <div className="attendee-dashboard">
      {showCreationModal && (
        <HelpRequestEditor onHide={() => setShowCreationModal(false)} />
      )}
      <div className="header">
        <h2>{event.name}</h2>
        {location && <h3>{location}</h3>}
      </div>
      <div className="controls">
        <Button
          size="lg"
          onClick={() => setShowCreationModal(true)}
          variant="primary"
        >
          Ask for Help
        </Button>
      </div>
      <HelpRequestList helpRequests={event.helpRequests} role={event.role} />
      <style jsx>{`
        .attendee-dashboard {
          position: relative;
        }
        .header {
          text-align: center;
        }
        .header h2 {
          position: relative;
          display: inline-block;
        }
        .header h3 {
          font-size: 16px;
        }
        .controls {
          text-align: center;
          padding: 30px;
        }
      `}</style>
    </div>
  );
}

export default AttendeeDashboard;
