import { useState } from 'react';
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

// Dynamically import components to reduce initial bundle size
const ProfileInfo = dynamic(() => import('@/components/profile/ProfileInfo'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const ConnectedApps = dynamic(() => import('@/components/profile/ConnectedApps'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const BillingInfo = dynamic(() => import('@/components/profile/BillingInfo'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

const Settings = dynamic(() => import('@/components/profile/Settings'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false,
});

export default function Profile() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxW="container.lg" py={8}>
      <Box bg="brand.cardBg" borderRadius="xl" p={6}>
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
    </Container>
  );
} 