import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import { useSearchParams } from 'next/navigation';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const supabase = createClientComponentClient<Database>();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeSession = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery'
          });
          
          if (error) {
            toast({
              title: 'Error',
              description: 'Unable to verify your session. Please try again.',
              status: 'error',
              duration: 3000,
            });
            onClose();
          }
        } catch (err) {
          console.error('Error verifying recovery:', err);
        }
      }
    };

    if (isOpen) {
      initializeSession();
    }
  }, [isOpen]);

  const handlePasswordReset = async () => {
    if (!newPassword) {
      toast({
        title: 'Error',
        description: 'Please enter a new password',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
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
          description: 'Password updated successfully. Please sign in with your new password.',
          status: 'success',
          duration: 5000,
        });
        await supabase.auth.signOut();
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

  const modalProps = {
    isOpen,
    onClose,
    isCentered: true,
    closeOnOverlayClick: false,
    closeOnEsc: false,
  };

  return (
    <Modal {...modalProps}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="brand.cardBg" color="white" mx={4}>
        <ModalBody p={8}>
          <VStack spacing={6}>
            <Heading size="md">Reset Password</Heading>
            <Text fontSize="sm" color="whiteAlpha.800" textAlign="center">
              Please enter your new password
            </Text>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                bg="whiteAlpha.50"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: "whiteAlpha.300" }}
                _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                placeholder="Enter your new password"
              />
            </FormControl>
            <Button
              w="full"
              bg="brand.orange"
              color="white"
              _hover={{ bg: '#ff824d' }}
              onClick={handlePasswordReset}
              isLoading={loading}
            >
              Update Password
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 