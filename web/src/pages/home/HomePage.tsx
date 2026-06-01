import { Header } from '@/widgets/Header/Header';
import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';

export function HomePage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24">
        <h1 className="text-2xl font-semibold">Главная</h1>
      </main>

      <MainNavigation placement="mobileBottom" />
    </>
  );
}