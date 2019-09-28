import * as React from 'react';
import { HelpRequest as HelpRequestType, Role } from 'client/types';
import HelpRequest from './HelpRequest';

interface Props {
  helpRequests: Array<HelpRequestType>;
  role: Role;
}

function HelpRequestList({ helpRequests, role }: Props) {
  return (
    <div className="help-requests-list">
      {helpRequests.map(req => (
        <HelpRequest
          key={`help-request-${req._id}`}
          helpRequest={req}
          role={role}
        />
      ))}
      <style jsx>{``}</style>
    </div>
  );
}

export default HelpRequestList;
