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
import { useRouter } from 'next/router';

interface UserMenuProps {
  user: {
    email: string;
    avatar: string;
    name?: string;
  };
  onSignOut: () => void;
  isMobile?: boolean;
}

export default function UserMenu({ user, onSignOut, isMobile }: UserMenuProps) {
  const isWalletConnected = false;
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton>
        <HStack 
          spacing={3} 
          bg={isMobile ? "whiteAlpha.100" : "transparent"}
          p={isMobile ? 2 : 0}
          borderRadius="md"
          w={isMobile ? "full" : "auto"}
        >
          <Avatar
            src={user.avatar}
            size={isMobile ? "xs" : "sm"}
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
          />
          {isMobile && (
            <Text color="gray.700" fontSize="sm" fontWeight="600" flex={1}>
              {user.name || user.email.split('@')[0]}
            </Text>
          )}
        </HStack>
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
              NOCC
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              nocc@nocc.com
            </Text>
          </Box>
          
          <HStack spacing={3}>
            <Box 
              w={2} 
              h={2} 
              borderRadius="full" 
              bg={isWalletConnected ? "green.400" : "red.400"}
              boxShadow={`0 0 10px ${isWalletConnected ? "#48BB78" : "#F56565"}`}
            />
            <Text color="whiteAlpha.700" fontSize="sm">
              Wallet {isWalletConnected ? 'Connected' : 'Not Connected'}
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
            onClick={onSignOut}
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