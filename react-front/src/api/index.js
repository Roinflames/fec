// const API_URL = 'http://localhost:8000/api';
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getToken = () => localStorage.getItem('token');

export const apiHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const register = async (data) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const fetchProductos = async () => {
  const res = await fetch(`${API_URL}/productos`);
  return res.json();
};

export const getCarrito = async () => {
  const res = await fetch(`${API_URL}/carrito`, {
    headers: apiHeaders()
  });
  return res.json();
};

export const addToCarrito = async (producto_id, cantidad) => {
  const res = await fetch(`${API_URL}/carrito/add`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({ producto_id, cantidad })
  });
  return res.json();
};

export const crearOrden = async () => {
  const res = await fetch(`${API_URL}/orden/crear`, {
    method: 'POST',
    headers: apiHeaders()
  });
  return res.json();
};
