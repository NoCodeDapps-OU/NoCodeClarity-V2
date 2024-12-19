import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  Text,
  Box,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/database.types';

export default function UserMenu() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          
          // Fetch user profile from the users table
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
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase.auth]);

  const getInitial = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <Avatar size="sm" name="Loading" bg="brand.orange" />;
  }

  return (
    <Menu placement="bottom-end">
      <MenuButton>
        <Avatar 
          size="sm" 
          name={username || getInitial(userEmail)}
          bg="brand.orange"
        />
      </MenuButton>
      <MenuList 
        bg="#1A202C"
        borderColor="whiteAlpha.200"
        shadow="xl"
        py={2}
        borderRadius="xl"
        border="1px solid"
        borderWidth="1px"
        _hover={{ borderColor: "whiteAlpha.300" }}
        minW="240px"
      >
        <VStack align="stretch" p={4} spacing={4}>
          <Box>
            <Text color="white" fontWeight="700" fontSize="md">
              {username || 'Welcome'}
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              {userEmail}
            </Text>
          </Box>
          
          <HStack spacing={3}>
            <Box 
              w={2} 
              h={2} 
              borderRadius="full" 
              bg="red.400"
              boxShadow="0 0 10px #F56565"
            />
            <Text color="whiteAlpha.700" fontSize="sm">
              Wallet Not Connected
            </Text>
          </HStack>
        </VStack>
        
        <Divider borderColor="whiteAlpha.200" />
        
        <VStack align="stretch" p={2}>
          <MenuItem
            _hover={{ bg: 'whiteAlpha.100' }}
            _focus={{ bg: 'whiteAlpha.100' }}
            _active={{ bg: 'whiteAlpha.200' }}
            color="brand.orange"
            fontSize="sm"
            py={2}
            px={3}
            borderRadius="md"
            fontWeight="500"
            onClick={handleProfileClick}
            bg="transparent"
          >
            Profile
          </MenuItem>
          <MenuItem
            _hover={{ bg: 'whiteAlpha.100' }}
            _focus={{ bg: 'whiteAlpha.100' }}
            _active={{ bg: 'whiteAlpha.200' }}
            color="red.400"
            onClick={handleSignOut}
            fontSize="sm"
            py={2}
            px={3}
            borderRadius="md"
            fontWeight="500"
            bg="transparent"
          >
            Sign Out
          </MenuItem>
        </VStack>
      </MenuList>
    </Menu>
  );
} 