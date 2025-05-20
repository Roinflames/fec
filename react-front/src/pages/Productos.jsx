import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Productos = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_URL}/productos`, {
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

  const agregarAlCarrito = async (productoId) => {
    setMensaje('');
    try {
      const response = await fetch(`${API_URL}/carrito/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Producto agregado',
          description: 'Se agregó al carrito 🛒',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMensaje(data.message || 'Error al agregar producto');
      }
    } catch (err) {
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const handleAbrirCarrito = async () => {
    onOpen(); // 🔓 Abrir inmediatamente

    try {
      const response = await fetch(`${API_URL}/carrito`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCarrito(data.productos || []);
      } else {
        toast({
          title: 'Error al cargar el carrito',
          description: data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error al conectar con el servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const eliminarDelCarrito = async (productoId) => {
    try {
      const response = await fetch(`${API_URL}/carrito/remove`, {
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
        toast({
          title: 'Producto eliminado',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        handleAbrirCarrito(); // recarga el contenido sin cerrar el drawer
      } else {
        setMensaje(data.message || 'No se pudo eliminar el producto');
      }
    } catch (err) {
      setMensaje('Error al conectar con el servidor');
    }
  };

const pagarOrden = async () => {
  try {
    const response = await fetch(`${API_URL}/orden/crear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log('🔁 Respuesta de orden:', data); // Debug

    if (response.ok && data.url_pago) {
      toast.closeAll();
      setTimeout(() => {
        window.location.href = data.url_pago; // Redirección segura
      }, 100); // Evita conflictos con animación del drawer
    } else {
      toast({
        title: 'No se pudo iniciar el pago',
        description: data.message || 'No se recibió la URL de Flow',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (err) {
    toast({
      title: 'Error al conectar con Flow',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

  return (
    <Box p={6}>
      <Heading mb={6} color="blue.700">🛠️ Productos disponibles</Heading>

      <Button colorScheme="teal" mb={6} onClick={handleAbrirCarrito}>
        Ver carrito 🛒
      </Button>

      {mensaje && <Text color="green.500">{mensaje}</Text>}
      {error && <Text color="red.500">{error}</Text>}

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {productos.map((producto) => (
          <Card key={producto.id} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardBody>
              <Image
                src="https://via.placeholder.com/300x200?text=Producto"
                alt={producto.nombre}
                borderRadius="md"
              />
              <Stack mt="4" spacing="2">
                <Heading size="md">{producto.nombre}</Heading>
                <Text>{producto.descripcion}</Text>
                <Text color="blue.600" fontWeight="bold">
                  ${parseInt(producto.precio).toLocaleString('es-CL')}
                </Text>
                <Text fontSize="sm">Stock: {producto.stock}</Text>
              </Stack>
            </CardBody>
            <CardFooter>
              <Button colorScheme="blue" onClick={() => agregarAlCarrito(producto.id)}>
                Agregar al carrito
              </Button>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">🛒 Tu carrito</DrawerHeader>
          <DrawerBody>
            {carrito.length === 0 ? (
              <Text color="gray.500" mt={4}>Tu carrito está vacío</Text>
            ) : (
              <Stack spacing={4}>
                {carrito.map((producto) => (
                  <Box
                    key={producto.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontWeight="bold">{producto.nombre}</Text>
                    <Text fontSize="sm">
                      Cantidad: {producto.cantidad} — Subtotal: $
                      {(producto.precio * producto.cantidad).toLocaleString('es-CL')}
                    </Text>
                    <Button
                      size="sm"
                      mt={2}
                      colorScheme="red"
                      onClick={() => eliminarDelCarrito(producto.id)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button colorScheme="green" onClick={pagarOrden} isDisabled={carrito.length === 0}>
              Ir a pagar 💳
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Productos;
