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

  // 💳 Crear orden y redirigir a Flow (firmada correctamente)
  const pagarOrden = async () => {
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const apiKey = '1F522BCF-2CB5-45F9-8EA4-8016C933L426';
    const secretKey = '8d7c176d79c7811e3406cab4edb699914d6341ce';
    const commerceOrder = Date.now();
    const subject = 'Pago Ferremas';
    const currency = 'CLP';
    const amount = total.toFixed(2); // siempre string decimal
    const email = 'rod.reyes.s@gmail.com';
    const urlReturn = 'https://comunidadvirtual.cl/retorno.php';
    const urlConfirmation = 'https://comunidadvirtual.cl/notificacion.php';

    const params = {
      amount,
      apiKey,
      commerceOrder,
      currency,
      email,
      subject,
      urlConfirmation,
      urlReturn,
    };

    // Concatenar alfabéticamente
    const ordenConcatenada = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const textoAFirmar = ordenConcatenada + secretKey;

    // SHA-256 con Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(textoAFirmar);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const url = `https://sandbox.flow.cl/app/web/pay.php?${ordenConcatenada}&s=${signature}`;

    console.log('🔗 Redirigiendo a Flow:', url);
    window.location.href = url;
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
