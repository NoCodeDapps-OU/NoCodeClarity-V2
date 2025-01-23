'use client';

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
  Spinner,
  useClipboard,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useUserMenuState } from '@/hooks/useUserMenuState';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useRootstockWallet } from '@/hooks/useRootstockWallet';
import { useStacksTokens } from '@/hooks/useStacksTokens';
import { useRootstockTokens } from '@/hooks/useRootstockTokens';
import { useState, useEffect, useRef } from 'react';

export default function UserMenu() {
  const {
    userEmail,
    username,
    loading,
    handleProfileClick,
    handleSignOut,
    getInitial,
    walletConnections
  } = useUserMenuState();

  // Get wallet states with proper disconnect handling
  const { walletData: stacksWallet, connectWallet: connectStacks, disconnectWallet: disconnectStacks } = useStacksWallet();
  const { walletData: rootstockWallet, connectWallet: connectRootstock, disconnectWallet: disconnectRootstock } = useRootstockWallet();
  
  // Get token balances with refresh functions
  const { stx, refreshAllBalances: refreshStx } = useStacksTokens();
  const { rbtc, refreshBalance: refreshRbtc } = useRootstockTokens();

  // Add state for clipboard functionality
  const { hasCopied: stacksCopied, onCopy: onStacksCopy } = useClipboard(stacksWallet?.address || '');
  const { hasCopied: rootstockCopied, onCopy: onRootstockCopy } = useClipboard(rootstockWallet?.address || '');
  const toast = useToast();

  useEffect(() => {
    const handleWalletStateChange = (event: CustomEvent<{
      type: 'stacks' | 'rootstock';
      connected: boolean;
      address: string | null;
    }>) => {
      const { type } = event.detail;
      
      // Refresh balances when wallet state changes
      if (type === 'stacks') {
        refreshStx?.();
      } else if (type === 'rootstock') {
        refreshRbtc?.();
      }
      // Force re-render
      setUpdate({ timestamp: Date.now() });
    };

    const handleStacksChange = (event: CustomEvent) => {
      refreshStx?.();
      setUpdate({ timestamp: Date.now() });
    };

    const handleRootstockChange = (event: CustomEvent) => {
      refreshRbtc?.();
      setUpdate({ timestamp: Date.now() });
    };

    window.addEventListener('wallet_state_changed', handleWalletStateChange as EventListener);
    window.addEventListener('stx_accountsChanged', handleStacksChange as EventListener);
    window.addEventListener('rsk_accountsChanged', handleRootstockChange as EventListener);
    
    return () => {
      window.removeEventListener('wallet_state_changed', handleWalletStateChange as EventListener);
      window.removeEventListener('stx_accountsChanged', handleStacksChange as EventListener);
      window.removeEventListener('rsk_accountsChanged', handleRootstockChange as EventListener);
    };
  }, [refreshStx, refreshRbtc]);

  // Add state to force re-renders with proper typing
  const [update, setUpdate] = useState<{ timestamp?: number }>({});

  // Add refs to track wallet states
  const stacksConnectedRef = useRef(false);
  const rootstockConnectedRef = useRef(false);

  // Update effect to handle wallet connection updates
  useEffect(() => {
    const handleWalletStateChange = (event: CustomEvent<{
      type: 'stacks' | 'rootstock';
      connected: boolean;
      address: string | null;
      timestamp?: number;
    }>) => {
      const { type, connected, address } = event.detail;
      
      // Update refs and force immediate UI update
      if (type === 'stacks') {
        stacksConnectedRef.current = connected;
      } else if (type === 'rootstock') {
        rootstockConnectedRef.current = connected;
      }
      
      // Force re-render with timestamp
      setUpdate({ timestamp: Date.now() });
    };

    const handleStacksWalletChange = (event: CustomEvent) => {
      const { connected } = event.detail;
      stacksConnectedRef.current = connected;
      // Force immediate UI update
      setUpdate({ timestamp: Date.now() });
    };

    const handleRootstockWalletChange = (event: CustomEvent) => {
      const { connected } = event.detail;
      rootstockConnectedRef.current = connected;
      // Force immediate UI update
      setUpdate({ timestamp: Date.now() });
    };

    // Add event listeners for both wallet types
    window.addEventListener('stx_accountsChanged', handleStacksWalletChange as EventListener);
    window.addEventListener('rsk_accountsChanged', handleRootstockWalletChange as EventListener);
    window.addEventListener('wallet_state_changed', handleWalletStateChange as EventListener);

    // Initial state check
    const stacksConnected = !!(stacksWallet?.isConnected && stacksWallet?.address);
    const rootstockConnected = !!(rootstockWallet?.isConnected && rootstockWallet?.address);
    stacksConnectedRef.current = stacksConnected;
    rootstockConnectedRef.current = rootstockConnected;
    setUpdate({ timestamp: Date.now() });

    return () => {
      window.removeEventListener('stx_accountsChanged', handleStacksWalletChange as EventListener);
      window.removeEventListener('rsk_accountsChanged', handleRootstockWalletChange as EventListener);
      window.removeEventListener('wallet_state_changed', handleWalletStateChange as EventListener);
    };
  }, [stacksWallet?.isConnected, stacksWallet?.address, rootstockWallet?.isConnected, rootstockWallet?.address]);

  // Determine actual connection status with strict checks
  const isStacksConnected = !!(stacksWallet?.isConnected && stacksWallet?.address);
  const isRootstockConnected = !!(rootstockWallet?.isConnected && rootstockWallet?.address);
  const isAnyWalletConnected = isStacksConnected || isRootstockConnected;

  // Handle copy with toast notifications
  const handleStacksCopy = () => {
    onStacksCopy();
    toast({
      title: "Address Copied",
      description: "Stacks wallet address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleRootstockCopy = () => {
    onRootstockCopy();
    toast({
      title: "Address Copied",
      description: "Rootstock wallet address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right"
    });
  };

  // Format addresses helper
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Box p={2}>
        <Spinner size="sm" color="brand.orange" />
      </Box>
    );
  }

  // Only render menu if we have user data
  if (!userEmail) return null;

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
              bg={isAnyWalletConnected ? "green.400" : "red.400"}
              boxShadow={isAnyWalletConnected ? "0 0 10px #48BB78" : "0 0 10px #F56565"}
            />
            <Text color="whiteAlpha.700" fontSize="sm">
              {isAnyWalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
            </Text>
          </HStack>

          {/* Show Stacks wallet if properly connected */}
          {isStacksConnected && stacksWallet.address && (
            <VStack align="stretch" spacing={1}>
              <Text color="whiteAlpha.600" fontSize="xs">
                Stacks Wallet
              </Text>
              <Tooltip 
                label={stacksCopied ? "Copied!" : "Click to copy"} 
                placement="top"
              >
                <Text 
                  color="whiteAlpha.900" 
                  fontSize="sm" 
                  cursor="pointer"
                  onClick={handleStacksCopy}
                >
                  {formatAddress(stacksWallet.address)} • {stx} STX
                </Text>
              </Tooltip>
            </VStack>
          )}

          {/* Show Rootstock wallet if properly connected */}
          {isRootstockConnected && rootstockWallet.address && (
            <VStack align="stretch" spacing={1}>
              <Text color="whiteAlpha.600" fontSize="xs">
                Rootstock Wallet
              </Text>
              <Tooltip 
                label={rootstockCopied ? "Copied!" : "Click to copy"} 
                placement="top"
              >
                <Text 
                  color="whiteAlpha.900" 
                  fontSize="sm" 
                  cursor="pointer"
                  onClick={handleRootstockCopy}
                >
                  {formatAddress(rootstockWallet.address)} • {rbtc} RBTC
                </Text>
              </Tooltip>
            </VStack>
          )}
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