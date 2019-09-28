import * as React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { InputEvent, Event } from 'client/types';
import { post } from 'client/lib/requests';
import { useDispatch } from 'react-redux';
import { setEvent, updateEvent } from 'client/actions/events';
import { useRouter } from 'next/router';

const defaultErrors = {
  name: '',
  endDate: '',
  general: '',
};

const convertDate = (date: string) => {
  const parts = date.split(':');
  parts.pop();
  return parts.join(':');
};

interface Props {
  event?: Event;
  onComplete?: () => void;
}

export default ({ event, onComplete }: Props) => {
  const [name, setName] = React.useState(event ? event.name : '');
  const [city, setCity] = React.useState(event ? event.city : '');
  const [state, setState] = React.useState(event ? event.state : '');
  const [endDate, setEndDate] = React.useState(
    event ? convertDate(event.endsAt) : '',
  );
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

    let newEvent;

    const endpoint = event ? 'update' : 'create';

    try {
      const res = await post(`/api/events/${endpoint}`, {
        eventId: event ? event._id : undefined,
        name,
        city,
        state,
        endDate,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message);
      }

      newEvent = json;
    } catch (e) {
      setLoading(false);
      return setErrors({
        ...errors,
        general: e.message,
      });
    }

    if (event) {
      const date = new Date(endDate);
      const endsAt = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      ).toISOString();

      dispatch(
        updateEvent({
          name,
          city,
          state,
          endsAt,
        }),
      );
    } else {
      dispatch(setEvent(newEvent));
    }

    setLoading(false);
    if (router.pathname !== '/event' && !onComplete) {
      router.push('/event');
    } else if (onComplete) {
      onComplete();
    }
  };

  const onDelete = async () => {
    if (!confirm('Are you sure?') || !event) {
      return;
    }

    setLoading(true);

    try {
      const res = await post(`/api/events/delete`, {
        eventId: event._id,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message);
      }
    } catch (e) {
      setLoading(false);
      return setErrors({
        ...errors,
        general: e.message,
      });
    }

    setLoading(false);
    dispatch(setEvent(null));
  };

  const clearErrors = (keys: Array<keyof typeof defaultErrors>) => {
    const updatedErrors = { ...errors };
    keys.forEach(key => (updatedErrors[key] = ''));
    setErrors(updatedErrors);
  };

  return (
    <div className="event-editor-form">
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
        <div className="controls">
          {event ? (
            <Button
              disabled={loading}
              onClick={(e: React.FormEvent) => {
                e.preventDefault();
                onDelete();
              }}
              variant="danger"
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <Button
            disabled={loading}
            onClick={(e: React.FormEvent) => {
              e.preventDefault();
              onCreate();
            }}
            variant="primary"
          >
            {event ? 'Save' : 'Create'}
          </Button>
        </div>
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}
      </Form>
      <style jsx>{`
        .event-editor-form {
          max-width: 400px;
          margin: 50px auto;
        }
        .event-editor-form :global(.alert-danger) {
          margin-top: 10px;
        }
        .controls {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};
