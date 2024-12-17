import { Box, BoxProps } from '@chakra-ui/react';

export const GradientBackground = (props: BoxProps) => (
  <Box
    position="relative"
    {...props}
    _before={{
      content: '""',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '200%',
      height: '200%',
      background: `
        radial-gradient(circle at center, 
          rgba(66, 224, 245, 0.3) 0%,
          rgba(66, 224, 245, 0) 50%
        ),
        radial-gradient(circle at center, 
          rgba(106, 13, 173, 0.4) 0%,
          rgba(106, 13, 173, 0) 60%
        )
      `,
      filter: 'blur(60px)',
      animation: 'blob 15s ease-in-out infinite',
      zIndex: -1,
      transform: 'translate(-25%, -25%)',
      pointerEvents: 'none',
    }}
    _after={{
      content: '""',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '200%',
      height: '200%',
      background: `
        radial-gradient(circle at center, 
          rgba(66, 224, 245, 0.3) 0%,
          rgba(66, 224, 245, 0) 50%
        ),
        radial-gradient(circle at center, 
          rgba(106, 13, 173, 0.4) 0%,
          rgba(106, 13, 173, 0) 60%
        )
      `,
      filter: 'blur(60px)',
      animation: 'blob 20s ease-in-out infinite reverse',
      zIndex: -1,
      transform: 'translate(25%, 25%)',
      pointerEvents: 'none',
    }}
  />
); 