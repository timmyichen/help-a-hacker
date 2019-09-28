import * as React from 'react';
import ModalWrapper from 'client/components/ModalWrapper';
import { Modal } from 'react-bootstrap';
import EventEditorForm from './EventEditorForm';
import { Event } from 'client/types';

interface Props {
  event: Event;
  onHide(): void;
}

function EventEditorModal({ event, onHide }: Props) {
  return (
    <ModalWrapper isShowing onHide={onHide}>
      <Modal.Header>Edit Event</Modal.Header>
      <Modal.Body>
        <EventEditorForm event={event} onComplete={onHide} />
      </Modal.Body>
    </ModalWrapper>
  );
}

export default EventEditorModal;
