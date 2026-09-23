import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-canvas border-b border-borderSubtle">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center space-x-10 sm:space-x-14">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="font-display font-light text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-textPrimary leading-none select-none">
                Borrow
                <span className="font-semibold text-black dark:text-white">
                  Net
                </span>
              </span>
            </Link>
            <nav className="hidden md:flex md:items-center">
              <Link to="/browse">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex items-center gap-2.5 text-base sm:text-lg px-6 py-2.5 rounded-full border border-borderSubtle shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600"
                >
                  <Search className="w-5 h-5 text-textSecondary" />
                  <span>Browse Equipment</span>
                </Button>
              </Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-5">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex items-center gap-2.5 text-sm sm:text-base px-5 py-2.5"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-surface border border-borderSubtle shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border border-borderSubtle text-textPrimary overflow-hidden font-medium text-sm">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-textSecondary" />
                    )}
                  </div>
                  <span className="font-medium text-sm sm:text-base text-textPrimary max-w-[140px] truncate">
                    {user?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface border border-borderSubtle hover:border-red-300 dark:hover:border-red-900/60 flex items-center justify-center text-textSecondary hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-950/30 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 shrink-0"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="sr-only">Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3.5">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="md"
                    className="text-base px-6 py-2.5"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="md"
                    className="text-base px-7 py-2.5"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center p-2.5 rounded-full text-textSecondary hover:text-textPrimary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas border-b border-borderSubtle px-6 pt-3 pb-6 space-y-4">
          <Link
            to="/browse"
            className="flex items-center gap-3 py-2.5 text-xl font-medium text-textSecondary hover:text-textPrimary"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search className="w-5 h-5 text-textSecondary" />
            <span>Browse Equipment</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 py-2 text-lg font-medium text-textSecondary hover:text-textPrimary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center gap-3 py-2 border-t border-borderSubtle/60">
                <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border border-borderSubtle text-textPrimary overflow-hidden font-medium text-sm">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-textSecondary" />
                  )}
                </div>
                <span className="font-medium text-base text-textPrimary">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left py-2.5 text-lg font-medium text-red-500 hover:text-red-600"
              >
                <LogOut className="w-6 h-6" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full py-3 text-base">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full py-3 text-base">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
