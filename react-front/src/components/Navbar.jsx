import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user")); // ✅ obtiene el nombre directamente
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      bg={useColorModeValue('blue.700', 'gray.900')}
      px={4}
      py={3}
      color="white"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex alignItems="center">
        <Heading size="md">
          <RouterLink to="/">Ferremas</RouterLink>
        </Heading>

        <Spacer />

        <HStack spacing={4} alignItems="center">
          <Button as={RouterLink} to="/" variant="link" color="white">
            Inicio
          </Button>

          {token && (
            <Button as={RouterLink} to="/productos" variant="link" color="white">
              Productos
            </Button>
          )}

          {!token ? (
            <>
              <Button
                as={RouterLink}
                to="/login"
                variant="outline"
                size="sm"
                colorScheme="whiteAlpha"
              >
                Iniciar sesión
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                variant="solid"
                size="sm"
                colorScheme="green"
              >
                Registrarse
              </Button>
            </>
          ) : (
            <>
              <Text
                as={RouterLink}
                to="/perfil"
                fontWeight="bold"
                _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                👤 {user?.name || 'Usuario'}
              </Text>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                colorScheme="whiteAlpha"
              >
                Cerrar sesión
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
