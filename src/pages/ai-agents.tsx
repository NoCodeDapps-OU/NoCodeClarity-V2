import { Box, Container, VStack, Heading, Text, Textarea, Select, Button, HStack, Icon } from '@chakra-ui/react';
import { Bot, Save } from 'lucide-react';
import { useState } from 'react';
import { GradientBackground } from '../components/Gradient';

export default function AIAgents() {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
      <GradientBackground />
      
      
      <Box py={{ base: 4, md: 8 }} flex="1" position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backdropFilter="blur(8px)"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={10}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={4}
        >
          <Heading
            color="brand.orange"
            fontSize={{ base: "4xl", md: "4xl" }}
            textAlign="center"
            fontWeight="900"
          >
            In Development
          </Heading>
          <Text
            color="whiteAlpha.800"
            fontSize={{ base: "lg", md: "xl" }}
            textAlign="center"
            maxW="container.sm"
            fontWeight="600"
          >
            Will be released in V3
          </Text>
        </Box>

        <Container maxW="1440px" px={{ base: 3, md: 8, lg: 12 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <Heading 
              fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
              color="white"
              fontWeight="900"
            >
              AI Agent Builder
            </Heading>

            <Box
              bg="brand.cardBg"
              borderRadius="lg"
              boxShadow="sm"
              p={{ base: 3, md: 6 }}
            >
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <HStack spacing={2}>
                  <Icon as={Bot} color="brand.orange" />
                  <Text color="white" fontWeight="600" fontSize={{ base: "md", md: "lg" }}>
                    AI Dapp Generator
                  </Text>
                </HStack>

                <Box>
                  <Text color="whiteAlpha.800" mb={2} fontSize={{ base: "sm", md: "md" }}>
                    Describe Your Dapp
                  </Text>
                  <Textarea
                    placeholder="Create a decentralized Twitter on Stacks"
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _hover={{ borderColor: "whiteAlpha.300" }}
                    _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                    rows={4}
                    fontSize={{ base: "sm", md: "md" }}
                  />
                </Box>

                <Box>
                  <Text color="whiteAlpha.800" mb={2} fontSize={{ base: "sm", md: "md" }}>
                    Target Blockchain
                  </Text>
                  <Select
                    defaultValue="stacks"
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _hover={{ borderColor: "whiteAlpha.300" }}
                    _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    <option value="stacks">Stacks</option>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="ethereum">Ethereum</option>
                  </Select>
                </Box>

                {isGenerating ? (
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="whiteAlpha.50"
                  >
                    <VStack spacing={4} align="stretch">
                      <Text color="white" fontWeight="600" fontSize={{ base: "sm", md: "md" }}>
                        Generation Progress
                      </Text>
                      <VStack spacing={3} align="stretch">
                        <HStack spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg="green.400" />
                          <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                            Analyzing requirements...
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg="brand.orange" />
                          <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                            Generating smart contracts...
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Box w={2} h={2} borderRadius="full" bg="whiteAlpha.400" />
                          <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                            Building frontend...
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                ) : (
                  <Button
                    bg="brand.orange"
                    color="white"
                    _hover={{ bg: '#ff824d' }}
                    size={{ base: "md", md: "lg" }}
                    w="full"
                    onClick={() => setIsGenerating(true)}
                  >
                    Generate Dapp
                  </Button>
                )}
              </VStack>
            </Box>

            <HStack justify="flex-end" spacing={4} mt={{ base: 2, md: 4 }}>
              <Button
                leftIcon={<Icon as={Save} />}
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.100' }}
                size={{ base: "md", md: "lg" }}
              >
                Save to GitHub
              </Button>
              <Button
                bg="brand.orange"
                color="white"
                _hover={{ bg: '#ff824d' }}
                size={{ base: "md", md: "lg" }}
              >
                Deploy Contract
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
} 