import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A function component that renders the public route.
 *
 * @return {ReactElement} The component that should be rendered based on the condition.
 */
const PublicRoute: React.FC = () => {
  return localStorage.getItem('token') === null ? (
    <Navigate to="/" />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
