import { Metadata } from 'next';
import { Providers } from '@/providers/Providers';

export const metadata: Metadata = {
  title: 'NoCodeClarity',
  description: 'NoCodeClarity - Web3 Development Platform',
  icons: {
    icon: '/nocc-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/nocc-logo.png" type="image/x-icon" />
        <link rel="shortcut icon" href="/nocc-logo.png" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
