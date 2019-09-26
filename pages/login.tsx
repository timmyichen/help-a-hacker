import * as React from 'react';
import * as validator from 'validator';
import fetch from 'isomorphic-fetch';
import { Form, Button, Alert } from 'react-bootstrap';

type InputEvent = React.KeyboardEvent<HTMLInputElement>;

export default () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onLogin = async () => {
    if (!validator.isEmail(email)) {
      setError("Your email isn't an email");

      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message);
      }
    } catch (e) {
      setError('Something went wrong: ' + e.message);
      setLoading(false);

      return;
    }

    setLoading(false);

    window.location.href = '/event';
  };

  return (
    <div className="join-page">
      <Form>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            required
            value={email}
            onChange={(e: InputEvent) => {
              setError('');
              setEmail(e.currentTarget.value);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Hope you remember it!"
            required
            value={password}
            onChange={(e: InputEvent) => {
              setError('');
              setPassword(e.currentTarget.value);
            }}
          />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button
          type="submit"
          variant="primary"
          onClick={onLogin}
          disabled={loading}
        >
          Sign Up
        </Button>
      </Form>
      <style jsx>{`
        .join-page :global(form) {
          max-width: 400px;
          margin: 50px auto;
        }
      `}</style>
    </div>
  );
};
