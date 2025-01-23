import { Box, Avatar, VStack, Text } from '@chakra-ui/react';

interface ProfileBannerProps {
  user: {
    email: string;
    name?: string;
  };
}

export default function ProfileBanner({ user }: ProfileBannerProps) {
  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Box position="relative" mb={6}>
      {/* Banner */}
      <Box
        h="200px"
        bg="brand.cardBg"
        borderRadius="xl"
        overflow="hidden"
        position="relative"
      >
        {/* NOCC Logo as background */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          opacity={0.1}
        >
          <img src="/nocc-logo.png" alt="NOCC" width="200px" />
        </Box>
      </Box>

      {/* Avatar */}
      <Avatar
        size="xl"
        name={getInitial(user.email)}
        bg="brand.orange"
        color="white"
        position="absolute"
        bottom="-30px"
        left="50%"
        transform="translateX(-50%)"
        border="4px solid"
        borderColor="brand.cardBg"
      />
    </Box>
  );
}