import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthState, getPostLoginRedirect } from '@/lib/sso';
import Link from 'next/link';
import LoginForm from './login-form';

export default async function LoginPage() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  if (authState?.user) {
    redirect(getPostLoginRedirect(authState.user));
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
          <div className="bg-gradient-to-br from-soft-bg to-white p-10">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Taxindo Prime Consulting</p>
              <h1 className="text-3xl font-semibold text-text-dark">
                Masuk ke TPC AI
              </h1>
              <p className="text-sm text-text-dark/70">
                Akses semua fitur TPC AI dengan satu akun. Login sekali untuk melihat plan, penggunaan, dan layanan yang tersedia.
              </p>
              <div className="rounded-2xl border border-primary/20 bg-white/80 p-5">
                <p className="text-sm text-text-dark/80">
                  Sistem login terpusat memastikan akses Anda aman di seluruh aplikasi Taxindo.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 p-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-text-dark">Login</h2>
              <p className="text-sm text-text-dark/70">
                Gunakan email dan password Anda untuk melanjutkan.
              </p>
            </div>
            <LoginForm />
            <p className="text-xs text-text-dark/60">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-primary hover:text-secondary">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
