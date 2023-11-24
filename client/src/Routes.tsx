import { Route, Routes } from 'react-router-dom';
import PrivateRoute from '../utils/PrivateRoutes';
import Logged from './pages/Logged';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Renders the router component for routing between different pages in the application.
 *
 * @return {JSX.Element} The router component.
 */
export function Router(): JSX.Element {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/logged" element={<Logged />} />
      </Route>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
