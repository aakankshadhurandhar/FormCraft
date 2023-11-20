import { Navigate, Outlet } from 'react-router-dom';

/**
 * Render a private route.
 *
 * @return {ReactElement} The component to render based on authentication status.
 */
const PrivateRoute: React.FC = () => {
  return localStorage.getItem('token') === null ? (
    <Navigate to="/login" />
  ) : (
    <Outlet />
  );
};

export default PrivateRoute;
