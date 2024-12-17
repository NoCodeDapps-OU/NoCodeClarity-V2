import { Box, Container, VStack, Heading, Text, Input, Button, Grid, HStack, Icon } from '@chakra-ui/react';
import { Wand2, Save, Rocket } from 'lucide-react';
import { GradientBackground } from '../components/Gradient';

export default function Frontend() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
      <GradientBackground />
      
      <Box py={{ base: 4, md: 8 }} flex="1">
        <Container maxW="1440px" px={{ base: 3, md: 8, lg: 12 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
              <Heading 
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                color="white"
                fontWeight="900"
              >
                Frontend Builder
              </Heading>
              
              <HStack spacing={4} wrap="wrap">
                <Button
                  leftIcon={<Icon as={Save} />}
                  variant="outline"
                  color="white"
                  borderColor="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  size={{ base: "md", md: "lg" }}
                >
                  Save Project
                </Button>
                <Button
                  leftIcon={<Icon as={Rocket} />}
                  bg="brand.orange"
                  color="white"
                  _hover={{ bg: '#ff824d' }}
                  size={{ base: "md", md: "lg" }}
                >
                  Deploy on Vercel
                </Button>
              </HStack>
            </HStack>

            <Box
              bg="brand.cardBg"
              borderRadius="lg"
              boxShadow="sm"
              p={{ base: 3, md: 6 }}
            >
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                  Create a Bitcoin blog that requires readers to sign in with their Bitcoin wallet
                </Text>
                
                <Input
                  placeholder="Enter your prompt here..."
                  size={{ base: "md", md: "lg" }}
                  bg="whiteAlpha.50"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: "whiteAlpha.300" }}
                  _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                />

                <Button
                  leftIcon={<Icon as={Wand2} />}
                  bg="brand.orange"
                  color="white"
                  size={{ base: "md", md: "lg" }}
                  _hover={{ bg: '#ff824d' }}
                  fontWeight="700"
                  alignSelf={{ base: "stretch", md: "flex-end" }}
                >
                  Generate
                </Button>
              </VStack>
            </Box>

            <VStack spacing={{ base: 4, md: 6 }}>
              <Box
                bg="brand.cardBg"
                borderRadius="lg"
                boxShadow="sm"
                p={{ base: 3, md: 6 }}
                w="full"
              >
                <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                  <Heading size={{ base: "sm", md: "md" }} color="white">
                    Code Editor
                  </Heading>
                  <Box
                    bg="gray.900"
                    borderRadius="md"
                    p={{ base: 2, md: 4 }}
                    fontFamily="mono"
                    fontSize={{ base: "xs", md: "sm" }}
                    color="gray.100"
                    minH={{ base: "200px", md: "300px", lg: "400px" }}
                    overflowX="auto"
                    overflowY="auto"
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'whiteAlpha.100',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'whiteAlpha.300',
                        borderRadius: '8px',
                      },
                    }}
                  >
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900">Generated UI</h1>
      <p class="mt-4 text-gray-600">This is a placeholder implementation...</p>
    </div>
  </div>
</body>
</html>`}
                    </pre>
                  </Box>
                </VStack>
              </Box>

              <Box
                bg="brand.cardBg"
                borderRadius="lg"
                boxShadow="sm"
                p={{ base: 3, md: 6 }}
                w="full"
              >
                <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                  <Heading size={{ base: "sm", md: "md" }} color="white">
                    Live Preview
                  </Heading>
                  <Box
                    borderRadius="md"
                    border="1px"
                    borderColor="whiteAlpha.200"
                    p={{ base: 2, md: 4 }}
                    minH={{ base: "200px", md: "300px", lg: "400px" }}
                    overflowY="auto"
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'whiteAlpha.100',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'whiteAlpha.300',
                        borderRadius: '8px',
                      },
                    }}
                  >
                    <Heading size={{ base: "md", lg: "lg" }} color="white" mb={{ base: 2, md: 4 }}>
                      Generated UI
                    </Heading>
                    <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }}>
                      This is a placeholder implementation. The AI-powered generation will be implemented soon.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}