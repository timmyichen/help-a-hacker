import * as React from 'react';
import * as ReactDOM from 'react-dom';
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

  return ReactDOM.createPortal(
    <Modal show={isShowing} onHide={onHide}>
      {children}
    </Modal>,
    document.body,
  );
};
