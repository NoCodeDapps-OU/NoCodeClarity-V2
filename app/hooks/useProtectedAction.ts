'use client';

import { useCallback, useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { useSupabase } from '@/providers/SupabaseProvider';

export const useProtectedAction = () => {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { auth } = useSupabase();

  const handleProtectedAction = useCallback(async (action: () => void | Promise<void>) => {
    try {
      setLoading(true);
      const { data: { user }, error } = await auth.getUser();

      if (error || !user) {
        onOpen();
        return;
      }

      await action();
    } catch (error) {
      console.error('Protected action error:', error);
    } finally {
      setLoading(false);
    }
  }, [auth, onOpen]);

  return {
    handleProtectedAction,
    isAuthModalOpen: isOpen,
    onAuthModalClose: onClose,
    loading
  };
}; 