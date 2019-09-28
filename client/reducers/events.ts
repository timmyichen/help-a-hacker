import { Event } from 'client/types';
import { EventsAction } from 'client/actions/events';

type State = Event | null;

export function events(state: State = null, action: EventsAction): State {
  switch (action.type) {
    case 'SET_EVENT':
      return action.event;
    case 'UPDATE_EVENT':
      return {
        ...(state as Event),
        ...action.fields,
      };
    case 'CREATE_HELP_REQUEST':
      if (!state) return null;

      return {
        ...state,
        helpRequests: [action.helpRequest, ...state.helpRequests],
      };
    case 'UPDATE_HELP_REQUEST': {
      if (!state) return null;

      let existingRequest = state.helpRequests.find(
        req => req._id === action.helpRequestId,
      );

      if (!existingRequest) return state;

      existingRequest = {
        ...existingRequest,
        ...action.fields,
      };

      return {
        ...state,
        helpRequests: [
          existingRequest,
          ...state.helpRequests.filter(req => req._id !== action.helpRequestId),
        ],
      };
    }
    case 'DELETE_HELP_REQUEST':
      if (!state) return null;

      return {
        ...state,
        helpRequests: state.helpRequests.filter(
          req => req._id !== action.helpRequestId,
        ),
      };
    case 'RESOLVE_HELP_REQUEST': {
      if (!state) return null;

      const existingRequest = state.helpRequests.find(
        req => req._id === action.helpRequestId,
      );

      if (!existingRequest) return state;

      existingRequest.resolved = true;

      return {
        ...state,
        helpRequests: [
          existingRequest,
          ...state.helpRequests.filter(req => req._id !== action.helpRequestId),
        ],
      };
    }
    case 'UNRESOLVE_HELP_REQUEST': {
      if (!state) return null;

      const existingRequest = state.helpRequests.find(
        req => req._id === action.helpRequestId,
      );

      if (!existingRequest) return state;

      existingRequest.resolved = false;

      return {
        ...state,
        helpRequests: [
          existingRequest,
          ...state.helpRequests.filter(req => req._id !== action.helpRequestId),
        ],
      };
    }
    case 'REFRESH_HELP_REQUESTS':
      if (!state) return null;

      return {
        ...state,
        helpRequests: action.helpRequests,
      };
  }

  return state;
}
