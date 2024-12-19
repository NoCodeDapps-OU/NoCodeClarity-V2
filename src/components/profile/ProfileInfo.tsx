import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Grid,
  GridItem,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

export default function ProfileInfo() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get existing user data
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setUserData({
            name: data.name || '',
            username: data.username || '',
            email: user.email || '',
          });
        } else if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Update other user data
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          username: userData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Name</FormLabel>
            <Input
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>
        
        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Username</FormLabel>
            <Input
              value={userData.username}
              onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Email</FormLabel>
            <Input
              value={userData.email}
              isReadOnly
              bg="whiteAlpha.50"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel color="whiteAlpha.900">Password</FormLabel>
            <InputGroup>
              <Input
                type="password"
                value="••••••••"
                isReadOnly
                bg="whiteAlpha.50"
                borderColor="whiteAlpha.200"
                color="white"
                _hover={{ borderColor: "whiteAlpha.300" }}
                _focus={{ borderColor: "brand.orange", boxShadow: "0 0 0 1px #FFA500" }}
              />
              <InputRightElement>
                <Tooltip 
                  label="For security reasons, passwords cannot be viewed. Please use the Settings tab to change your password." 
                  placement="top"
                  bg="gray.700"
                  color="white"
                  hasArrow
                >
                  <IconButton
                    aria-label="Password protected"
                    icon={<FaLock />}
                    variant="ghost"
                    color="whiteAlpha.700"
                    _hover={{ bg: 'transparent', color: 'white' }}
                    onClick={() => {
                      toast({
                        title: "Password Protected",
                        description: "For security reasons, passwords cannot be viewed. Please use the Settings tab to change your password.",
                        status: "info",
                        duration: 5000,
                        isClosable: true,
                      });
                    }}
                  />
                </Tooltip>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
      </Grid>

      <Button
        bg="brand.orange"
        color="white"
        _hover={{ bg: '#ff824d' }}
        alignSelf="flex-end"
        onClick={handleSaveChanges}
        isLoading={loading}
      >
        Save Changes
      </Button>
    </VStack>
  );
} 