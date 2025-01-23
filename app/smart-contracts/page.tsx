'use client';

import { Box, Container, VStack, Heading, HStack, Button, Icon, Text, Select, Textarea } from '@chakra-ui/react';
import { Save, Play, Code, Wand2, Bot } from 'lucide-react';
import { useState } from 'react';
import { GradientBackground } from '@/components/shared/Gradient';
import { useProtectedAction } from '@/hooks/useProtectedAction';
import AuthModal from '@/components/client/AuthModal';
import ClientOnly from '@/components/client/ClientOnly';

type EditorLanguage = 'clarity' | 'solidity' | 'rust';
type ViewMode = 'code' | 'ai';

export default function SmartContracts() {
  const { handleProtectedAction, isAuthModalOpen, onAuthModalClose } = useProtectedAction();
  const [activeLanguage, setActiveLanguage] = useState<EditorLanguage>('clarity');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveToGithub = () => {
    handleProtectedAction(() => {
      console.log('Saving to GitHub...');
    });
  };

  const handleDeployContract = () => {
    handleProtectedAction(() => {
      console.log('Deploying contract...');
    });
  };

  const handleCreateEndpoint = () => {
    handleProtectedAction(() => {
      console.log('Creating endpoint...');
    });
  };

  const handleGenerateContract = () => {
    handleProtectedAction(() => {
      console.log('Generating contract...');
    });
  };

  const AIContractGenerator = () => (
    <Box
      bg="brand.cardBg"
      borderRadius="lg"
      boxShadow="sm"
      p={{ base: 4, md: 6 }}
    >
      <VStack spacing={6} align="stretch">
        <HStack spacing={2}>
          <Icon as={Bot} color="brand.orange" />
          <Text color="white" fontWeight="600">
            AI Contract Generator
          </Text>
          <HStack spacing={4} ml="auto">
            <Button
              leftIcon={<Icon as={Code} />}
              variant="ghost"
              color="whiteAlpha.800"
              bg="whiteAlpha.100"
              _hover={{ bg: 'whiteAlpha.200' }}
              size="sm"
              onClick={() => setViewMode('code')}
            >
              Code
            </Button>
            <Button
              leftIcon={<Icon as={Wand2} />}
              bg="brand.orange"
              color="white"
              _hover={{ bg: '#ff824d' }}
              size="sm"
            >
              AI Prompt
            </Button>
          </HStack>
        </HStack>

        <VStack spacing={4} align="stretch">
          <Box>
            <Text color="whiteAlpha.800" mb={2} fontSize="sm">
              Contract Type
            </Text>
            <Select
              defaultValue="custom"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            >
              <option value="custom">Custom Contract</option>
              <option value="token">Token Contract</option>
              <option value="nft">NFT Contract</option>
              <option value="dao">DAO Contract</option>
            </Select>
          </Box>

          <Box>
            <Text color="whiteAlpha.800" mb={2} fontSize="sm">
              Smart Contract Language
            </Text>
            <Select
              defaultValue="clarity"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            >
              <option value="clarity">Clarity (Stacks)</option>
              <option value="solidity">Solidity (Ethereum)</option>
              <option value="rust">Rust (Solana)</option>
            </Select>
          </Box>

          <Box>
            <Text color="whiteAlpha.800" mb={2} fontSize="sm">
              Describe Your Smart Contract
            </Text>
            <Textarea
              placeholder="Create a token vesting contract"
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
              rows={4}
              mb={4}
            />
          </Box>

          {isGenerating ? (
            <Box
              p={4}
              borderRadius="md"
              bg="whiteAlpha.50"
            >
              <HStack spacing={3}>
                <Box w={2} h={2} borderRadius="full" bg="brand.orange" />
                <Text color="whiteAlpha.800" fontSize="sm">
                  AI is analyzing your requirements and generating the smart contract...
                </Text>
              </HStack>
            </Box>
          ) : (
            <Button
              bg="brand.orange"
              color="white"
              _hover={{ bg: '#ff824d' }}
              size="lg"
              w="full"
              onClick={handleGenerateContract}
            >
              Generate Contract
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );

  const CodeEditor = () => (
    <Box
      bg="brand.cardBg"
      borderRadius="lg"
      boxShadow="sm"
      p={{ base: 4, md: 6 }}
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <HStack spacing={2}>
            <Icon as={Code} color="brand.orange" />
            <Text color="white" fontWeight="600">
              Code Editor
            </Text>
          </HStack>

          <HStack spacing={4} ml="auto">
            <Button
              leftIcon={<Icon as={Wand2} />}
              bg={viewMode === 'ai' ? 'brand.orange' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: viewMode === 'ai' ? '#ff824d' : 'whiteAlpha.200' }}
              size="sm"
              onClick={() => setViewMode('ai')}
            >
              AI Prompt
            </Button>
            <Button
              variant={activeLanguage === 'clarity' ? 'solid' : 'ghost'}
              bg={activeLanguage === 'clarity' ? 'brand.orange' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: activeLanguage === 'clarity' ? '#ff824d' : 'whiteAlpha.200' }}
              onClick={() => setActiveLanguage('clarity')}
              size="sm"
            >
              Clarity
            </Button>
            <Button
              variant={activeLanguage === 'solidity' ? 'solid' : 'ghost'}
              bg={activeLanguage === 'solidity' ? 'brand.orange' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: activeLanguage === 'solidity' ? '#ff824d' : 'whiteAlpha.200' }}
              onClick={() => setActiveLanguage('solidity')}
              size="sm"
            >
              Solidity
            </Button>
            <Button
              variant={activeLanguage === 'rust' ? 'solid' : 'ghost'}
              bg={activeLanguage === 'rust' ? 'brand.orange' : 'whiteAlpha.100'}
              color="white"
              _hover={{ bg: activeLanguage === 'rust' ? '#ff824d' : 'whiteAlpha.200' }}
              onClick={() => setActiveLanguage('rust')}
              size="sm"
            >
              Rust
            </Button>
          </HStack>
        </HStack>

        <Box
          bg="gray.900"
          borderRadius="md"
          p={4}
          fontFamily="mono"
          fontSize="sm"
          color="gray.100"
          minH={{ base: "400px", md: "500px" }}
          overflowX="auto"
          position="relative"
        >
          <Box position="absolute" left={4} top={4} opacity={0.5}>
            1
            <br />
            2
            <br />
            3
            <br />
            4
            <br />
            5
            <br />
            6
            <br />
            7
          </Box>
          <Box pl={8} color="whiteAlpha.900">
            <pre>
{`define-public (transfer (amount uint) (recipient principal))
  (let ((sender tx-sender))
    (if (>= (stx-get-balance sender) amount)
      (begin
        (stx-transfer? amount sender recipient)
        (ok true))
      (err u1)))`}
            </pre>
          </Box>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <ClientOnly>
      <Box minH="100vh" display="flex" flexDirection="column" position="relative">
        <GradientBackground />
        
        <Box py={8} flex="1">
          <Container maxW="1440px" px={{ base: 4, md: 8, lg: 12 }}>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
                <Heading 
                  fontSize={{ base: "2xl", md: "3xl" }} 
                  color="white"
                  fontWeight="900"
                >
                  Smart Contract Builder
                </Heading>
                
                <HStack spacing={4} wrap="wrap">
                  <Button
                    leftIcon={<Icon as={Save} />}
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    size={{ base: "md", md: "lg" }}
                    onClick={handleSaveToGithub}
                  >
                    Save to GitHub
                  </Button>
                  <Button
                    leftIcon={<Icon as={Play} />}
                    bg="brand.orange"
                    color="white"
                    _hover={{ bg: '#ff824d' }}
                    size={{ base: "md", md: "lg" }}
                    onClick={handleDeployContract}
                  >
                    Deploy Contract
                  </Button>
                  <Button
                    onClick={handleCreateEndpoint}
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    size={{ base: "md", md: "lg" }}
                  >
                    Create Endpoint
                  </Button>
                </HStack>
              </HStack>

              {viewMode === 'ai' ? <AIContractGenerator /> : <CodeEditor />}
            </VStack>
          </Container>
        </Box>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={onAuthModalClose}
        />
      </Box>
    </ClientOnly>
  );
}