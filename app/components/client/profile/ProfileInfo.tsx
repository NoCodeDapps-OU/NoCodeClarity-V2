'use client';

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
import { useUserStore } from '@/stores/userStore';
import { useSupabase } from '@/providers/SupabaseProvider';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function ProfileInfo() {
  const { profile, updateProfileSection } = useUserStore();
  const { user } = useSupabase(); // Get user from Supabase context
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    email: profile?.email || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const supabase = createClientComponentClient<Database>();

  // Use cached data if available and recent
  useEffect(() => {
    if (profile && profile.profileData?.lastUpdated) {
      const isStale = Date.now() - profile.profileData.lastUpdated > CACHE_DURATION;
      if (!isStale) {
        setUserData({
          name: profile.name || '',
          username: profile.username || '',
          email: profile.email || '',
        });
      }
    }
  }, [profile]);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        throw new Error('No user found');
      }

      // Update profile in database
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          username: userData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Update local cache
      updateProfileSection({
        name: userData.name,
        username: userData.username,
      });

      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
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