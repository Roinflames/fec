import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';

const Perfil = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Center py={10}>
      <Box
        maxW={'md'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'lg'}
        rounded={'lg'}
        p={6}
        textAlign={'center'}
      >
        <Avatar
          size={'xl'}
          name={user?.name || 'Usuario'}
          mb={4}
          bg="teal.500"
        />
        <Heading fontSize={'2xl'} fontWeight={600} color="teal.700">
          {user?.name || 'Nombre no disponible'}
        </Heading>
        <Text fontSize={'md'} color={'gray.500'} mt={2}>
          {user?.email || 'Correo no disponible'}
        </Text>

        <Stack mt={6} spacing={2}>
          <Text fontSize="sm" color="gray.600">
            ¡Bienvenido a tu perfil!
          </Text>
        </Stack>
      </Box>
    </Center>
  );
};

export default Perfil;
