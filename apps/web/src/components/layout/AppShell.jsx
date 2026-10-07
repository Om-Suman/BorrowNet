import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';
  const isFullBleed = location.pathname === '/' || isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-textPrimary font-body">
      <Navbar />
      <main className={isFullBleed ? "flex-grow w-full flex flex-col" : "flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
