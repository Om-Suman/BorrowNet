import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-borderSubtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                Borrow<span className="text-accent">Net</span>
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/browse" className="text-textSecondary hover:text-textPrimary inline-flex items-center px-1 pt-1 font-medium transition-colors">
                Browse
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-textSecondary">
                  <div className="w-8 h-8 rounded-full bg-surfaceElevated flex items-center justify-center border border-borderSubtle">
                    <User className="w-4 h-4" />
                  </div>
                  <span>{user?.name}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="text-danger hover:text-red-500 hover:bg-danger/10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-borderSubtle">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/browse" className="block pl-3 pr-4 py-2 text-base font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated" onClick={() => setMobileMenuOpen(false)}>
              Browse
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block pl-3 pr-4 py-2 text-base font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-danger hover:bg-surfaceElevated">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block pl-3 pr-4 py-2 text-base font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="block pl-3 pr-4 py-2 text-base font-medium text-accent hover:bg-surfaceElevated" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
