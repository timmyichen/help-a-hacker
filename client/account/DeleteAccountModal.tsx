import * as React from 'react';
import ModalWrapper from 'client/components/ModalWrapper';
import { Modal, Button, Alert } from 'react-bootstrap';
import { post } from 'client/lib/requests';

interface Props {
  isShowing: boolean;
  hideModal(): void;
}

function DeleteAccountModal({ isShowing, hideModal }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onDeleteAccount = async () => {
    setLoading(true);

    try {
      await post('/api/delete_account');
    } catch (e) {
      setLoading(false);
      setError(e.message);

      return;
    }

    setLoading(false);

    window.location.href = '/';
  };

  const onHide = () => {
    if (loading) {
      return;
      '';
    }

    hideModal();
  };

  return (
    <ModalWrapper isShowing={isShowing} onHide={onHide}>
      <Modal.Header>Delete Account</Modal.Header>
      <Modal.Body>
        <p>
          You sure you want to do this? No take backsies.
          <br />
          <br />
          Also, your account will automatically be deleted a week after your
          event ends.
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
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
