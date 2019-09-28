import * as React from 'react';
import { Button } from 'react-bootstrap';
import DeleteAccountModal from 'client/account/DeleteAccountModal';
import { User, AppStore } from 'client/types';
import { useSelector } from 'react-redux';

export default () => {
  const user = useSelector<AppStore, User>(state => state.user as User);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const creationDate = new Date(user.createdAt);

  return (
    <div className="account-page">
      <p>
        You are logged in as <b>{user.name}</b> with an email of{' '}
        <b>{user.email}</b>
      </p>
      <p>
        Your account was created on{' '}
        {creationDate.toLocaleDateString() +
          ' at ' +
          creationDate.toLocaleTimeString()}
      </p>
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
