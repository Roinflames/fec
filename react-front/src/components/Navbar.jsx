import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
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

        <HStack spacing={4}>
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
            user && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                  colorScheme="whiteAlpha"
                >
                  👤 {user.name}
                </MenuButton>
                <MenuList>
                  <MenuItem isDisabled>{user.email}</MenuItem>
                  <MenuItem onClick={handleLogout} color="red.500">
                    Cerrar sesión
                  </MenuItem>
                </MenuList>
              </Menu>
            )
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
