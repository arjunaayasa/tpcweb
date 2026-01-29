'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AvatarEditorProps {
  initialAvatarUrl?: string | null;
}

export default function AvatarEditor({ initialAvatarUrl }: AvatarEditorProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateAvatar = async () => {
    try {
      setIsLoading(true);
      // Generate a random seed for the new avatar
      const seed = Math.random().toString(36).substring(7);
      
      const res = await fetch('/api/me/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seed }),
      });

      if (!res.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      router.refresh(); // Refresh server components to update avatar elsewhere
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Gagal memperbarui foto profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Default fallback if no avatar URL is provided
  const displayUrl = avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=default`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-xl">
        <Image
          src={displayUrl}
          alt="Profile Avatar"
          fill
          className="object-cover"
          unoptimized // DiceBear avatars are SVGs/external
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>
      
      <button
        onClick={handleUpdateAvatar}
        disabled={isLoading}
        className="text-xs font-semibold text-white/80 transition hover:text-white hover:underline disabled:opacity-50"
      >
        {isLoading ? 'Memproses...' : 'Ganti Foto'}
      </button>
    </div>
  );
}
