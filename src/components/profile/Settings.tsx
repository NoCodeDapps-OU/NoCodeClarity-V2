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
  useToast,
  Link,
} from '@chakra-ui/react';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const toast = useToast();
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: passwords.current,
      });

      if (signInError) {
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (updateError) throw updateError;

      // Clear password fields
      setPasswords({
        current: '',
        new: '',
        confirm: '',
      });

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        status: 'success',
        duration: 3000,
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

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) throw new Error('No user email found');

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.',
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

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);

      // Call our API endpoint to delete the account
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete account' }));
        throw new Error(error.message || 'Failed to delete account');
      }

      // Sign out and clear auth state
      await supabase.auth.signOut();
      
      // Close modal before navigation
      onClose();
      
      // Use router for navigation instead of direct window.location
      router.push('/');
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error deleting account',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
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
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
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
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>

          <VStack spacing={2} align="stretch">
            <Button
              bg="brand.orange"
              color="white"
              _hover={{ bg: '#ff824d' }}
              onClick={handlePasswordChange}
              isLoading={loading}
            >
              Update Password
            </Button>
            
            <Button
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={handleForgotPassword}
              isDisabled={loading}
            >
              Forgot Password?
            </Button>
          </VStack>
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
              onClick={handleDeleteAccount}
              isLoading={loading}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 