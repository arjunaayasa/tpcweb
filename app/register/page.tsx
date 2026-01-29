import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthState, getPostLoginRedirect } from '@/lib/sso';
import RegisterForm from '@/app/login/register-form';

export default async function RegisterPage() {
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
                Buat Akun TPC AI
              </h1>
              <p className="text-sm text-text-dark/70">
                Daftar untuk mengakses fitur Owlie Chat, Tax Knowledge AI, dan Studio AI.
              </p>
              <div className="rounded-2xl border border-primary/20 bg-white/80 p-5">
                <p className="text-sm text-text-dark/80">
                  Registrasi cepat dan aman untuk semua layanan TPC AI.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 p-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-text-dark">Daftar</h2>
              <p className="text-sm text-text-dark/70">
                Lengkapi data singkat untuk membuat akun baru.
              </p>
            </div>
            <RegisterForm />
            <p className="text-xs text-text-dark/60">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-secondary">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
