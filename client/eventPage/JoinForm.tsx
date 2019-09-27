import * as React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Role, InputEvent } from 'client/types';
import { get } from 'client/lib/requests';

export default () => {
  const [role, setRole] = React.useState<Role | ''>('');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const capitalizedRole = role.slice(0, 1).toUpperCase() + role.slice(1);

  const toggleRole = () => {
    if (role === 'attendee') {
      setRole('mentor');
    } else if (role === 'mentor') {
      setRole('attendee');
    }
  };

  const findEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await get(`/api/events/find?code=${code}`);
    console.log(res);
    setLoading(false);
  };

  return (
    <div className="join-form">
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
              onChange={(e: InputEvent) => setCode(e.currentTarget.value)}
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
      `}</style>
    </div>
  );
};
