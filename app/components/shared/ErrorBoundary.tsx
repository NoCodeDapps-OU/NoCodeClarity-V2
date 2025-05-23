'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    if (
      error.message.includes('NextRouter was not mounted') ||
      error.message.includes('useSupabase')
    ) {
      console.warn('Client-side error caught:', error);
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      !error.message.includes('NextRouter was not mounted') &&
      !error.message.includes('useSupabase')
    ) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          p={8}
          textAlign="center"
          bg="brand.cardBg"
          borderRadius="xl"
          m={4}
        >
          <Text color="white" fontSize="xl" mb={4}>
            Something went wrong
          </Text>
          <Button
            onClick={this.handleReset}
            colorScheme="orange"
            size="lg"
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 