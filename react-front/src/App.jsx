import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Carrito from './pages/Carrito';
import Pago from './pages/Pago';
import Productos from './pages/Productos'; // ← Confirmado con export default
import PrivateRoute from './components/PrivateRoute'; // ← Confirmado funcional

function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protegidas */}
        <Route
          path="/carrito"
          element={
            <PrivateRoute>
              <Carrito />
            </PrivateRoute>
          }
        />
        <Route
          path="/pagar"
          element={
            <PrivateRoute>
              <Pago />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Productos />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
