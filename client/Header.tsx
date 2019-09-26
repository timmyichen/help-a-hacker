import * as React from 'react';
import classnames from 'classnames';
import Link from 'next/link';
import { withRouter, WithRouterProps } from 'next/router';

const anonRoutes = {
  left: [{ href: '/', label: 'Home' }],
  right: [
    { href: '/login', label: 'Log in' },
    { href: '/join', label: 'Join' },
  ],
};

const authedRoutes = {
  left: [{ href: '/event', label: 'Event' }],
  right: [
    { href: '/account', label: 'Account' },
    { href: '/logout', label: 'Log out' },
  ],
};

function Header(props: WithRouterProps) {
  const currentPage = props.router ? props.router.pathname : '';

  const routes = anonRoutes;

  return (
    <div className="header">
      <div className="route-group">
        {routes.left.map(route => (
          <Route
            key={`route-${route.href}`}
            route={route}
            isActive={currentPage === route.href}
          />
        ))}
      </div>
      <div className="route-group">
        {routes.right.map(route => (
          <Route
            key={`route-${route.href}`}
            route={route}
            isActive={currentPage === route.href}
          />
        ))}
      </div>

      <style jsx>{`
        .header {
          display: flex;
          height: 40px;
          border-bottom: 1px solid #ccc;
          justify-content: space-between;
        }
        .route-group {
          display: flex;
        }
        .header :global(.route) {
          height: 100%;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          color: black;
          cursor: pointer;
          text-decoration: none;
        }
        .header :global(.route:hover) {
          background: #ccc;
        }
        .header :global(.route.active) {
        }
      `}</style>
    </div>
  );
}

const Route = ({
  route,
  isActive,
}: {
  route: { href: string; label: string };
  isActive: boolean;
}) => (
  <Link href={route.href} key={`header-route-${route.label}`}>
    <a className={classnames('route', { active: isActive })}>{route.label}</a>
  </Link>
);

export default withRouter(Header);
