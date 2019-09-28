import * as React from 'react';
import JoinForm from 'client/eventPage/JoinForm';
import nextCookie from 'next-cookies';
import { Event, AppStore } from 'client/types';
import { IUser } from 'server/models/types';
import MentorDashboard from 'client/eventPage/MentorDashboard';
import AttendeeDashboard from 'client/eventPage/AttendeeDashboard';
import { setEvent } from 'client/actions/events';
import { useSelector, useDispatch } from 'react-redux';

interface Props {
  event: Event | null;
}

function EventPage({ event: incomingEvent }: Props) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (incomingEvent) {
      dispatch(setEvent(incomingEvent));
    }
  }, []);

  const event = useSelector<AppStore, Event | null>(state => state.event);

  let content;

  if (!incomingEvent) {
    content = <JoinForm />;
  } else if (!event) {
    content = null;
  } else if (event.role === 'attendee') {
    content = <AttendeeDashboard event={event} />;
  } else if (event.role === 'mentor') {
    content = <MentorDashboard event={event} />;
  } else if (event.role === 'owner') {
    content = <MentorDashboard event={event} isOwner />;
  }

  return (
    <div className="event-page">
      {content}
      <style jsx>{`
        .event-page {
          margin: 50px auto;
        }
      `}</style>
    </div>
  );
}

EventPage.getInitialProps = async (ctx: any, user: IUser) => {
  let event;

  const cookies = nextCookie(ctx);

  const { req } = ctx;

  event = user.events[0];

  if (!event) {
    return { event: null };
  }

  const path = '/api/events/' + event.eventId;

  if (req && cookies['connect.sid']) {
    const baseUrl = `${req.protocol}://${req.get('Host')}`;
    const res = await fetch(baseUrl + path, {
      credentials: 'same-origin',
      headers: {
        cookie: `connect.sid=${cookies['connect.sid']}`,
      },
    });
    event = await res.json();
  } else {
    const res = await fetch(path);
    event = await res.json();
  }

  if (event) {
    ctx.reduxStore.dispatch(setEvent(event));
  }

  return { event };
};

export default EventPage;
