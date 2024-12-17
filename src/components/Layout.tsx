import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';
import { GradientBackground } from './Gradient';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box minH="100vh" position="relative" display="flex" flexDirection="column">
      <GradientBackground />
      <Navbar />
      {children}
      <Footer />
    </Box>
  );
} 