import { Box, Container, Text, HStack, Link, Icon } from '@chakra-ui/react';
import { Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <Box 
      as="footer" 
      bg="brand.cardBg"
      borderTop="1px" 
      borderColor="whiteAlpha.200"
      py={6}
      mt="auto"
    >
      <Container maxW="1440px" px={{ base: 4, md: 8, lg: 12 }}>
        <HStack 
          justify={{ base: "center", sm: "space-between" }} 
          align="center"
          flexDir={{ base: "column", sm: "row" }}
          spacing={{ base: 4, sm: 0 }}
        >
          <Text color="whiteAlpha.800" fontSize="sm" textAlign={{ base: "center", sm: "left" }}>
            © {new Date().getFullYear()} NOCC Deployer. All rights reserved.
          </Text>
          
          <HStack spacing={4}>
            <Link 
              href="https://github.com/NoCodeClarity-OU" 
              isExternal
              color="whiteAlpha.800"
              _hover={{ color: "white" }}
            >
              <Icon as={Github} boxSize={5} />
            </Link>
            <Link 
              href="https://x.com/nocodeclarity" 
              isExternal
              color="whiteAlpha.800"
              _hover={{ color: "white" }}
            >
              <Icon as={Twitter} boxSize={5} />
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}