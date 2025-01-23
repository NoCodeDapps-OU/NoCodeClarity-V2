'use client';

import { Box, Container, VStack, Heading, Text, Input, Button, Grid, HStack, Icon, Select, Textarea, UnorderedList, ListItem, OrderedList } from '@chakra-ui/react';
import { Save, Play, Database as DbIcon } from 'lucide-react';
import { useState } from 'react';
import { GradientBackground } from '@/components/shared/Gradient';
import { useProtectedAction } from '@/hooks/useProtectedAction';
import AuthModal from '@/components/client/AuthModal';
import ClientOnly from '@/components/client/ClientOnly';
import PageLayout from '@/components/shared/PageLayout';

type TabType = 'database' | 'api';

export default function Backend() {
  const { handleProtectedAction, isAuthModalOpen, onAuthModalClose } = useProtectedAction();
  const [activeTab, setActiveTab] = useState<TabType>('api');

  const handleGenerateSchema = () => {
    handleProtectedAction(() => {
      console.log('Generating schema...');
    });
  };

  const handleCreateEndpoint = () => {
    handleProtectedAction(() => {
      console.log('Creating endpoint...');
    });
  };

  const handleSaveToGithub = () => {
    handleProtectedAction(() => {
      console.log('Saving to GitHub...');
    });
  };

  const handleDeploy = () => {
    handleProtectedAction(() => {
      console.log('Deploying...');
    });
  };

  const DatabaseView = () => (
    <VStack spacing={{ base: 4, md: 6 }}>
      <Box
        bg="brand.cardBg"
        borderRadius="lg"
        boxShadow="sm"
        p={{ base: 4, md: 6 }}
        w="full"
      >
        <VStack align="stretch" spacing={6}>
          <Box>
            <Text color="whiteAlpha.800" mb={2} fontSize="sm">
              Describe Your Database Schema
            </Text>
            <Textarea
              placeholder="Create a database schema for a blog with users, posts, and comments..."
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
              rows={4}
              mb={4}
            />
            <Button
              leftIcon={<Icon as={DbIcon} />}
              bg="brand.orange"
              color="white"
              _hover={{ bg: '#ff824d' }}
              size="lg"
              w="full"
              onClick={handleGenerateSchema}
            >
              Generate Database Schema
            </Button>
          </Box>
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
              Generated Schema
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
{`// Example Generated Schema
type User {
  id: String @id @default(uuid())
  email: String @unique
  name: String
  posts: Post[]
  comments: Comment[]
  createdAt: DateTime @default(now())
}

type Post {
  id: String @id @default(uuid())
  title: String
  content: String
  author: User @relation(fields: [authorId], references: [id])
  authorId: String
  comments: Comment[]
  createdAt: DateTime @default(now())
}`}
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
              Instructions & Details
            </Heading>
            <Box
              bg="whiteAlpha.50"
              borderRadius="md"
              p={{ base: 2, md: 4 }}
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.100"
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
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text color="white" fontWeight="600" mb={2}>
                    Schema Overview:
                  </Text>
                  <Text color="whiteAlpha.800">
                    This schema defines a blog database with User, Post, and Comment entities. Each entity has proper relationships and timestamps.
                  </Text>
                </Box>

                <Box>
                  <Text color="white" fontWeight="600" mb={2}>
                    Features:
                  </Text>
                  <UnorderedList color="whiteAlpha.800" spacing={2} pl={4}>
                    <ListItem>UUID-based primary keys for all entities</ListItem>
                    <ListItem>Proper foreign key relationships</ListItem>
                    <ListItem>Automatic timestamp tracking</ListItem>
                    <ListItem>Email uniqueness constraint for users</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Text color="white" fontWeight="600" mb={2}>
                    Next Steps:
                  </Text>
                  <OrderedList color="whiteAlpha.800" spacing={2} pl={4}>
                    <ListItem>Review the generated schema</ListItem>
                    <ListItem>Click "Connect Database" to set up your database</ListItem>
                    <ListItem>Use the API Builder to create endpoints for this schema</ListItem>
                    <ListItem>Deploy your backend when ready</ListItem>
                  </OrderedList>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  );

  return (
    <PageLayout
      isAuthModalOpen={isAuthModalOpen}
      onAuthModalClose={onAuthModalClose}
    >
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
                  Backend Builder
                </Heading>
                
                <HStack spacing={4} wrap="wrap">
                  <Button
                    leftIcon={<Icon as={DbIcon} />}
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    size={{ base: "md", md: "lg" }}
                    onClick={handleGenerateSchema}
                  >
                    Connect Database
                  </Button>
                  <Button
                    leftIcon={<Icon as={Save} />}
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    size={{ base: "md", md: "lg" }}
                    onClick={handleSaveToGithub}
                  >
                    Save Project
                  </Button>
                  <Button
                    leftIcon={<Icon as={Play} />}
                    bg="brand.orange"
                    color="white"
                    _hover={{ bg: '#ff824d' }}
                    size={{ base: "md", md: "lg" }}
                    onClick={handleDeploy}
                  >
                    Deploy Backend
                  </Button>
                </HStack>
              </HStack>

              <HStack spacing={4}>
                <Button
                  variant={activeTab === 'database' ? 'solid' : 'ghost'}
                  bg={activeTab === 'database' ? 'brand.orange' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: activeTab === 'database' ? '#ff824d' : 'whiteAlpha.200' }}
                  _active={{ bg: activeTab === 'database' ? '#ff824d' : 'whiteAlpha.300' }}
                  onClick={() => setActiveTab('database')}
                >
                  Database
                </Button>
                <Button
                  variant={activeTab === 'api' ? 'solid' : 'ghost'}
                  bg={activeTab === 'api' ? 'brand.orange' : 'whiteAlpha.100'}
                  color="white"
                  _hover={{ bg: activeTab === 'api' ? '#ff824d' : 'whiteAlpha.200' }}
                  _active={{ bg: activeTab === 'api' ? '#ff824d' : 'whiteAlpha.300' }}
                  onClick={() => setActiveTab('api')}
                >
                  API Builder
                </Button>
              </HStack>

              {activeTab === 'database' ? (
                <DatabaseView />
              ) : (
                <Grid
                  templateColumns={{ base: "1fr", lg: "1fr auto" }}
                  gap={6}
                >
                  <Box
                    bg="brand.cardBg"
                    borderRadius="lg"
                    boxShadow="sm"
                    p={{ base: 4, md: 6 }}
                  >
                    <VStack align="stretch" spacing={6}>
                      <Heading size="md" color="white" mb={2}>
                        API Endpoint Builder
                      </Heading>
                      
                      <Box>
                        <Text color="whiteAlpha.800" mb={2} fontSize="sm">
                          Endpoint Path
                        </Text>
                        <Input
                          placeholder="/api/v1/resource"
                          bg="whiteAlpha.50"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _hover={{ borderColor: "whiteAlpha.300" }}
                          _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                        />
                      </Box>

                      <Box>
                        <Text color="whiteAlpha.800" mb={2} fontSize="sm">
                          HTTP Method
                        </Text>
                        <Select
                          bg="whiteAlpha.50"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _hover={{ borderColor: "whiteAlpha.300" }}
                          _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </Select>
                      </Box>

                      <Box>
                        <Text color="whiteAlpha.800" mb={2} fontSize="sm">
                          Description
                        </Text>
                        <Textarea
                          placeholder="Describe what this endpoint does..."
                          bg="whiteAlpha.50"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _hover={{ borderColor: "whiteAlpha.300" }}
                          _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
                          rows={4}
                        />
                      </Box>

                      <Button
                        bg="brand.orange"
                        color="white"
                        _hover={{ bg: '#ff824d' }}
                        size="lg"
                        w="full"
                        onClick={handleCreateEndpoint}
                      >
                        Create Endpoint
                      </Button>
                    </VStack>
                  </Box>

                  <Box
                    bg="brand.cardBg"
                    borderRadius="lg"
                    boxShadow="sm"
                    p={{ base: 4, md: 6 }}
                    minW={{ lg: "400px" }}
                  >
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md" color="white">
                        API Endpoints
                      </Heading>
                      
                      <Box
                        bg="whiteAlpha.50"
                        borderRadius="md"
                        p={8}
                        minH="200px"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        border="1px dashed"
                        borderColor="whiteAlpha.200"
                      >
                        <Text color="whiteAlpha.800" fontSize="sm">
                          No endpoints created yet
                        </Text>
                        <Text color="whiteAlpha.600" fontSize="xs" mt={2}>
                          Use the API Builder to create endpoints
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </Grid>
              )}
            </VStack>
          </Container>
        </Box>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={onAuthModalClose}
        />
      </Box>
    </PageLayout>
  );
} 