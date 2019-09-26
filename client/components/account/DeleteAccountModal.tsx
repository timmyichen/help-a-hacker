import * as React from 'react';
import ModalWrapper from 'client/components/ModalWrapper';
import fetch from 'isomorphic-fetch';
import { Modal, Button } from 'react-bootstrap';

interface Props {
  isShowing: boolean;
  hideModal(): void;
}

function DeleteAccountModal({ isShowing, hideModal }: Props) {
  const [loading, setLoading] = React.useState(false);

  const onDeleteAccount = async () => {
    setLoading(true);

    try {
      await fetch('/api/delete_account', {
        method: 'POST',
      });
    } catch (e) {
      setLoading(false);
      throw e; //TODO messaging
    }

    setLoading(false);

    window.location.href = '/';
  };

  const onHide = () => {
    if (loading) {
      return;
    }

    hideModal();
  };

  return (
    <ModalWrapper isShowing={isShowing} onHide={onHide}>
      <Modal.Header>Delete Account</Modal.Header>
      <Modal.Body>
        You sure you want to do this? No take backsies.
        <br />
        <br />
        Also, your account will automatically be deleted a week after your event
        ends.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={hideModal}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDeleteAccount}>
          Delete
        </Button>
      </Modal.Footer>
    </ModalWrapper>
  );
}

export default DeleteAccountModal;
