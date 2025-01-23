import { Metadata } from 'next';

export const getMetadata = (pathname: string): Metadata => {
  const baseTitle = 'NoCodeClarity';
  const baseDescription = 'NoCodeClarity - Web3 Development Platform';

  const titles: { [key: string]: string } = {
    '/': baseTitle,
    '/frontend': 'NOCC | Frontend',
    '/backend': 'NOCC | Backend',
    '/smart-contracts': 'NOCC | Smart Contracts',
    '/ai-agents': 'NOCC | AI Agents',
    '/profile': 'NOCC | Profile',
  };

  return {
    title: titles[pathname] || baseTitle,
    description: baseDescription,
    icons: {
      icon: '/nocc-logo.png',
    },
  };
}; 