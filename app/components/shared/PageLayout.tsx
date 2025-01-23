'use client';

import { Box } from '@chakra-ui/react';
import { GradientBackground } from '@/components/shared/Gradient';
import AuthModal from '@/components/client/AuthModal';
import ClientOnly from '@/components/client/ClientOnly';

interface PageLayoutProps {
  children: React.ReactNode;
  isAuthModalOpen: boolean;
  onAuthModalClose: () => void;
}

export default function PageLayout({ 
  children, 
  isAuthModalOpen, 
  onAuthModalClose 
}: PageLayoutProps) {
  return (
    <ClientOnly>
      <Box minH="100vh" display="flex" flexDirection="column" position="relative">
        <GradientBackground />
        {children}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={onAuthModalClose}
        />
      </Box>
    </ClientOnly>
  );
} 