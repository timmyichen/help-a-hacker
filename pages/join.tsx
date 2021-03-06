import * as React from 'react';
import * as validator from 'validator';
import { Form, Button, Alert } from 'react-bootstrap';
import { InputEvent } from 'client/types';
import { post } from 'client/lib/requests';

const defaultErrors = {
  email: '',
  password: '',
  name: '',
  general: '',
};

export default () => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState(defaultErrors);

  const onSignup = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    clearErrors(['email', 'password', 'general']);
    const errObj = { ...errors };
    let hasErrored = false;
    if (!validator.isEmail(email)) {
      errObj.email = "Your email isn't an email";
      hasErrored = true;
    }

    if (password.length < 8) {
      errObj.password = 'Pls at least 8 chars there are no other requirements';
      hasErrored = true;
    }

    if (!name.trim().length || name.length < 2) {
      errObj.name = 'Your name probably has at least 2 letters in it';
      hasErrored = true;
    }

    if (hasErrored) {
      setErrors(errObj);

      return;
    }

    setLoading(true);

    try {
      const res = await post('/signup', { email, password, name });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message);
      }
    } catch (e) {
      errObj.general = 'Something went wrong: ' + e.message;
      setErrors(errObj);
      setLoading(false);

      return;
    }

    setLoading(false);

    window.location.href = '/event';
  };

  const clearErrors = (keys: Array<keyof typeof defaultErrors>) => {
    const errObj = { ...errors };
    keys.forEach(key => {
      errObj[key] = '';
    });
    setErrors(errObj);
  };

  return (
    <div className="join-page" onSubmit={onSignup}>
      <Form>
        <Form.Text>
          Accounts are temporary. They are deleted a week after the event ends.
        </Form.Text>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            required
            value={email}
            onChange={(e: InputEvent) => {
              clearErrors(['email']);
              setEmail(e.currentTarget.value);
            }}
          />
          {errors.email && <Alert variant="danger">{errors.email}</Alert>}
        </Form.Group>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="name"
            placeholder="Your public-facing name, or nickname"
            required
            value={name}
            onChange={(e: InputEvent) => {
              clearErrors(['name']);
              setName(e.currentTarget.value);
            }}
          />
          {errors.name && <Alert variant="danger">{errors.name}</Alert>}
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="At least 8 characters"
            required
            value={password}
            onChange={(e: InputEvent) => {
              clearErrors(['password']);
              setPassword(e.currentTarget.value);
            }}
          />
          {errors.password && <Alert variant="danger">{errors.password}</Alert>}
        </Form.Group>
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}
        <Button type="submit" variant="primary" disabled={loading}>
          Sign Up
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
