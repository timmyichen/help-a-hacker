import * as React from 'react';
import { Event, InputEvent } from 'client/types';
import HelpRequestList from './HelpRequestList';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { get } from 'client/lib/requests';
import { setEvent } from 'client/actions/events';

interface Props {
  isOwner?: boolean;
  event: Event;
}

function MentorDashboard({ isOwner, event }: Props) {
  const location = [event.city, event.state].filter(s => !!s).join(', ');
  const [showAll, setShowAll] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();

  const onToggleShow = async (show: boolean) => {
    setLoading(true);

    const query = show ? '?showResolved=1' : '';

    const res = await get(`/api/events/${event._id}${query}`);
    if (!res.ok) {
      return;
    }

    const returnedEvent = await res.json();
    dispatch(setEvent(returnedEvent));
    setLoading(false);
  };

  const helpRequests = showAll
    ? event.helpRequests
    : event.helpRequests.filter(req => !req.resolved);

  return (
    <div className="mentor-dashboard">
      <div className="header">
        <h2>
          {event.name}
          {isOwner && <a className="text-primary">edit</a>}
        </h2>
        {location && <h3>{location}</h3>}
      </div>
      <div className="controls">
        <Form.Check
          disabled={loading}
          type="checkbox"
          checked={showAll}
          onChange={(e: InputEvent) => {
            setShowAll(e.currentTarget.checked);
            onToggleShow(e.currentTarget.checked);
          }}
        />
        <div
          className="label"
          onClick={() => {
            if (!loading) {
              const newValue = loading ? showAll : !showAll;
              setShowAll(newValue);
              onToggleShow(newValue);
            }
          }}
        >
          Show all (unresolved)
        </div>
      </div>
      <HelpRequestList helpRequests={helpRequests} role={event.role} />
      <style jsx>{`
        .mentor-dashboard {
          position: relative;
        }
        .header {
          text-align: center;
        }
        .header h2 {
          position: relative;
          display: inline-block;
        }
        .header h2 a {
          font-size: 14px;
          position: absolute;
          right: -40px;
          cursor: pointer;
        }
        .header h3 {
          font-size: 16px;
        }
        .controls {
          margin: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .controls .label {
          margin-left: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default MentorDashboard;
