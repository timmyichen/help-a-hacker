import * as React from 'react';
import { Button } from 'react-bootstrap';
import DeleteAccountModal from 'client/account/DeleteAccountModal';

export default () => {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  return (
    <div className="account-page">
      <div className="delete-wrapper">
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete your account
        </Button>
      </div>
      {showDeleteModal && (
        <DeleteAccountModal
          isShowing
          hideModal={() => setShowDeleteModal(false)}
        />
      )}
      <style jsx>{`
        .account-page {
          max-width: 400px;
          margin: 50px auto;
        }
        .delete-wrapper {
          text-align: center;
        }
      `}</style>
    </div>
  );
};
