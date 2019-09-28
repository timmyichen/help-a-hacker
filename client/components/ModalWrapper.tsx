import * as React from 'react';
import { Modal } from 'react-bootstrap';

interface Props {
  isShowing: boolean;
  children: React.ReactNode;
  onHide(): void;
}

export default ({ isShowing, onHide, children }: Props) => {
  if (!isShowing) {
    return null;
  }

  return (
    <Modal show={isShowing} onHide={onHide}>
      {children}
    </Modal>
  );
};
