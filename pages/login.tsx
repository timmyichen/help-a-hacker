import * as React from 'react';
import * as validator from 'validator';
import { Form, Button, Alert } from 'react-bootstrap';
import { InputEvent } from 'client/types';
import { post } from 'client/lib/requests';

export default () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onLogin = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!validator.isEmail(email)) {
      setError("Your email isn't an email");

      return;
    }

    setLoading(true);

    try {
      const res = await post('/login', { email, password });

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
    <div className="join-page" onSubmit={onLogin}>
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
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e: InputEvent) => {
              setError('');
              setPassword(e.currentTarget.value);
            }}
          />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit" variant="primary" disabled={loading}>
          Log in
        </Button>
      </Form>
      <style jsx>{`
        .join-page :global(form) {
          max-width: 400px;
          margin: 0 auto;
          padding-top: 50px;
        }
      `}</style>
    </div>
  );
};
