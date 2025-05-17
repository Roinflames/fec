import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Productos = () => {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // 🔄 Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/productos', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProductos(data);
        } else {
          setError(data.message || 'Error al cargar productos');
        }
      } catch (err) {
        setError('Fallo de conexión con el servidor');
      }
    };

    fetchProductos();
  }, [token]);

  // 🛒 Agregar producto al carrito
  const agregarAlCarrito = async (productoId) => {
    setMensaje('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/carrito/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          producto_id: productoId,
          cantidad: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje('Producto agregado al carrito 🛒');
      } else {
        setMensaje(data.message || 'Error al agregar producto');
      }
    } catch (err) {
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  // 📦 Obtener carrito
  const obtenerCarrito = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/carrito', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCarrito(data.productos || []);
        setMostrarCarrito(true);
      } else {
        setMensaje(data.message || 'Error al cargar el carrito');
      }
    } catch (err) {
      setMensaje('No se pudo conectar al obtener el carrito');
    }
  };

  // ❌ Eliminar producto del carrito
  const eliminarDelCarrito = async (productoId) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/carrito/remove', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ producto_id: productoId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Producto eliminado del carrito');
        obtenerCarrito(); // Recargar carrito
      } else {
        setMensaje(data.message || 'No se pudo eliminar el producto');
      }
    } catch (err) {
      setMensaje('Error al conectar con el servidor');
    }
  };

  // 💳 Crear orden en Laravel y redirigir a Flow
  const pagarOrden = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/orden/crear', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({}) // puedes enviar vacío si Laravel no espera parámetros
      });

      const data = await response.json();

      if (response.ok && data.url_pago) {
        console.log('🔗 Redirigiendo a:', data.url_pago);
        window.location.href = data.url_pago;
      } else {
        setMensaje(data.message || 'No se pudo iniciar el pago');
      }
    } catch (err) {
      console.error('❌ Error al pagar:', err);
      setMensaje('Error al conectar con Flow');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Listado de Productos</h1>

      <button onClick={obtenerCarrito} style={{ marginBottom: '1rem' }}>
        Ver carrito 🛒
      </button>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {productos.map((producto) => (
          <li
            key={producto.id}
            style={{
              marginBottom: '1rem',
              borderBottom: '1px solid #ccc',
              paddingBottom: '1rem',
            }}
          >
            <h3>{producto.nombre}</h3>
            <p>{producto.descripcion}</p>
            <p>
              <strong>Precio:</strong>{' '}
              ${parseInt(producto.precio).toLocaleString('es-CL')}
            </p>
            <p>
              <strong>Stock:</strong> {producto.stock}
            </p>
            <button onClick={() => agregarAlCarrito(producto.id)}>
              Agregar al carrito
            </button>
          </li>
        ))}
      </ul>

      {/* Mostrar productos del carrito */}
      {mostrarCarrito && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Carrito de compras</h2>
          {carrito.length === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            <>
              <ul>
                {carrito.map((producto) => (
                  <li key={producto.id}>
                    {producto.nombre} - Cantidad: {producto.cantidad} - Subtotal: $
                    {(producto.precio * producto.cantidad).toLocaleString('es-CL')}
                    <button
                      onClick={() => eliminarDelCarrito(producto.id)}
                      style={{ marginLeft: '1rem', color: 'red' }}
                    >
                      ❌ Eliminar
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={pagarOrden} style={{ marginTop: '1rem' }}>
                Ir a pagar 💳
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Productos;
