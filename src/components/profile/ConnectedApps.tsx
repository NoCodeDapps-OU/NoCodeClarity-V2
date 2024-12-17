import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { Wallet, Github, Database, Rocket } from 'lucide-react';

interface ConnectionItemProps {
  icon: any;
  title: string;
  description: string;
  isConnected?: boolean;
}

const ConnectionItem = ({ icon, title, description, isConnected }: ConnectionItemProps) => (
  <HStack spacing={4} w="full" justify="space-between" py={4}>
    <HStack spacing={4}>
      <Box
        p={2}
        borderRadius="lg"
        bg="whiteAlpha.100"
      >
        <Icon as={icon} color="brand.orange" boxSize={6} />
      </Box>
      <Box>
        <Text color="white" fontWeight="600">{title}</Text>
        <Text color="whiteAlpha.700" fontSize="sm">{description}</Text>
      </Box>
    </HStack>
    <Button
      variant={isConnected ? "outline" : "solid"}
      bg={isConnected ? "transparent" : "brand.orange"}
      color="white"
      borderColor={isConnected ? "whiteAlpha.400" : "transparent"}
      _hover={{
        bg: isConnected ? "whiteAlpha.100" : "#ff824d",
      }}
      size="sm"
    >
      {isConnected ? "Disconnect" : "Connect"}
    </Button>
  </HStack>
);

export default function ConnectedApps() {
  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Wallet Connections
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <ConnectionItem
            icon={Wallet}
            title="Stacks Wallet"
            description="Connect your Stacks wallet"
            isConnected={true}
          />
          <Divider borderColor="whiteAlpha.200" />
          <ConnectionItem
            icon={Wallet}
            title="Rootstock Wallet"
            description="Connect your Rootstock wallet"
          />
          <Divider borderColor="whiteAlpha.200" />
          <ConnectionItem
            icon={Wallet}
            title="Xverse Wallet"
            description="Connect your Xverse wallet"
          />
        </VStack>
      </Box>

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Deployments
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <ConnectionItem
            icon={Rocket}
            title="Vercel"
            description="Deploy your frontend applications"
            isConnected={true}
          />
          <Divider borderColor="whiteAlpha.200" />
          <ConnectionItem
            icon={Github}
            title="GitHub"
            description="Connect your GitHub account"
            isConnected={true}
          />
        </VStack>
      </Box>

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Database
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <ConnectionItem
            icon={Database}
            title="MongoDB"
            description="Connect your MongoDB database"
          />
        </VStack>
      </Box>
    </VStack>
  );
} 