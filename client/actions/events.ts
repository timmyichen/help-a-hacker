import { Event, HelpRequest } from 'client/types';

interface ISetEvent {
  type: 'SET_EVENT';
  event: Event | null;
}

interface IUpdateEvent {
  type: 'UPDATE_EVENT';
  fields: Partial<Event>;
}

interface IRefreshHelpRequests {
  type: 'REFRESH_HELP_REQUESTS';
  helpRequests: Array<HelpRequest>;
}

interface ICreateHelpRequest {
  type: 'CREATE_HELP_REQUEST';
  helpRequest: HelpRequest;
}

interface IDeleteHelpRequest {
  type: 'DELETE_HELP_REQUEST';
  helpRequestId: string;
}

interface IResolveHelpRequest {
  type: 'RESOLVE_HELP_REQUEST';
  helpRequestId: string;
}

interface IUnresolveHelpRequest {
  type: 'UNRESOLVE_HELP_REQUEST';
  helpRequestId: string;
}

interface IUpdateHelpRequest {
  type: 'UPDATE_HELP_REQUEST';
  helpRequestId: string;
  fields: Partial<HelpRequest>;
}

export type EventsAction =
  | ISetEvent
  | IUpdateEvent
  | IRefreshHelpRequests
  | ICreateHelpRequest
  | IDeleteHelpRequest
  | IResolveHelpRequest
  | IUnresolveHelpRequest
  | IUpdateHelpRequest;

export function setEvent(event: Event | null): ISetEvent {
  return {
    type: 'SET_EVENT',
    event,
  };
}

export function updateEvent(fields: Partial<Event>): IUpdateEvent {
  return {
    type: 'UPDATE_EVENT',
    fields,
  };
}

export function refreshHelpRequests(
  helpRequests: Array<HelpRequest>,
): IRefreshHelpRequests {
  return {
    type: 'REFRESH_HELP_REQUESTS',
    helpRequests,
  };
}

export function createHelpRequest(
  helpRequest: HelpRequest,
): ICreateHelpRequest {
  return {
    type: 'CREATE_HELP_REQUEST',
    helpRequest,
  };
}

export function deleteHelpRequest(helpRequestId: string): IDeleteHelpRequest {
  return {
    type: 'DELETE_HELP_REQUEST',
    helpRequestId,
  };
}

export function resolveHelpRequest(helpRequestId: string): IResolveHelpRequest {
  return {
    type: 'RESOLVE_HELP_REQUEST',
    helpRequestId,
  };
}

export function unresolveHelpRequest(
  helpRequestId: string,
): IUnresolveHelpRequest {
  return {
    type: 'UNRESOLVE_HELP_REQUEST',
    helpRequestId,
  };
}

export function updateHelpRequest(
  helpRequestId: string,
  fields: Partial<HelpRequest>,
): IUpdateHelpRequest {
  return {
    type: 'UPDATE_HELP_REQUEST',
    helpRequestId,
    fields,
  };
}
