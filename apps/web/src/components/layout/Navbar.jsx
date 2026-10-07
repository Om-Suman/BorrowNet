import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  MapPin,
  ArrowRight,
  Plus,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

const POPULAR_CATEGORIES = [
  { label: "All Items", slug: "" },
  { label: "Power Tools", slug: "power-tools" },
  { label: "Cameras & AV", slug: "cameras-studio-lights" },
  { label: "Camping & Outdoors", slug: "tents-trail-gear" },
  { label: "Lawn & Garden", slug: "lawn-garden-machinery" },
  { label: "Party & Events", slug: "party-events" },
  { label: "Generators & Power", slug: "generators-site-power" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Bengaluru (10 km)");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/browse?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const currentCategory = new URLSearchParams(location.search).get("category") || "";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="sticky top-0 z-40 bg-[#faf8ff] dark:bg-[#0a0f1d] border-b border-[#e2e8f0] dark:border-neutral-800 transition-colors">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948] dark:bg-[#68dba9] inline-block"></span>
                <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#006948] dark:text-[#68dba9] select-none leading-none">
                  borrow<span className="text-[#131b2e] dark:text-white">Net</span>
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#6d7a72] dark:text-neutral-400 pl-4 tracking-tight -mt-0.5">
                Lend & Borrow Locally
              </span>
            </div>
          </Link>

          {/* Integrated Search Bar (Desktop) */}
          <form
            onSubmit={handleNavSearch}
            className="hidden lg:flex items-center flex-1 max-w-xl mx-4 bg-white dark:bg-[#131b2e] border border-[#e2e8f0] dark:border-neutral-700 rounded-full py-1.5 pl-4 pr-1.5 shadow-sm hover:border-[#bccac0] focus-within:border-[#006948] dark:focus-within:border-[#68dba9] transition-all"
          >
            <div className="flex items-center flex-1 gap-2 min-w-0">
              <Search className="w-4 h-4 text-[#6d7a72] dark:text-neutral-400 shrink-0" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search tools, cameras, camping gear..."
                className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/70 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="h-4 w-px bg-[#e2e8f0] dark:bg-neutral-700 mx-2 shrink-0" />

            <div className="flex items-center gap-1 text-xs text-[#131b2e] dark:text-neutral-300 font-medium px-2 py-1 shrink-0 cursor-pointer hover:text-[#006948]">
              <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
              <span className="truncate max-w-[120px]">{selectedLocation}</span>
              <ChevronDown className="w-3 h-3 text-[#6d7a72]" />
            </div>

            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-[#006948] hover:bg-[#005137] text-white flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-sm"
              aria-label="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop Right Navigation Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/browse"
              className="text-sm font-semibold text-[#131b2e] dark:text-neutral-200 hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors px-2 py-1"
            >
              Borrow Items
            </Link>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-[#131b2e] dark:text-neutral-200 hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors px-2 py-1"
            >
              How It Works
            </a>

            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5 text-xs sm:text-sm px-4 py-2 font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>List an Item</span>
              </Button>
            </Link>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2">
                <Link to="/dashboard">
                  <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm hover:border-[#006948] transition-all">
                    <div className="w-7 h-7 rounded-full bg-[#006948]/10 text-[#006948] dark:text-[#68dba9] flex items-center justify-center font-bold text-xs overflow-hidden">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="font-semibold text-xs text-[#131b2e] dark:text-white max-w-[100px] truncate">
                      {user?.name?.split(" ")[0] || "Profile"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 hover:border-red-300 flex items-center justify-center text-[#6d7a72] hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-3.5 py-1.5 font-semibold">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm" className="text-xs sm:text-sm px-4 py-1.5 font-semibold">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center justify-center p-2 rounded-full text-[#131b2e] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Popular Categories Pills (Hidden on Auth pages) */}
      {!isAuthPage && (
        <div className="border-t border-[#e2e8f0] dark:border-neutral-800 bg-[#faf8ff] dark:bg-[#0d1424] py-2 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#6d7a72] dark:text-neutral-400 shrink-0 mr-1">
              Popular:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {POPULAR_CATEGORIES.map((cat) => {
                const isActive =
                  cat.slug === ""
                    ? !currentCategory && location.pathname === "/"
                    : currentCategory === cat.slug;

                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      if (cat.slug === "") {
                        navigate("/browse");
                      } else {
                        navigate(`/browse?category=${cat.slug}`);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#006948] text-white shadow-sm"
                        : "bg-white dark:bg-neutral-800 text-[#131b2e] dark:text-neutral-200 border border-[#e2e8f0] dark:border-neutral-700 hover:border-[#006948] hover:text-[#006948] dark:hover:text-[#68dba9]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf8ff] dark:bg-[#0a0f1d] border-b border-[#e2e8f0] dark:border-neutral-800 px-6 pt-3 pb-6 space-y-4">
          <form onSubmit={handleNavSearch} className="flex items-center gap-2 pt-2">
            <div className="flex-1 flex items-center bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-[#6d7a72] mr-2" />
              <input
                type="text"
                placeholder="Search gear..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-[#131b2e] dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="p-2.5 rounded-full bg-[#006948] text-white"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <Link
            to="/browse"
            className="flex items-center gap-3 py-2 text-base font-semibold text-[#131b2e] dark:text-white hover:text-[#006948]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search className="w-4 h-4 text-[#006948]" />
            <span>Browse Equipment</span>
          </Link>

          <a
            href="#how-it-works"
            className="block py-2 text-base font-semibold text-[#131b2e] dark:text-white hover:text-[#006948]"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>

          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="flex items-center gap-2 py-2 text-base font-semibold text-[#006948] dark:text-[#68dba9]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus className="w-4 h-4" />
            <span>List an Item</span>
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#e2e8f0] dark:border-neutral-800 space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-base font-semibold text-[#131b2e] dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard ({user?.name})</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-base font-semibold text-red-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#e2e8f0] dark:border-neutral-800 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full py-2.5 text-sm font-semibold">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full py-2.5 text-sm font-semibold">
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
