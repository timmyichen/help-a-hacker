import * as React from 'react';
import ModalWrapper from 'client/components/ModalWrapper';
import { Modal, Button, Alert } from 'react-bootstrap';
import { post } from 'client/lib/requests';
import { Event, Role } from 'client/types';

interface Props {
  isShowing: boolean;
  hideModal(): void;
  event: Event;
  role: Role;
}

function JoinEventModal({ isShowing, hideModal, event, role }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onRegister = async () => {
    setLoading(true);

    try {
      await post('/api/events/register', { eventId: event._id, role });
    } catch (e) {
      setLoading(false);
      setError(e.message);

      return;
    }

    setLoading(false);
  };

  const onHide = () => {
    if (loading) {
      return;
      '';
    }

    hideModal();
  };

  const location = [event.city, event.state].filter(s => !!s).join(', ');

  return (
    <ModalWrapper isShowing={isShowing} onHide={onHide}>
      <Modal.Header>Join Event: {event.name}</Modal.Header>
      <Modal.Body>
        Do you want to join the event <strong>{event.name}</strong>
        {location && (
          <span>
            located in <em>{location}</em>
          </span>
        )}{' '}
        as a(n) {role}?{error && <Alert variant="danger">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={hideModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onRegister}>
          Join
        </Button>
      </Modal.Footer>
    </ModalWrapper>
  );
}

export default JoinEventModal;
