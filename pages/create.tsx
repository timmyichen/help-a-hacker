import * as React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { InputEvent } from 'client/types';
import { post } from 'client/lib/requests';
import { useDispatch } from 'react-redux';
import { setEvent } from 'client/actions/events';
import { useRouter } from 'next/router';

const defaultErrors = {
  name: '',
  endDate: '',
  general: '',
};

export default () => {
  const [name, setName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState(defaultErrors);
  const dispatch = useDispatch();
  const router = useRouter();

  const onCreate = async () => {
    clearErrors(['name', 'endDate', 'general']);
    if (!name || !name.trim().length) {
      return setErrors({
        ...errors,
        name: 'Name must not be empty',
      });
    }

    if (!endDate) {
      return setErrors({
        ...errors,
        endDate: 'You must provide an end date',
      });
    }

    setLoading(true);

    let event;

    try {
      const res = await post('/api/events/create', {
        name,
        city,
        state,
        endDate,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message);
      }

      event = json;
    } catch (e) {
      setLoading(false);
      return setErrors({
        ...errors,
        general: e.message,
      });
    }

    dispatch(setEvent(event));

    setLoading(false);
    router.push('/event');
  };

  const clearErrors = (keys: Array<keyof typeof defaultErrors>) => {
    const updatedErrors = { ...errors };
    keys.forEach(key => (updatedErrors[key] = ''));
    setErrors(updatedErrors);
  };

  return (
    <div className="create-event-page">
      <Form>
        <Form.Group>
          <Form.Label>Event Name</Form.Label>
          <Form.Control
            value={name}
            type="text"
            placeholder={`Name of the event`}
            onChange={(e: InputEvent) => {
              clearErrors(['name']);
              setName(e.currentTarget.value);
            }}
          />
          {errors.name && <Alert variant="danger">{errors.name}</Alert>}
        </Form.Group>
        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control
            value={city}
            type="text"
            placeholder={`City where the event is being held`}
            onChange={(e: InputEvent) => setCity(e.currentTarget.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>State</Form.Label>
          <Form.Control
            value={state}
            type="text"
            placeholder={`State/Province where the event is being held`}
            onChange={(e: InputEvent) => setState(e.currentTarget.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>When does this event end?</Form.Label>
          <Form.Control
            value={endDate}
            type="datetime-local"
            onChange={(e: InputEvent) => {
              clearErrors(['endDate']);
              setEndDate(e.currentTarget.value);
            }}
          />
          {errors.endDate && <Alert variant="danger">{errors.endDate}</Alert>}
        </Form.Group>
        <Button
          type="submit"
          disabled={loading}
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            onCreate();
          }}
          variant="primary"
        >
          Create
        </Button>
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}
      </Form>
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
