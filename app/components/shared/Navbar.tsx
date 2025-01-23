'use client';

import { Box, Button, Container, Flex, IconButton, Stack, Text, useDisclosure, HStack } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiCode, FiDatabase } from 'react-icons/fi';
import { BiBitcoin } from 'react-icons/bi';
import { AiOutlineRobot } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/client/AuthModal';
import UserMenu from '@/components/client/UserMenu';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

const NavItems = [
  { name: 'Frontend', icon: <FiCode />, href: '/frontend' },
  { name: 'Backend', icon: <FiDatabase />, href: '/backend' },
  { name: 'Smart Contracts', icon: <BiBitcoin />, href: '/smart-contracts' },
  { name: 'AI Agents', icon: <AiOutlineRobot />, href: '/ai-agents' }
];

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>('');
  const supabase = createClientComponentClient<Database>();
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (profile?.username) {
            setUsername(profile.username);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUsername('');
      } else if (event === 'SIGNED_IN') {
        checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <Box 
      bg="white" 
      position="relative"
      zIndex={10}
      boxShadow="sm"
    >
      <Container maxW="1440px" px={{ base: 4, md: 8, lg: 12 }}>
        <Flex align="center" justify="space-between" h="64px">
          <Link href="/">
            <Text
              fontSize="2xl"
              fontWeight="900"
              color="brand.orange"
            >
              NOCC
            </Text>
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} align="center">
            <Stack direction="row" spacing={8}>
              {NavItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  leftIcon={item.icon}
                  fontSize="md"
                  fontWeight="700"
                  color="gray.700"
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.name}
                </Button>
              ))}
            </Stack>
            {isAuthenticated ? (
              <Box ml={8}>
                <UserMenu />
              </Box>
            ) : (
              <Button
                ml={8}
                bg="brand.orange"
                color="white"
                _hover={{ bg: '#ff824d' }}
                onClick={() => setIsAuthOpen(true)}
              >
                Sign In
              </Button>
            )}
          </Flex>

          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            aria-label="Toggle Navigation"
            color="gray.700"
          />
        </Flex>

        {isOpen && (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              {isAuthenticated ? (
                <HStack px={4} py={2} justify="space-between" w="full">
                  <HStack spacing={3}>
                    <UserMenu />
                    {username && (
                      <Text color="gray.700" fontWeight="600">
                        {username}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              ) : (
                <Button
                  w="full"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={() => setIsAuthOpen(true)}
                >
                  Sign In
                </Button>
              )}
              {NavItems.map((item) => (
                <Button
                  key={item.name}
                  w="full"
                  variant="ghost"
                  leftIcon={item.icon}
                  justifyContent="flex-start"
                  fontSize="md"
                  fontWeight="700"
                  color="gray.700"
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.name}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Container>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </Box>
  );
}