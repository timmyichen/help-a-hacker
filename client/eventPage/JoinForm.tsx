import * as React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Role, InputEvent, Event } from 'client/types';
import { get } from 'client/lib/requests';
import JoinEventModal from './JoinEventModal';

export default () => {
  const [role, setRole] = React.useState<Role | ''>('');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [event, setEvent] = React.useState<Event>('');
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [error, setError] = React.useState('');

  const capitalizedRole = role.slice(0, 1).toUpperCase() + role.slice(1);

  const toggleRole = () => {
    if (role === 'attendee') {
      setRole('mentor');
    } else if (role === 'mentor') {
      setRole('attendee');
    }
    setCode('');
  };

  const findEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let foundEvent;

    try {
      const res = await get(`/api/events/find?code=${code}&role=${role}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message);
      }

      foundEvent = body;
    } catch (e) {
      setLoading(false);
      setError(e.message);

      return;
    }

    setLoading(false);
    setEvent(foundEvent);
    setShowEventModal(true);
  };

  return (
    <div className="join-form">
      {showEventModal && (
        <JoinEventModal
          isShowing={showEventModal}
          hideModal={() => setShowEventModal(false)}
          event={event}
          role={role}
        />
      )}
      {role ? (
        <Form>
          <Form.Group>
            <Form.Label>
              Enter the {capitalizedRole} Code for your Event
            </Form.Label>
            <Form.Control
              value={code}
              required
              type="text"
              placeholder={`Enter ${capitalizedRole} Code`}
              onChange={(e: InputEvent) => {
                setError('');
                setCode(e.currentTarget.value);
              }}
            />
            <a onClick={toggleRole} className="text-primary">
              Just kidding, I'm actually{' '}
              {role === 'mentor' ? 'an attendee' : 'a mentor'}.
            </a>
          </Form.Group>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            onClick={findEvent}
          >
            Find Event
          </Button>
          {error && <Alert variant="danger">{error}</Alert>}
        </Form>
      ) : (
        <div className="role-selector">
          <h1>I am...</h1>
          <div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setRole('mentor')}
            >
              A Mentor
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setRole('attendee')}
            >
              An Attendee
            </Button>
          </div>
        </div>
      )}
      <style jsx>{`
        .join-form :global(form) {
          max-width: 400px;
          margin: 0 auto;
        }
        .role-selector {
          text-align: center;
          max-width: 400px;
          margin: 30px auto;
        }
        .role-selector > div {
          margin-top: 50px;
          display: flex;
          justify-content: space-around;
        }
        a {
          cursor: pointer;
          display: inline-block;
          margin-top: 20px;
          font-size: 14px;
        }
        a:hover {
          text-decoration: underline;
        }
        .join-form :global(.alert-danger) {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};
