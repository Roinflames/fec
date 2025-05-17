import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { auth, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Productos</Link>
      {auth && <Link to="/carrito">Carrito</Link>}
      {auth ? (
        <button onClick={logout}>Cerrar sesión</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/registro">Registro</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
