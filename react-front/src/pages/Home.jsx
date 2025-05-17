import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido a Ferremas</h1>

      {token ? (
        <>
          <p>Sesión iniciada ✅</p>
          <nav>
            <Link to="/productos">
              <button style={{ marginRight: '1rem' }}>Ver productos</button>
            </Link>
            <button onClick={logout}>Cerrar sesión</button>
          </nav>
        </>
      ) : (
        <>
          <p>No has iniciado sesión</p>
          <nav>
            <Link to="/login">
              <button style={{ marginRight: '1rem' }}>Iniciar sesión</button>
            </Link>
            <Link to="/register">
              <button>Registrarse</button>
            </Link>
          </nav>
        </>
      )}
    </div>
  );
};

export default Home;
