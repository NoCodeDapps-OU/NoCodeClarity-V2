'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Icon,
  Divider,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { Wallet, Github, Database, Rocket, ChevronDown, RefreshCw } from 'lucide-react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksTokens } from '@/hooks/useStacksTokens';
import { useRootstockWallet } from '@/hooks/useRootstockWallet';
import { useRootstockTokens } from '@/hooks/useRootstockTokens';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useUserStore } from '@/stores/userStore';
import { useVercelConnection } from '@/hooks/useVercelConnection';
import { useGithubConnection } from '@/hooks/useGithubConnection';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

const ConnectedApps = memo(function ConnectedApps() {
  // Move all hooks to the top level
  const { profile } = useUserStore();
  const { isAuthenticated } = useSupabase();
  const { connectionData, isLoading: vercelLoading, connectVercel, disconnectVercel } = useVercelConnection();
  
  // Cache wallet data
  const cachedStacksWallet = profile?.walletConnections?.stacks;
  const cachedRootstockWallet = profile?.walletConnections?.rootstock;

  // Initialize wallet hooks
  const stacksWallet = useStacksWallet(cachedStacksWallet);
  const rootstockWallet = useRootstockWallet(cachedRootstockWallet);
  
  // Initialize token hooks
  const stacksTokens = useStacksTokens();
  const rootstockTokens = useRootstockTokens();

  // Destructure values after all hooks
  const { 
    walletData: stacksWalletData,
    isLoading: stacksLoading,
    connectWallet: connectStacks,
    disconnectWallet: disconnectStacks,
    formatAddress: formatStacksAddress
  } = stacksWallet;

  const {
    walletData: rootstockWalletData,
    isLoading: rootstockLoading,
    connectWallet: connectRootstock,
    disconnectWallet: disconnectRootstock,
    formatAddress: formatRootstockAddress
  } = rootstockWallet;

  const { 
    stx: stxBalance,
    nocc: noccBalance,
    refreshAllBalances,
    loading: balanceLoading 
  } = stacksTokens;

  const { 
    rbtc, 
    loading: rootstockBalanceLoading,
    refreshBalance: refreshRbtcBalance 
  } = rootstockTokens;

  // Keep only one effect for balance updates
  useEffect(() => {
    const handleBalanceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<BalanceUpdateEventDetail>;
      if (customEvent.detail?.needsUpdate === false) {
        refreshAllBalances();
      }
    };

    const handleRootstockUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        address: string | null;
        connected: boolean;
      }>;
      
      if (customEvent.detail?.connected) {
        // Trigger balance update immediately
        refreshRbtcBalance();
      }
    };

    window.addEventListener('stacks-balance-update', handleBalanceUpdate);
    window.addEventListener('rsk_accountsChanged', handleRootstockUpdate);
    
    return () => {
      window.removeEventListener('stacks-balance-update', handleBalanceUpdate);
      window.removeEventListener('rsk_accountsChanged', handleRootstockUpdate);
    };
  }, [refreshAllBalances, refreshRbtcBalance]);

  const { 
    connectionData: githubConnection,
    isLoading: githubLoading,
    connectGithub,
    disconnectGithub
  } = useGithubConnection();

  const { 
    connectionData: supabaseData,
    isLoading: supabaseLoading,
    connectSupabase,
    disconnectSupabase
  } = useSupabaseConnection();

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Wallet Connections
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <HStack 
            spacing={4} 
            w="full" 
            justify="space-between" 
            py={4}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <HStack spacing={4} flex="1" minW={{ base: "full", md: "auto" }}>
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100">
                <Icon as={Wallet} color="brand.orange" boxSize={6} />
              </Box>
              <Box flex="1">
                <Text color="white" fontWeight="600">Stacks Wallet</Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {stacksWalletData.isConnected 
                    ? formatStacksAddress(stacksWalletData.address)
                    : 'Connect your Stacks wallet'
                  }
                </Text>
              </Box>
              {stacksWalletData.isConnected && (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronDown />}
                    color="brand.orange"
                    _hover={{ 
                      bg: 'whiteAlpha.100',
                      color: 'brand.orange'
                    }}
                    _active={{
                      bg: 'whiteAlpha.100',
                      color: 'brand.orange'
                    }}
                    ml={2}
                    onClick={() => {
                      if (stacksWalletData.isConnected) {
                        refreshAllBalances();
                      }
                    }}
                  >
                    {balanceLoading ? (
                      <Spinner size="xs" color="brand.orange" />
                    ) : (
                      'Balance'
                    )}
                  </MenuButton>
                  <MenuList
                    bg="brand.cardBg"
                    borderColor="whiteAlpha.200"
                    py={2}
                    borderRadius="lg"
                    boxShadow="xl"
                  >
                    <VStack align="stretch" spacing={2}>
                      <Box
                        px={4}
                        py={2}
                        _hover={{ bg: 'whiteAlpha.100' }}
                        cursor="pointer"
                      >
                        <HStack justify="space-between" width="full">
                          <Text color="brand.orange" fontWeight="600">
                            {stxBalance} STX
                          </Text>
                          <IconButton
                            aria-label="Refresh STX balance"
                            icon={<Icon as={RefreshCw} />}
                            size="xs"
                            variant="ghost"
                            color="brand.orange"
                            isLoading={balanceLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshAllBalances();
                            }}
                            _hover={{ 
                              bg: 'whiteAlpha.100',
                              color: 'brand.orange'
                            }}
                          />
                        </HStack>
                      </Box>
                      <Box
                        px={4}
                        py={2}
                        _hover={{ bg: 'whiteAlpha.100' }}
                        cursor="pointer"
                      >
                        <HStack justify="space-between" width="full">
                          <Text color="brand.orange" fontWeight="600">
                            {noccBalance} NOCC
                          </Text>
                          <IconButton
                            aria-label="Refresh NOCC balance"
                            icon={<Icon as={RefreshCw} />}
                            size="xs"
                            variant="ghost"
                            color="brand.orange"
                            isLoading={balanceLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshAllBalances();
                            }}
                            _hover={{ 
                              bg: 'whiteAlpha.100',
                              color: 'brand.orange'
                            }}
                          />
                        </HStack>
                      </Box>
                    </VStack>
                  </MenuList>
                </Menu>
              )}
            </HStack>
            <HStack spacing={2} justify={{ base: "flex-end", md: "flex-start" }} w={{ base: "full", md: "auto" }}>
              {stacksWalletData.isConnected ? (
                <>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={disconnectStacks}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={connectStacks}
                  isLoading={stacksLoading}
                >
                  Connect
                </Button>
              )}
            </HStack>
          </HStack>

          <Divider borderColor="whiteAlpha.200" />

          <HStack 
            spacing={4} 
            w="full" 
            justify="space-between" 
            py={4}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <HStack spacing={4} flex="1" minW={{ base: "full", md: "auto" }}>
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100">
                <Icon as={Wallet} color="brand.orange" boxSize={6} />
              </Box>
              <Box flex="1">
                <Text color="white" fontWeight="600">Rootstock Wallet</Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {rootstockWalletData.isConnected 
                    ? formatRootstockAddress(rootstockWalletData.address)
                    : 'Connect your Rootstock wallet'
                  }
                </Text>
              </Box>
              {rootstockWalletData.isConnected && (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    rightIcon={<ChevronDown />}
                    color="brand.orange"
                    _hover={{ 
                      bg: 'whiteAlpha.100',
                      color: 'brand.orange'
                    }}
                    _active={{
                      bg: 'whiteAlpha.100',
                      color: 'brand.orange'
                    }}
                    ml={2}
                  >
                    {rootstockBalanceLoading ? (
                      <Spinner size="xs" color="brand.orange" />
                    ) : (
                      'Balance'
                    )}
                  </MenuButton>
                  <MenuList
                    bg="brand.cardBg"
                    borderColor="whiteAlpha.200"
                    py={2}
                    borderRadius="lg"
                    boxShadow="xl"
                  >
                    <Box
                      px={4}
                      py={2}
                      _hover={{ bg: 'whiteAlpha.100' }}
                      cursor="pointer"
                    >
                      <HStack justify="space-between" width="full">
                        <Text color="brand.orange" fontWeight="600">
                          {rbtc} RBTC
                        </Text>
                        <IconButton
                          aria-label="Refresh RBTC balance"
                          icon={<Icon as={RefreshCw} />}
                          size="xs"
                          variant="ghost"
                          color="brand.orange"
                          isLoading={rootstockBalanceLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshRbtcBalance();
                          }}
                          _hover={{ 
                            bg: 'whiteAlpha.100',
                            color: 'brand.orange'
                          }}
                        />
                      </HStack>
                    </Box>
                  </MenuList>
                </Menu>
              )}
            </HStack>
            <HStack spacing={2} justify={{ base: "flex-end", md: "flex-start" }} w={{ base: "full", md: "auto" }}>
              {rootstockWalletData.isConnected ? (
                <>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={disconnectRootstock}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={connectRootstock}
                  isLoading={rootstockLoading}
                >
                  Connect
                </Button>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Deployments
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <HStack 
            spacing={4} 
            w="full" 
            justify="space-between" 
            py={4}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <HStack spacing={4} flex="1" minW={{ base: "full", md: "auto" }}>
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100">
                <Icon as={Rocket} color="brand.orange" boxSize={6} />
              </Box>
              <Box flex="1">
                <Text color="white" fontWeight="600">Vercel</Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {connectionData.isConnected 
                    ? `Connected as ${connectionData.username}`
                    : 'Connect your Vercel account'}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={2} justify={{ base: "flex-end", md: "flex-start" }} w={{ base: "full", md: "auto" }}>
              {connectionData.isConnected ? (
                <>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={disconnectVercel}
                    isLoading={vercelLoading}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={connectVercel}
                  isLoading={vercelLoading}
                >
                  Connect
                </Button>
              )}
            </HStack>
          </HStack>

          <Divider borderColor="whiteAlpha.200" />

          <HStack 
            spacing={4} 
            w="full" 
            justify="space-between" 
            py={4}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <HStack spacing={4} flex="1" minW={{ base: "full", md: "auto" }}>
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100">
                <Icon as={Github} color="brand.orange" boxSize={6} />
              </Box>
              <Box flex="1">
                <Text color="white" fontWeight="600">GitHub</Text>
                {githubConnection.isConnected ? (
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Connected as {githubConnection.username}
                  </Text>
                ) : (
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Connect your GitHub account
                  </Text>
                )}
              </Box>
            </HStack>
            <HStack spacing={2} justify={{ base: "flex-end", md: "flex-start" }} w={{ base: "full", md: "auto" }}>
              {githubConnection.isConnected ? (
                <>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={disconnectGithub}
                    isLoading={githubLoading}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={connectGithub}
                  isLoading={githubLoading}
                >
                  Connect
                </Button>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Text color="white" fontSize="lg" fontWeight="600" mb={4}>
          Database
        </Text>
        <VStack align="stretch" bg="whiteAlpha.50" borderRadius="xl" p={4}>
          <HStack 
            spacing={4} 
            w="full" 
            justify="space-between" 
            py={4}
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <HStack spacing={4} flex="1" minW={{ base: "full", md: "auto" }}>
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100">
                <Icon as={Database} color="brand.orange" boxSize={6} />
              </Box>
              <Box flex="1">
                <Text color="white" fontWeight="600">Supabase</Text>
                {supabaseData.isConnected ? (
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Connected to {supabaseData.orgName}
                  </Text>
                ) : (
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Connect your Supabase organization
                  </Text>
                )}
              </Box>
            </HStack>
            <HStack spacing={2} justify={{ base: "flex-end", md: "flex-start" }} w={{ base: "full", md: "auto" }}>
              {supabaseData.isConnected ? (
                <>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={disconnectSupabase}
                    isLoading={supabaseLoading}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  onClick={connectSupabase}
                  isLoading={supabaseLoading}
                >
                  Connect
                </Button>
              )}
            </HStack>
          </HStack>
          {supabaseData.isConnected && supabaseData.projects.length > 0 && (
            <VStack align="stretch" mt={4} pl={14}>
              <Text color="whiteAlpha.700" fontSize="sm" fontWeight="600" mb={2}>
                Projects
              </Text>
              {supabaseData.projects.map((project) => (
                <HStack key={project.id} spacing={3} py={2} px={4} bg="whiteAlpha.50" borderRadius="md">
                  <Box w={2} h={2} borderRadius="full" bg={
                    project.status === 'active' ? 'green.400' :
                    project.status === 'paused' ? 'yellow.400' :
                    'red.400'
                  } />
                  <Text color="white">{project.name}</Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {project.status}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
});

export default ConnectedApps; 