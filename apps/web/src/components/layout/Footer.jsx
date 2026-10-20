
import { Link } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#faf8ff] dark:bg-[#0a0f1d] border-t border-[#e2e8f0] dark:border-neutral-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-[#e2e8f0] dark:border-neutral-800">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#006948] dark:text-[#68dba9] select-none">
                borrow<span className="text-[#131b2e] dark:text-white">Net</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaedff] dark:bg-neutral-800 text-[#006948] dark:text-[#68dba9] border border-[#d2d9f4] dark:border-neutral-700">
                Community P2P
              </span>
            </div>

            <p className="text-sm text-[#475569] dark:text-neutral-400 max-w-sm leading-relaxed">
              The trusted community marketplace to share, lend, and borrow high-quality physical gear. Cut down waste, save money, and meet reliable neighbors.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300 text-xs font-semibold border border-[#a7f3d0] dark:border-emerald-800/50">
                <ShieldCheck className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-400" />
                <span>100% User Verified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef3c7] dark:bg-amber-950/40 text-[#92400e] dark:text-amber-300 text-xs font-semibold border border-[#fde68a] dark:border-amber-800/50">
                <Lock className="w-3.5 h-3.5 text-[#92400e] dark:text-amber-400" />
                <span>Deposit Protected</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#475569] dark:text-neutral-400">
              <li>
                <Link to="/browse" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Explore Gear
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  List Your Gear
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Community Guarantee
                </a>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-white">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-[#475569] dark:text-neutral-400">
              <li>
                <Link to="/browse?category=carpentry-woodworking" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Power Tools & DIY
                </Link>
              </li>
              <li>
                <Link to="/browse?category=cameras-studio-lights" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Photography & Studio
                </Link>
              </li>
              <li>
                <Link to="/browse?category=tents-trail-gear" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Outdoor & Tents
                </Link>
              </li>
              <li>
                <Link to="/browse?category=sound-systems-projectors" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Parties & Hospitality
                </Link>
              </li>
              <li>
                <Link to="/browse?category=pressure-washing-landscaping" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Lawn Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-white">
              Safety & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#475569] dark:text-neutral-400">
              <li>
                <a href="#how-it-works" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Trust & Verification
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Damage Protection Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
                  Help & Support Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & catalog note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6d7a72] dark:text-neutral-400">
          <p>© 2026 borrowNet Technologies Inc. Sustainable community gear sharing across India.</p>
          <p className="font-medium tracking-tight">
            Available locations depend on active listings.
          </p>
        </div>
      </div>
    </footer>
  );
}
