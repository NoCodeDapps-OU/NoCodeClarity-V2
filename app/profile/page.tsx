'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Skeleton,
  VStack,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import ProfileBanner from '@/components/server/ProfileBanner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/database.types';
import ClientOnly from '@/components/client/ClientOnly';
import { useSupabase } from '@/providers/SupabaseProvider';

// Dynamically import components to reduce initial bundle size
const ProfileInfo = dynamic(() => import('../components/client/profile/ProfileInfo'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const ConnectedApps = dynamic(() => import('../components/client/profile/ConnectedApps'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const BillingInfo = dynamic(() => import('../components/client/profile/BillingInfo'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const Settings = dynamic(() => import('../components/client/profile/Settings'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/');
          return;
        }

        setUserData({
          email: user.email || '',
          name: user.user_metadata?.name || '',
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        router.push('/');
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <Container maxW="1440px" px={{ base: 4, md: 8, lg: 12 }} py={8}>
        <Skeleton height="200px" />
      </Container>
    );
  }

  return (
    <ClientOnly>
      <Container maxW="container.lg" py={8}>
        <Box bg="brand.cardBg" borderRadius="xl" overflow="hidden">
          <ProfileBanner user={userData} />
          <Box p={6}>
            <Tabs
              variant="soft-rounded"
              colorScheme="orange"
              index={tabIndex}
              onChange={setTabIndex}
              isLazy
            >
              <TabList mb={6}>
                <Tab color="white" _selected={{ bg: 'brand.orange' }}>Profile</Tab>
                <Tab color="white" _selected={{ bg: 'brand.orange' }}>Connected Apps</Tab>
                <Tab color="white" _selected={{ bg: 'brand.orange' }}>Billing</Tab>
                <Tab color="white" _selected={{ bg: 'brand.orange' }}>Settings</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <ProfileInfo />
                </TabPanel>
                <TabPanel p={0}>
                  <ConnectedApps />
                </TabPanel>
                <TabPanel p={0}>
                  <BillingInfo />
                </TabPanel>
                <TabPanel p={0}>
                  <Settings />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Container>
    </ClientOnly>
  );
} 