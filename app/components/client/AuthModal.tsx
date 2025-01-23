'use client';

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
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

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
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    const supabase = createClientComponentClient<Database>();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('invalid login credentials')) {
          toast({
            title: 'Invalid Credentials',
            description: 'The email or password you entered is incorrect',
            status: 'error',
            duration: 3000,
          });
        } else if (errorMessage.includes('email not confirmed')) {
          toast({
            title: 'Email Not Confirmed',
            description: 'Please check your email to confirm your account',
            status: 'error',
            duration: 3000,
          });
        } else {
          toast({
            title: 'Error',
            description: error.message,
            status: 'error',
            duration: 3000,
          });
        }
      } else if (data?.user) {
        onClose();
        toast({
          title: 'Success',
          description: 'Signed in successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name || !username) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long',
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

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Account exists',
            description: 'This email is already registered. Please sign in instead.',
            status: 'error',
            duration: 3000,
          });
          return;
        }
        throw error;
      }

      onClose();
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=true#`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Password reset instructions sent to your email',
          status: 'success',
          duration: 5000,
        });
        onClose();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
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
                    <Button
                      variant="link"
                      color="brand.orange"
                      size="sm"
                      onClick={() => handleForgotPassword(email)}
                      isLoading={loading}
                    >
                      Forgot Password?
                    </Button>
                    <Button
                      w="full"
                      bg="brand.orange"
                      color="white"
                      _hover={{ bg: '#ff824d' }}
                      onClick={() => handleSignIn(email, password)}
                      isLoading={loading}
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
                      isLoading={loading}
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