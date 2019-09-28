import * as React from 'react';
import * as classnames from 'classnames';
import {
  HelpRequest as HelpRequestType,
  Role,
  AppStore,
  Event,
} from 'client/types';
import { Card, Button, Alert } from 'react-bootstrap';
import * as timeago from 'timeago.js';
import { post } from 'client/lib/requests';
import { useSelector, useDispatch } from 'react-redux';
import HelpRequestEditor from './HelpRequestEditor';
import {
  resolveHelpRequest,
  unresolveHelpRequest,
} from 'client/actions/events';

interface Props {
  helpRequest: HelpRequestType;
  role: Role;
}

function HelpRequest({ helpRequest, role }: Props) {
  const event = useSelector<AppStore, Event>(state => state.event as Event);
  const dispatch = useDispatch();

  const {
    description,
    title,
    creator,
    location,
    resolved,
    allowEmail,
  } = helpRequest;

  const createdAt = new Date(helpRequest.createdAt);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  let actions: Array<React.ReactNode> = [];

  const onResolve = async (newStatus: boolean) => {
    setLoading(true);

    try {
      const res = await post('/api/help-requests/set-resolved', {
        eventId: event._id,
        helpRequestId: helpRequest._id,
        newStatus,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message);
      }
    } catch (e) {
      setLoading(false);
      setError(e.message);
      return;
    }

    setLoading(false);
    if (newStatus === true) {
      dispatch(resolveHelpRequest(helpRequest._id));
    } else {
      dispatch(unresolveHelpRequest(helpRequest._id));
    }
  };

  switch (role) {
    case 'attendee':
      actions = [
        <Button
          key="edit-button"
          disabled={loading}
          onClick={() => setShowEditModal(true)}
          variant="secondary"
        >
          Edit
        </Button>,
        resolved ? (
          <Button
            key="unresolve-button"
            disabled={loading}
            onClick={() => onResolve(false)}
            variant="warning"
          >
            Unresolve
          </Button>
        ) : (
          <Button
            key="resolve-button"
            disabled={loading}
            onClick={() => onResolve(true)}
            variant="primary"
          >
            Resolve
          </Button>
        ),
      ];
      break;
    case 'mentor':
    case 'owner':
      actions = resolved
        ? [
            <div />,
            <Button
              key="unresolve-button"
              disabled={loading}
              onClick={() => onResolve(false)}
              variant="warning"
            >
              Unresolve
            </Button>,
          ]
        : [
            <div />,
            <Button
              key="resolve-button"
              disabled={loading}
              onClick={() => onResolve(true)}
              variant="primary"
            >
              Resolve
            </Button>,
          ];
  }

  return (
    <div className="help-request">
      {showEditModal && (
        <HelpRequestEditor
          helpRequest={helpRequest}
          onHide={() => setShowEditModal(false)}
        />
      )}
      <Card className="help-request-card">
        <Card.Header
          className={classnames('text-white', {
            'bg-primary': !resolved,
            'bg-success': resolved,
          })}
        >
          {title}
        </Card.Header>
        <Card.Text as="div">
          <div className="description">{description}</div>
          <div className="meta">
            <div>Location: {location}</div>
            <div className="secondary-meta">
              <div
                title={
                  createdAt.toLocaleDateString() +
                  ' ' +
                  createdAt.toLocaleTimeString()
                }
              >
                Created {timeago.format(createdAt)}
              </div>
              <div title={creator.email}>by {creator.name}</div>
            </div>
            {allowEmail && (
              <div className="email">
                They can also be contacted at{' '}
                <a href={`mailto:${creator.email}`}>{creator.email}</a>
              </div>
            )}
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
        </Card.Text>
        <Card.Footer className="footer">{actions}</Card.Footer>
      </Card>
      <style jsx>{`
        .help-request :global(.help-request-card) {
          max-width: 400px;
          margin: 25px auto;
        }
        .description {
          padding: 20px;
        }
        .meta {
          padding: 10px 20px;
          font-size: 12px;
        }
        .secondary-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .secondary-meta > div {
          max-width: 45%;
        }
        .email {
          margin-top: 10px;
        }
        .help-request :global(.footer) {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}

export default HelpRequest;
