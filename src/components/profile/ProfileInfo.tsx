import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Grid,
  GridItem,
} from '@chakra-ui/react';

export default function ProfileInfo() {
  return (
    <VStack spacing={6} align="stretch">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Name</FormLabel>
            <Input
              defaultValue="John Doe"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>
        
        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Username</FormLabel>
            <Input
              defaultValue="@johndoe"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Email</FormLabel>
            <Input
              type="email"
              defaultValue="john@example.com"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Password</FormLabel>
            <Input
              type="password"
              defaultValue="********"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>
      </Grid>

      <Button
        bg="brand.orange"
        color="white"
        _hover={{ bg: '#ff824d' }}
        alignSelf="flex-end"
      >
        Save Changes
      </Button>
    </VStack>
  );
} 