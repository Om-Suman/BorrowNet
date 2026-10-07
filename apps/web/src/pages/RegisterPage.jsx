import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  AtSign,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Coins,
  ArrowLeftRight,
  ArrowRight,
  ShieldCheck,
  Star,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AlertBanner from "../components/feedback/AlertBanner";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [roleIntent, setRoleIntent] = useState("both"); // "borrow", "list", "both"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [commitSafety, setCommitSafety] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Password strength score (0 to 4)
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      return setError("Please agree to the Terms of Service and liability guidelines.");
    }
    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success("Welcome to borrowNet! Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account. Please check your information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleAuthPayload) => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle(googleAuthPayload);
      toast.success(`Welcome to borrowNet, ${user.name || "friend"}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to sign up with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    toast.error(err?.message || "Google sign-up was cancelled or failed.");
  };

  return (
    <div className="flex-grow py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[#faf8ff] dark:bg-[#0a0f1d] flex flex-col justify-center items-center my-auto transition-colors">
      {/* Top Header */}
      <div className="text-center space-y-2 mb-6 max-w-xl mx-auto">
        {/* Brand pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006948] dark:bg-[#68dba9] inline-block" />
          <span className="font-display font-extrabold text-sm tracking-tight text-[#006948] dark:text-[#68dba9]">
            borrow<span className="text-[#131b2e] dark:text-white">Net</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#131b2e] dark:text-white tracking-tight">
          Join the borrowNet Community
        </h1>
        <p className="text-sm sm:text-base text-[#475569] dark:text-neutral-400">
          Borrow professional gear or earn money lending equipment to verified neighbors.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-10 border border-[#e2e8f0] dark:border-neutral-700 shadow-xl">
        {/* Google Single Sign-On Button */}
        <div className="mb-6">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            isLoading={googleLoading}
            text="Sign up with Google"
          />
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0] dark:border-neutral-700" />
          </div>
          <span className="relative bg-white dark:bg-[#131b2e] px-4 text-[10px] font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
            Or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AlertBanner type="error" message={error} />}

          {/* Usage Intent Selector */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] dark:text-white mb-2">
              How do you plan to use borrowNet?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRoleIntent("borrow")}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  roleIntent === "borrow"
                    ? "bg-[#006948] text-white shadow-sm"
                    : "bg-[#f2f4ff] dark:bg-neutral-800 text-[#131b2e] dark:text-neutral-300 hover:bg-[#e6ebff] dark:hover:bg-neutral-700"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Borrow Gear</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleIntent("list")}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  roleIntent === "list"
                    ? "bg-[#006948] text-white shadow-sm"
                    : "bg-[#f2f4ff] dark:bg-neutral-800 text-[#131b2e] dark:text-neutral-300 hover:bg-[#e6ebff] dark:hover:bg-neutral-700"
                }`}
              >
                <Coins className="w-3.5 h-3.5 shrink-0" />
                <span>List Equipment</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleIntent("both")}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  roleIntent === "both"
                    ? "bg-[#006948] text-white shadow-sm"
                    : "bg-[#f2f4ff] dark:bg-neutral-800 text-[#131b2e] dark:text-neutral-300 hover:bg-[#e6ebff] dark:hover:bg-neutral-700"
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                <span>Both</span>
              </button>
            </div>
          </div>

          {/* 2x2 Form Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#6d7a72] dark:text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60 focus:border-[#006948] dark:focus:border-[#68dba9] transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <AtSign className="absolute left-3.5 w-4 h-4 text-[#6d7a72] dark:text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aarav@lenscraft.in"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60 focus:border-[#006948] dark:focus:border-[#68dba9] transition-colors"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-neutral-300 mb-1.5">
                Mobile Phone
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-[#6d7a72] dark:text-neutral-400 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60 focus:border-[#006948] dark:focus:border-[#68dba9] transition-colors"
                />
              </div>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#006948] dark:text-[#68dba9]">
                <Check className="w-3 h-3" />
                <span>Used for instant pickup coordination SMS</span>
              </p>
            </div>

            {/* City / Neighborhood */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-neutral-300 mb-1.5">
                City / Neighborhood
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-[#6d7a72] dark:text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Indiranagar, Bengaluru"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60 focus:border-[#006948] dark:focus:border-[#68dba9] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] dark:text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#6d7a72] dark:text-neutral-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl outline-none text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60 focus:border-[#006948] dark:focus:border-[#68dba9] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#6d7a72] hover:text-[#131b2e] dark:hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 4-bar Password Strength Indicator */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  strength >= 1
                    ? strength >= 3
                      ? "bg-[#006948]"
                      : "bg-[#fea619]"
                    : "bg-[#e2e8f0] dark:bg-neutral-700"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  strength >= 2
                    ? strength >= 3
                      ? "bg-[#006948]"
                      : "bg-[#fea619]"
                    : "bg-[#e2e8f0] dark:bg-neutral-700"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  strength >= 3 ? "bg-[#006948]" : "bg-[#e2e8f0] dark:bg-neutral-700"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  strength >= 4 ? "bg-[#006948]" : "bg-[#e2e8f0] dark:bg-neutral-700"
                }`}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#6d7a72] dark:text-neutral-400 mt-1.5">
              <span>Password strength</span>
              <span>Min. 8 characters with numbers & symbols</span>
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#006948] accent-[#006948] cursor-pointer"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="font-semibold text-[#006948] dark:text-[#68dba9] underline">
                  Terms of Service
                </a>{" "}
                and acknowledge the peer rental liability guidelines.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#475569] dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={commitSafety}
                onChange={(e) => setCommitSafety(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#006948] accent-[#006948] cursor-pointer"
              />
              <span>
                I commit to the{" "}
                <a href="#" className="font-semibold text-[#006948] dark:text-[#68dba9] underline">
                  Community Safety Code
                </a>{" "}
                (timely returns, secure handoffs, and gear respect).
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#006948] hover:bg-[#005137] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Verification Guarantee Banner */}
          <div className="p-3 rounded-xl bg-[#f0f4ff] dark:bg-neutral-800/80 border border-[#d2d9f4] dark:border-neutral-700/80 flex items-center gap-2.5 text-xs text-[#131b2e] dark:text-neutral-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006948] dark:bg-[#68dba9] shrink-0 inline-block" />
            <span>
              Every member is <strong>Government Photo ID verified</strong> before their first pickup. Guaranteed.
            </span>
          </div>

          {/* Log In Link */}
          <p className="text-center text-xs sm:text-sm text-[#475569] dark:text-neutral-400 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#006948] dark:text-[#68dba9] hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>

      {/* 3 Bottom Trust Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full max-w-2xl">
        <div className="bg-white dark:bg-[#131b2e] rounded-xl p-3.5 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] dark:bg-emerald-950/60 flex items-center justify-center text-[#006948] dark:text-[#68dba9] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
              ₹50,000 Deposit Protected
            </h5>
            <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400">
              Secured hold system
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] rounded-xl p-3.5 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] dark:bg-sky-950/60 flex items-center justify-center text-[#0369a1] dark:text-sky-400 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
              Zero Listing Fees
            </h5>
            <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400">
              Keep 90% of earnings
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] rounded-xl p-3.5 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#fef3c7] dark:bg-amber-950/60 flex items-center justify-center text-[#92400e] dark:text-amber-400 shrink-0">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
              Peer Rated
            </h5>
            <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400">
              Two way verified reviews
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
