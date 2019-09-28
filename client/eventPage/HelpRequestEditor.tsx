import * as React from 'react';
import { HelpRequest, InputEvent, Event, AppStore } from 'client/types';
import ModalWrapper from 'client/components/ModalWrapper';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { post } from 'client/lib/requests';
import { useDispatch, useSelector } from 'react-redux';
import { createHelpRequest, updateHelpRequest } from 'client/actions/events';

interface Props {
  helpRequest?: HelpRequest;
  onHide(): void;
}

function HelpRequestEditor({ helpRequest, onHide }: Props) {
  const event = useSelector<AppStore, Event>(state => state.event as Event);

  const [title, setTitle] = React.useState(
    helpRequest ? helpRequest.title : '',
  );
  const [description, setDescription] = React.useState(
    helpRequest ? helpRequest.description : '',
  );
  const [location, setLocation] = React.useState(
    helpRequest ? helpRequest.location : '',
  );
  const [allowEmail, setAllowEmail] = React.useState(
    helpRequest ? helpRequest.allowEmail : false,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const dispatch = useDispatch();

  const onSubmit = async () => {
    setError('');

    if (!title.trim() || !description.trim() || !location.trim()) {
      return setError('Title, description, and location are required');
    }

    setLoading(true);

    let createdHelpRequest: HelpRequest;

    const endpoint = helpRequest
      ? '/api/help-requests/update'
      : '/api/help-requests/create';

    try {
      const res = await post(endpoint, {
        helpRequestId: helpRequest ? helpRequest._id : undefined,
        title,
        description,
        location,
        allowEmail,
        eventId: event._id,
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message);
      }
      createdHelpRequest = body.helpRequest;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return;
    }

    if (helpRequest) {
      dispatch(updateHelpRequest(helpRequest._id, createdHelpRequest));
    } else {
      dispatch(createHelpRequest(createdHelpRequest));
    }
    setLoading(false);

    onHide();
  };

  return (
    <div className="help-request-editor">
      <ModalWrapper isShowing onHide={onHide}>
        <Modal.Header>New Help Request</Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Title of your question/issue"
                value={title}
                onChange={(e: InputEvent) => setTitle(e.currentTarget.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows="4"
                placeholder="Describe your question/issue in a bit more depth"
                value={description}
                onChange={(e: InputEvent) =>
                  setDescription(e.currentTarget.value)
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Where can the mentor find you?"
                value={location}
                onChange={(e: InputEvent) => setLocation(e.currentTarget.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Allow mentors to see my email"
                checked={allowEmail}
                onChange={(e: InputEvent) =>
                  setAllowEmail(e.currentTarget.checked)
                }
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
          </Form>
          <Modal.Footer>
            <Button variant="primary" disabled={loading} onClick={onSubmit}>
              {helpRequest ? 'Save' : 'Create'}
            </Button>
          </Modal.Footer>
        </Modal.Body>
        <style jsx>{`
          .help-request-editor :global(.alert-danger) {
            margin-top: 10px;
          }
        `}</style>
      </ModalWrapper>
    </div>
  );
}

export default HelpRequestEditor;
