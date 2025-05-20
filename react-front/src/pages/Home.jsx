import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token, logout } = useAuth();

  return (
    <Box maxW="xl" mx="auto" mt={10} p={6} textAlign="center">
      <Heading mb={4} color="blue.700">Bienvenido a Ferremas</Heading>

      {token ? (
        <>
          <Text color="green.600" mb={4}>Sesión iniciada ✅</Text>
          <Stack direction="row" spacing={4} justify="center">
            <Button as={Link} to="/productos" colorScheme="blue">
              Ver productos
            </Button>
            <Button colorScheme="red" onClick={logout}>
              Cerrar sesión
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Text color="gray.600" mb={4}>No has iniciado sesión</Text>
          <Stack direction="row" spacing={4} justify="center">
            <Button as={Link} to="/login" colorScheme="green">
              Iniciar sesión
            </Button>
            <Button as={Link} to="/register" colorScheme="purple">
              Registrarse
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Home;
