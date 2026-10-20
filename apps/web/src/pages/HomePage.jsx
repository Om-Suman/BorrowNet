import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Tag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Hammer,
  Camera,
  Tent,
  Droplets,
  Speaker,
  Compass,
  Lock,
  Clock,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { categoriesApi, itemsApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Search widget state
  const [searchNeed, setSearchNeed] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");


  // Wishlist state
  const [wishlist, setWishlist] = useState(new Set());

  // Reservation modal state
  const categoriesScrollRef = useRef(null);

  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list, staleTime: 1000 * 60 * 5 });
  const { data: itemsData } = useQuery({ queryKey: ["items", "home"], queryFn: () => itemsApi.list({ limit: 4 }), staleTime: 1000 * 60 });
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const spotlightItems = Array.isArray(itemsData?.data) ? itemsData.data : (itemsData?.data?.items || []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const query = [searchNeed.trim(), selectedNeighborhood.trim()].filter(Boolean).join(" ");
    if (query) params.set("q", query);
    navigate(`/browse?${params.toString()}`);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from saved items");
      } else {
        next.add(id);
        toast.success("Saved to your wishlist!");
      }
      return next;
    });
  };

  const scrollCategories = (direction) => {
    if (categoriesScrollRef.current) {
      const amount = direction === "left" ? -320 : 320;
      categoriesScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };


  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Neighborhood badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/50 border border-[#a7f3d0] dark:border-emerald-800 text-[#006948] dark:text-[#68dba9] text-xs font-bold tracking-wide">
                <span>🌿</span>
                <span className="uppercase tracking-wider">
                  BorrowNet Community
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-extrabold text-[#131b2e] dark:text-white tracking-[-0.02em] leading-[1.08]">
                Access Neighborhood{" "}
                <span className="text-[#00855d] dark:text-[#68dba9] italic font-extrabold underline decoration-[#a7f3d0] dark:decoration-[#00855d]/40 underline-offset-4">
                  Gear
                </span>{" "}
                Without Buying.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#475569] dark:text-neutral-300 max-w-xl font-normal leading-relaxed">
                Rent tools, photography kits, camping setups, and lawn care
                equipment directly from verified local neighbors. Cut down garage
                clutter, save budget, and keep top-tier hardware moving across India.
              </p>

              {/* Search Widget Card */}
              <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-3 sm:p-4 border border-[#e2e8f0] dark:border-neutral-700 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.06)] dark:shadow-none">
                <form
                  onSubmit={handleHeroSearch}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 items-center"
                >
                  {/* Field 1: What do you need? */}
                  <div className="sm:col-span-4 px-3 py-2 bg-[#faf8ff] dark:bg-neutral-800/80 rounded-xl border border-[#e2e8f0] dark:border-neutral-700/60 focus-within:border-[#006948]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
                      What do you need?
                    </label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9] shrink-0" />
                      <input
                        type="text"
                        value={searchNeed}
                        onChange={(e) => setSearchNeed(e.target.value)}
                        placeholder="e.g. pressure washer, camera..."
                        className="w-full text-xs sm:text-sm bg-transparent outline-none font-medium text-[#131b2e] dark:text-white placeholder:text-[#6d7a72]/60"
                      />
                    </div>
                  </div>

                  {/* Field 2: Neighborhood */}
                  <div className="sm:col-span-3 px-3 py-2 bg-[#faf8ff] dark:bg-neutral-800/80 rounded-xl border border-[#e2e8f0] dark:border-neutral-700/60 focus-within:border-[#006948]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
                      City / Locality
                    </label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9] shrink-0" />
                      <input type="text" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} placeholder="Enter a city or locality" className="w-full text-xs sm:text-sm bg-transparent outline-none font-medium text-[#131b2e] dark:text-white" />
                    </div>
                  </div>

                  {/* Field 4: Search Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full h-[52px] bg-[#006948] hover:bg-[#005137] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-md transition-all active:scale-[0.98]"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Gear</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 4 Trust Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/60 dark:bg-neutral-800/40 border border-[#e2e8f0]/80 dark:border-neutral-700/50">
                  <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] dark:bg-emerald-950/60 flex items-center justify-center text-[#006948] dark:text-[#68dba9] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
                      Verified Members
                    </h5>
                    <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400 leading-tight">
                      Identity & community-checked
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/60 dark:bg-neutral-800/40 border border-[#e2e8f0]/80 dark:border-neutral-700/50">
                  <div className="w-7 h-7 rounded-lg bg-[#fef3c7] dark:bg-amber-950/60 flex items-center justify-center text-[#92400e] dark:text-amber-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
                      ₹50,000 Shield
                    </h5>
                    <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400 leading-tight">
                      Built-in asset protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/60 dark:bg-neutral-800/40 border border-[#e2e8f0]/80 dark:border-neutral-700/50">
                  <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] dark:bg-sky-950/60 flex items-center justify-center text-[#0369a1] dark:text-sky-400 shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
                      Zero Hidden Fees
                    </h5>
                    <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400 leading-tight">
                      Always transparent rates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/60 dark:bg-neutral-800/40 border border-[#e2e8f0]/80 dark:border-neutral-700/50">
                  <div className="w-7 h-7 rounded-lg bg-[#f3e8ff] dark:bg-purple-950/60 flex items-center justify-center text-[#7e22ce] dark:text-purple-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#131b2e] dark:text-white leading-tight">
                      Rapid Exchanges
                    </h5>
                    <p className="text-[11px] text-[#6d7a72] dark:text-neutral-400 leading-tight">
                      &lt;15 min handoff
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#e2e8f0] dark:border-neutral-700 bg-neutral-100 aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80"
                  alt="Neighbors exchanging a power circular saw"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#131b2e]/90 backdrop-blur-md text-[#131b2e] dark:text-white text-xs font-semibold shadow-md border border-white/40">
                    <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                    <span>{spotlightItems.length} items shown</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. EXPLORE BY DISCIPLINE (EQUIP ANY PROJECT THIS WEEKEND)  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#006948] dark:text-[#68dba9]">
              Explore by Discipline
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[#131b2e] dark:text-white tracking-tight mt-1">
              Equip Any Project This Weekend
            </h2>
            <p className="text-sm sm:text-base text-[#475569] dark:text-neutral-400 mt-1 max-w-2xl">
              Inspected, ready-to-work kits from gear aficionados right in your neighborhood.
            </p>
          </div>

          {/* Navigation arrow buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => scrollCategories("left")}
              aria-label="Previous categories"
              className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 flex items-center justify-center text-[#131b2e] dark:text-white hover:bg-neutral-50 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              aria-label="Next categories"
              className="w-9 h-9 rounded-full bg-[#006948] hover:bg-[#005137] text-white flex items-center justify-center shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div ref={categoriesScrollRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => navigate(`/browse?category=${category.slug}`)} className="rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 bg-white dark:bg-[#131b2e] p-6 text-left hover:border-[#006948] transition-colors">
              <h3 className="text-lg font-display font-bold text-[#131b2e] dark:text-white">{category.name}</h3>
              <p className="mt-2 text-sm text-[#475569] dark:text-neutral-400">{category._count?.items ?? 0} active items</p>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SPOTLIGHT NEIGHBORHOOD GEAR                             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#006948] dark:text-[#68dba9] text-xs font-bold uppercase tracking-wider mb-1.5 border border-[#a7f3d0] dark:border-emerald-800">
              <Zap className="w-3.5 h-3.5" />
              <span>Available Today</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[#131b2e] dark:text-white tracking-tight">
              Spotlight Neighborhood Gear
            </h2>
            <p className="text-sm sm:text-base text-[#475569] dark:text-neutral-400 mt-1">
              Listings and details loaded from the BorrowNet catalog.
            </p>
          </div>

          <button
            onClick={() => navigate("/browse")}
            className="flex items-center gap-1 text-sm font-semibold text-[#006948] dark:text-[#68dba9] hover:underline shrink-0"
          >
            <span>Browse all available items</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spotlightItems.map((item) => {
            const isSaved = wishlist.has(item.id);
            const itemName = item.title;
            const categoryName = item.category?.name || "Uncategorized";
            const ownerName = item.owner?.name || "Owner";
            const itemImage = item.images?.[0]?.url;
            return (
              <Card
                key={item.id}
                onClick={() => navigate(`/items/${item.id}`)}
                className="group flex flex-col justify-between bg-white dark:bg-[#131b2e] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={itemImage || ""}
                      alt={itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Distance pill */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md text-[11px] font-bold text-[#131b2e] dark:text-white shadow-sm border border-white/40">
                        <Zap className="w-3 h-3 text-[#006948] dark:text-[#68dba9]" />
                        <span>{item.location || item.owner?.location || "Location not provided"}</span>
                      </span>
                    </div>

                    {/* Wishlist toggle button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md flex items-center justify-center text-[#131b2e] dark:text-white hover:scale-110 transition-transform shadow-sm"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isSaved ? "fill-red-500 text-red-500" : "text-neutral-600 dark:text-neutral-300"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
                        {categoryName}
                      </span>
                      <div className="flex items-center gap-1 text-[#fea619]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[#131b2e] dark:text-white font-semibold">
                          {item.averageRating ? Number(item.averageRating).toFixed(1) : "No rating"}
                        </span>
                        <span className="text-[#6d7a72] font-normal">
                          ({item.reviewCount || 0})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-display font-bold text-[#131b2e] dark:text-white line-clamp-1 group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={item.owner?.avatarUrl || ""}
                        alt={ownerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#475569] dark:text-neutral-400 truncate">
                        Lent by <strong className="text-[#131b2e] dark:text-neutral-200">{ownerName}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Action */}
                <div className="p-4 pt-0 border-t border-[#e2e8f0]/60 dark:border-neutral-700/60 mt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-extrabold text-[#131b2e] dark:text-white">
                      ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#6d7a72] dark:text-neutral-400 ml-1">
                      / day
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/items/${item.id}`)}
                    className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FRICTIONLESS P2P PROTOCOL (HOW BORROWING WORKS)         */}
      {/* ========================================================= */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-[#006948] dark:text-[#68dba9]">
            Frictionless P2P Protocol
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#131b2e] dark:text-white tracking-tight">
            How Borrowing Works On borrowNet
          </h2>
          <p className="text-sm sm:text-base text-[#475569] dark:text-neutral-300">
            From first tap to clean return, our escrow deposit architecture protects both parties with verified identity checks and condition signatures.
          </p>
        </div>

        {/* 3 Step Protocol Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#006948] text-white font-display font-extrabold text-xl flex items-center justify-center shadow-md">
                1
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#006948] dark:text-[#68dba9]">
                Instant or Request
              </div>
              <h3 className="text-xl font-display font-bold text-[#131b2e] dark:text-white">
                Reserve Online
              </h3>
              <p className="text-sm text-[#475569] dark:text-neutral-300 leading-relaxed">
                Select dates, submit reservation request, and activate your booking with automated escrow hold. No charges clear until equipment handoff.
              </p>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] dark:border-neutral-700/80 flex items-center gap-2 text-xs font-semibold text-[#006948] dark:text-[#68dba9]">
              <ShieldCheck className="w-4 h-4" />
              <span>Deposits held securely in RBI-compliant Escrow Vault</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#fea619] text-[#131b2e] font-display font-extrabold text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#855300] dark:text-[#fea619]">
                Safe Exchanges
              </div>
              <h3 className="text-xl font-display font-bold text-[#131b2e] dark:text-white">
                Local Pickup Inspection
              </h3>
              <p className="text-sm text-[#475569] dark:text-neutral-300 leading-relaxed">
                Meet at the neighbor's porch or agreed pickup point. Scan the borrower QR pass, snap 2 quick condition photos, and take custody in 3 minutes.
              </p>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] dark:border-neutral-700/80 flex items-center gap-2 text-xs font-semibold text-[#855300] dark:text-[#fea619]">
              <Clock className="w-4 h-4" />
              <span>Dual-signed condition timestamp</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#00855d] text-white font-display font-extrabold text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#006948] dark:text-[#68dba9]">
                Deposit Restoration
              </div>
              <h3 className="text-xl font-display font-bold text-[#131b2e] dark:text-white">
                Return & Escrow Release
              </h3>
              <p className="text-sm text-[#475569] dark:text-neutral-300 leading-relaxed">
                Return gear clean and on schedule. The owner confirms inspection; security deposit releases immediately back to your card and ratings post.
              </p>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] dark:border-neutral-700/80 flex items-center gap-2 text-xs font-semibold text-[#006948] dark:text-[#68dba9]">
              <Zap className="w-4 h-4" />
              <span>Instant automatic security unfreeze</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
    </div>
  );
}
