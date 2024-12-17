import { Box, Button, Container, Flex, IconButton, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiCode, FiDatabase } from 'react-icons/fi';
import { BiBitcoin } from 'react-icons/bi';
import { AiOutlineRobot } from 'react-icons/ai';
import { useState } from 'react';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

const NavItems = [
  { name: 'Frontend', icon: <FiCode />, href: '/frontend' },
  { name: 'Backend', icon: <FiDatabase />, href: '/backend' },
  { name: 'Smart Contracts', icon: <BiBitcoin />, href: '/smart-contracts' },
  { name: 'AI Agents', icon: <AiOutlineRobot />, href: '/ai-agents' }
];

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<null | { email: string; avatar: string; name?: string }>(null);
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  const handleSignOut = () => {
    setUser(null);
    router.push('/');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Mock sign in - will be called from AuthModal
  const handleSignIn = () => {
    setUser({
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=demo@example.com`,
    });
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
            {user ? (
              <Box ml={8}>
                <UserMenu user={user} onSignOut={handleSignOut} />
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
              {user ? (
                <UserMenu user={user} onSignOut={handleSignOut} isMobile />
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
            </Stack>
          </Box>
        )}
      </Container>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          handleSignIn(); // Mock sign in when modal closes
        }}
      />
    </Box>
  );
};

export default Navbar;