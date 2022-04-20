import React, { Suspense } from 'react';
import { lazy } from 'react';
import {
  Route as ReactDomRoute,
  RouteProps as ReactDOMRouteProps,
  Redirect,
} from 'react-router-dom';
import { useAuth } from '../contexts/auth';

import PrivateLayout from '../pages/_layouts/private';

interface IRouteProps extends ReactDOMRouteProps {
  isPrivate?: boolean;
  isPublicPrivate?: boolean;
  component?: any;
}

const LazyDefaultLayout = lazy(() => import('../pages/_layouts/default'));

const Route: React.FC<IRouteProps> = (
  { isPrivate = false, isPublicPrivate = false, component: Component },
  ...rest
) => {
  const { user } = useAuth();

  if (!user && isPrivate) {
    return <Redirect to="/" />;
  }

  if (!!user && !isPrivate && !isPublicPrivate) {
    return <Redirect to="/home" />;
  }

  if (!!user && !Component) {
    return <Redirect to="/home" />;
  }

  if (!user && !Component) {
    return <Redirect to="/" />;
  }

  return (
    <ReactDomRoute
      {...rest}
      render={(props) => (
        <Suspense fallback={<div>Carregando...</div>}>
          {!!user && isPrivate ? (
            <PrivateLayout>
              <Component />
            </PrivateLayout>
          ) : (
            <LazyDefaultLayout>
              <Component />
            </LazyDefaultLayout>
          )}
        </Suspense>
      )}
    />
  );
};

export default Route;
