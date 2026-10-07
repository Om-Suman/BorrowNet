import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AlertBanner from "../components/feedback/AlertBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      return setError("Please enter your email or mobile number.");
    }
    if (!password) {
      return setError("Please enter your password.");
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({ email: identifier.trim(), password });
      toast.success("Welcome back to borrowNet!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleAuthPayload) => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle(googleAuthPayload);
      toast.success(`Welcome back, ${user.name || "friend"}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to sign in with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    toast.error(err?.message || "Google sign in was cancelled or failed.");
  };

  return (
    <div className="flex-grow py-4 sm:py-6 px-4 bg-[#faf8ff] dark:bg-[#0a0f1d] flex flex-col justify-center items-center my-auto transition-colors">
      {/* Top Header */}
      <div className="text-center space-y-1 mb-3.5 max-w-sm mx-auto flex flex-col items-center">
        {/* Emblem badge */}
        <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-md mb-1">
          <ArrowLeftRight className="w-5 h-5" />
        </div>

        {/* Brand logo + P2P pill */}
        <div className="flex items-center gap-1.5">
          <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#006948] dark:text-[#68dba9]">
            borrow<span className="text-[#131b2e] dark:text-white">Net</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#ecfdf5] dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] border border-[#a7f3d0] dark:border-emerald-800">
            P2P
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#131b2e] dark:text-white tracking-tight">
          Welcome back to borrowNet
        </h1>
        <p className="text-xs text-[#475569] dark:text-neutral-400">
          Access your gear rentals, listings, and community messages.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#131b2e] rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] dark:border-neutral-700 shadow-lg">
        {/* Official Google Single Sign-On Button */}
        <div className="mb-4">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            isLoading={googleLoading}
            text="Continue with Google"
          />
        </div>

        {/* Divider */}
        <div className="relative my-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0] dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
            <span className="bg-white dark:bg-[#131b2e] px-2.5 text-[#6d7a72] dark:text-neutral-400">
              or continue with email
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3">
            <AlertBanner
              type="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email or Phone Field */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] dark:text-white mb-1">
              Email or Mobile Number
            </label>
            <div className="relative rounded-xl border border-[#cbd5e1] dark:border-neutral-700 focus-within:ring-2 focus-within:ring-[#006948] dark:focus-within:ring-[#68dba9] bg-white dark:bg-neutral-800/80 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-transparent text-[#131b2e] dark:text-white placeholder-[#94a3b8] focus:outline-none rounded-xl"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#131b2e] dark:text-white">
                Password
              </label>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Password reset link has been dispatched to your email.");
                }}
                className="text-[11px] font-semibold text-[#006948] dark:text-[#68dba9] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-xl border border-[#cbd5e1] dark:border-neutral-700 focus-within:ring-2 focus-within:ring-[#006948] dark:focus-within:ring-[#68dba9] bg-white dark:bg-neutral-800/80 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6d7a72]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-transparent text-[#131b2e] dark:text-white placeholder-[#94a3b8] focus:outline-none rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6d7a72] hover:text-[#131b2e] dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember device checkbox */}
          <div className="flex items-center justify-between py-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-[#006948] focus:ring-[#006948]"
              />
              <span className="text-xs text-[#475569] dark:text-neutral-300">
                Remember this device for 30 days
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#006948] hover:bg-[#005236] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : null}
            <span>Log In to BorrowNet</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Sign Up Redirect */}
          <p className="text-center text-xs text-[#475569] dark:text-neutral-400 pt-2 border-t border-[#f1f5f9] dark:border-neutral-800">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="font-bold text-[#006948] dark:text-[#68dba9] hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </form>
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="mt-3.5 w-full max-w-[420px] py-2 px-3 rounded-xl bg-[#f0f4ff] dark:bg-neutral-800/80 border border-[#d2d9f4] dark:border-neutral-700/80 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#131b2e] dark:text-neutral-200">
        <ShieldCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9] shrink-0" />
        <span>₹50,000 Community Equipment Guarantee • 100% Peer Verified</span>
      </div>

      {/* Bottom Footer Links */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#6d7a72] dark:text-neutral-400">
        <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
          Community Guidelines
        </a>
        <span>•</span>
        <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
          Rental Protection Policy
        </a>
        <span>•</span>
        <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
          Support Center
        </a>
      </div>
    </div>
  );
}
