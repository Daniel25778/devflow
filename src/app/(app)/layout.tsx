import AppNav from '@/components/AppNav';
import { requireUser } from '@/lib/auth-guards';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
