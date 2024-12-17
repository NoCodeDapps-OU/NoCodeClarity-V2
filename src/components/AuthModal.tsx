import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Button,
  Text,
  Box,
  Image,
  FormControl,
  FormLabel,
  Link,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const toast = useToast();
  const router = useRouter();

  const handleSignIn = () => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Just close the modal and show success message
    onClose();
    toast({
      title: 'Success',
      description: 'Signed in successfully',
      status: 'success',
      duration: 3000,
    });
  };

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword || !name || !username) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Just close the modal and show success message
    onClose();
    toast({
      title: 'Success',
      description: 'Account created successfully',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="brand.cardBg" color="white" mx={4}>
        <ModalBody p={8}>
          <VStack spacing={6}>
            <Image
              src="/nocc-logo.png"
              alt="NOCC Logo"
              width="120px"
              height="auto"
            />
            
            <Tabs variant="soft-rounded" colorScheme="orange" width="100%">
              <TabList justifyContent="center" mb={4}>
                <Tab _selected={{ bg: 'brand.orange' }} mx={2}>Sign In</Tab>
                <Tab _selected={{ bg: 'brand.orange' }} mx={2}>Sign Up</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <Link
                      alignSelf="flex-start"
                      color="brand.orange"
                      fontSize="sm"
                      _hover={{ textDecoration: 'none', opacity: 0.8 }}
                    >
                      Forgot Password?
                    </Link>
                    <Button
                      w="full"
                      bg="brand.orange"
                      color="white"
                      _hover={{ bg: '#ff824d' }}
                      onClick={handleSignIn}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Input
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Choose a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        bg="whiteAlpha.50"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _hover={{ borderColor: "whiteAlpha.300" }}
                        _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                      />
                    </FormControl>
                    <Button
                      w="full"
                      bg="brand.orange"
                      color="white"
                      _hover={{ bg: '#ff824d' }}
                      onClick={handleSignUp}
                    >
                      Sign Up
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 