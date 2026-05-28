import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import CompareDrawer from '@/components/CompareDrawer';
import CommandPalette from '@/components/CommandPalette';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CollegeHub - Premium College Discovery & Comparison',
  description: 'Find top universities, search courses, check annual fees, package placements, reviews, and compare colleges side-by-side.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-[#F5F5F5] font-sans">
        <AppProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <CompareDrawer />
          <CommandPalette />
          
          {/* Footer */}
          <footer className="border-t border-[#2A2A40] bg-[#151521]/60 py-8 text-center text-sm text-[#B0B0C0] mt-auto pb-24 md:pb-8 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p>&copy; {new Date().getFullYear()} CollegeHub. All rights reserved. Created for Assignment Showcase.</p>
              <p className="mt-2 text-xs text-[#B0B0C0]/60">
                Built with Next.js App Router, TypeScript, TailwindCSS, Prisma, and PostgreSQL.
              </p>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
