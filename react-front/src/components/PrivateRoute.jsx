import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();

  // Si hay token, renderiza los hijos. Si no, redirige a login.
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
