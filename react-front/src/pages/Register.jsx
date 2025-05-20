import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6 || confirmacion.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: nombre,
          email,
          password,
          password_confirmation: confirmacion, // ✅ Aquí está la corrección
        }),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (response.ok && data.token) {
        login(data.token);
        toast({
          title: 'Registro exitoso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        setError(data.message || 'Error al registrarse');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Fallo de conexión con el servidor');
    }
  };

  const contraseñasNoCoinciden = confirmacion.length > 0 && password !== confirmacion;

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center" color="blue.700">Crear cuenta</Heading>

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="correo@ferremas.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired isInvalid={contraseñasNoCoinciden}>
            <FormLabel>Confirmar contraseña</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
            />
            {contraseñasNoCoinciden && (
              <FormErrorMessage>Las contraseñas no coinciden</FormErrorMessage>
            )}
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">
            Registrarse
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register;
