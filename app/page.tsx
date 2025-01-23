'use client';

import { Box, Button, Container, Grid, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { FiCode, FiDatabase, FiCpu } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthModal from '@/components/client/AuthModal';
import ResetPasswordModal from '@/components/client/ResetPasswordModal';
import { useRouter } from 'next/navigation';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Box
    p={6}
    bg="brand.cardBg"
    borderRadius="xl"
    _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
  >
    <VStack spacing={4} align="flex-start">
      <Box color="brand.orange" fontSize="2xl">
        {icon}
      </Box>
      <Heading size="md" color="white">
        {title}
      </Heading>
      <Text color="whiteAlpha.700" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Box>
);

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get('reset') === 'true') {
      setIsResetOpen(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleResetComplete = () => {
    setIsResetOpen(false);
    setIsAuthOpen(true);
  };

  return (
    <Container maxW="container.xl" pt={20} pb={20} flex="1">
      <VStack spacing={8} align="center" textAlign="center" mb={16}>
        <Heading
          as="h1"
          size="2xl"
          color="white"
          fontWeight="900"
          lineHeight="1.2"
        >
          Build Bitcoin dApps
          <Text color="brand.orange" display="block" fontWeight="900">
            Without Code
          </Text>
        </Heading>
        
        <Text color="whiteAlpha.800" fontSize="lg" maxW="container.md" fontWeight="600">
          Create full-stack Bitcoin applications using AI-powered tools. No coding
          required. From frontend to smart contracts, we've got you covered.
        </Text>
        
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={4}>
          <Button
            size="lg"
            bg="brand.orange"
            color="white"
            _hover={{ bg: '#ff824d' }}
            px={8}
            onClick={() => setIsAuthOpen(true)}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{ bg: 'whiteAlpha.100' }}
            px={8}
          >
            Watch Demo
          </Button>
        </Stack>
      </VStack>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
        gap={8}
        mt={16}
      >
        <FeatureCard
          icon={<FiCode />}
          title="Frontend Builder"
          description="Create responsive UIs with simple prompts"
        />
        <FeatureCard
          icon={<FiDatabase />}
          title="Backend Builder"
          description="Generate serverless APIs and database logic"
        />
        <FeatureCard
          icon={<FaBitcoin />}
          title="Smart Contracts"
          description="Deploy Bitcoin smart contracts easily"
        />
        <FeatureCard
          icon={<FiCpu />}
          title="AI Agents"
          description="Let AI handle the development process"
        />
      </Grid>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
      />
      
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={handleResetComplete}
      />
    </Container>
  );
}