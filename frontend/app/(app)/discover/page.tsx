'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { MOCK_ANIME } from '@/lib/mock/anime';
import { AppHeader, HeaderButton } from '@/components/layout/AppHeader';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#04050e' }}>
      <AppHeader
        subtitle="Discover Anime"
        rightActions={
          <div className="flex gap-2">
            <Link href="/chat/select">
              <HeaderButton variant="outline">Chat</HeaderButton>
            </Link>
            <HeaderButton variant="outline" onClick={handleSignOut}>Sign Out</HeaderButton>
          </div>
        }
      />

      <main className="max-w-[1146px] mx-auto py-12 px-6">
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Popular Recommendations
          </h2>
          <p className="text-lg text-[#85868b] max-w-2xl">
            Explore top-rated anime curated by our AI sommelier
          </p>
        </div>

        <div className="animate-fade-in">
          <AnimeGrid animes={MOCK_ANIME} />
        </div>
      </main>
    </div>
  );
}
