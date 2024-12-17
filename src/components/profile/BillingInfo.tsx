import {
  VStack,
  Box,
  Text,
  Button,
  HStack,
  Icon,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import { CreditCard, Plus } from 'lucide-react';

export default function BillingInfo() {
  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Payment Methods
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4} spacing={4}>
          <HStack 
            spacing={4} 
            bg="whiteAlpha.100" 
            p={4} 
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Icon as={CreditCard} color="brand.orange" boxSize={6} />
            <Box flex={1}>
              <Text color="white" fontWeight="600">•••• •••• •••• 4242</Text>
              <Text color="whiteAlpha.700" fontSize="sm">Expires 12/24</Text>
            </Box>
            <Button
              variant="ghost"
              color="red.400"
              _hover={{ bg: 'whiteAlpha.100' }}
              size="sm"
            >
              Remove
            </Button>
          </HStack>

          <Button
            leftIcon={<Icon as={Plus} />}
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Add Payment Method
          </Button>
        </VStack>
      </Box>

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Billing History
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4} spacing={4}>
          {[...Array(3)].map((_, i) => (
            <Grid
              key={i}
              templateColumns="repeat(4, 1fr)"
              gap={4}
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
              alignItems="center"
            >
              <GridItem>
                <Text color="white" fontWeight="600">Jan {i + 1}, 2024</Text>
              </GridItem>
              <GridItem>
                <Text color="whiteAlpha.800">Pro Plan</Text>
              </GridItem>
              <GridItem>
                <Text color="green.400" fontWeight="600">$49.00</Text>
              </GridItem>
              <GridItem textAlign="right">
                <Button
                  variant="ghost"
                  color="brand.orange"
                  size="sm"
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  Download
                </Button>
              </GridItem>
            </Grid>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
} 