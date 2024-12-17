import {
  VStack,
  Box,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Change Password
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={6} spacing={4}>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Current Password</FormLabel>
            <Input
              type="password"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel color="whiteAlpha.900">New Password</FormLabel>
            <Input
              type="password"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel color="whiteAlpha.900">Confirm New Password</FormLabel>
            <Input
              type="password"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>

          <Button
            bg="brand.orange"
            color="white"
            _hover={{ bg: '#ff824d' }}
            alignSelf="flex-end"
          >
            Update Password
          </Button>
        </VStack>
      </Box>

      <Divider borderColor="whiteAlpha.200" />

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Delete Account
        </Text>
        <Box bg="whiteAlpha.50" borderRadius="xl" p={6}>
          <Text color="whiteAlpha.800" mb={4}>
            Permanently delete your account and all of your content. This action cannot be undone.
          </Text>
          <Button
            variant="outline"
            color="red.400"
            borderColor="red.400"
            _hover={{ bg: 'red.400', color: 'white' }}
            onClick={onOpen}
          >
            Delete Account
          </Button>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="brand.cardBg" color="white">
          <ModalHeader>Confirm Account Deletion</ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete your account? This will:
            </Text>
            <VStack align="stretch" mt={4} spacing={2} color="whiteAlpha.800">
              <Text>• Delete all your projects and deployments</Text>
              <Text>• Remove all your connected apps and wallets</Text>
              <Text>• Cancel any active subscriptions</Text>
              <Text>• Delete all your data permanently</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="red.400"
              color="white"
              _hover={{ bg: 'red.500' }}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 