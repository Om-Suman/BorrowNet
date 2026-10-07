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
import { categoriesApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

// Fallback high-impact disciplines matching mockup
const FEATURED_DISCIPLINES = [
  {
    id: "carpentry-woodworking",
    slug: "carpentry-woodworking",
    title: "Carpentry & Woodworking",
    desc: "Table saws, jointers, routers, and dust extractors.",
    activeCount: "18 items active",
    icon: Hammer,
    bgImage:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cameras-studio-lights",
    slug: "cameras-studio-lights",
    title: "Cameras & Studio Lights",
    desc: "Full-frame bodies, prime glass, wireless microphones.",
    activeCount: "42 items active",
    icon: Camera,
    bgImage:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "tents-trail-gear",
    slug: "tents-trail-gear",
    title: "Tents & Trail Gear",
    desc: "4-season backpacks, rooftop tents, trail cookstoves.",
    activeCount: "31 items active",
    icon: Tent,
    bgImage:
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pressure-washing-landscaping",
    slug: "pressure-washing-landscaping",
    title: "Pressure Washing & Landscaping",
    desc: "Gas pressure washers, aerators, post hole diggers.",
    activeCount: "15 items active",
    icon: Droplets,
    bgImage:
      "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sound-systems-projectors",
    slug: "sound-systems-projectors",
    title: "Sound Systems & Projectors",
    desc: "QSC powered speakers, 4K projectors, outdoor screen packs.",
    activeCount: "28 items active",
    icon: Speaker,
    bgImage:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kayaks-mobility",
    slug: "kayaks-mobility",
    title: "Kayaks & Mobility",
    desc: "Inflatable paddleboards, bike trailers, electric cargo bikes.",
    activeCount: "19 items active",
    icon: Compass,
    bgImage:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  },
];

// Spotlight gear with Indian Rupee (₹) pricing and Indian localities
const SPOTLIGHT_ITEMS = [
  {
    id: "honda-gx200",
    name: "Honda GX200 3200 PSI Pressure Washer",
    category: "PRESSURE WASHERS",
    categorySlug: "pressure-washing-landscaping",
    rate: 799,
    deposit: 3500,
    rating: 4.95,
    reviewsCount: 42,
    distance: "0.4 km away",
    lenderName: "Marcus D.",
    lenderTag: "Top Lender",
    lenderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    image: "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sony-a7iv",
    name: "Sony Alpha A7 IV Kit + 24-70mm GM",
    category: "CAMERAS & VIDEO",
    categorySlug: "cameras-studio-lights",
    rate: 1899,
    deposit: 8000,
    rating: 5.0,
    reviewsCount: 61,
    distance: "1.2 km away",
    lenderName: "Pooja R.",
    lenderTag: "Bengaluru Creators Collective",
    lenderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "tnf-wawona-6",
    name: "The North Face Wawona 6-Person Tent",
    category: "CAMPING & TRAIL",
    categorySlug: "tents-trail-gear",
    rate: 599,
    deposit: 2500,
    rating: 4.91,
    reviewsCount: 19,
    distance: "1.8 km away",
    lenderName: "Rohan M.",
    lenderTag: "Superlender",
    lenderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    image: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dewalt-miter-12",
    name: 'DeWalt 12" Sliding Compound Miter Saw',
    category: "CARPENTRY & SAWS",
    categorySlug: "carpentry-woodworking",
    rate: 749,
    deposit: 3000,
    rating: 4.98,
    reviewsCount: 53,
    distance: "0.6 km away",
    lenderName: "Ananya K.",
    lenderTag: "Koramangala Makers Guild",
    lenderAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
];

// Calculator gear presets in Indian Rupees (₹)
const CALCULATOR_PRESETS = [
  { label: "Chainsaw / Power Saw", rate: 750, days: 8 },
  { label: "Cinema Camera Rig", rate: 1800, days: 6 },
  { label: "Commercial Pressure Washer", rate: 850, days: 6 },
  { label: "Inflatable Kayak Pair", rate: 650, days: 8 },
  { label: "6-Person Camping Kit", rate: 750, days: 6 },
  { label: "Lawn Aerator / Dethatcher", rate: 900, days: 5 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Search widget state
  const [searchNeed, setSearchNeed] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Indiranagar, Bengaluru");
  const [rentalDates, setRentalDates] = useState("Oct 18 - Oct 21");

  // Wishlist state
  const [wishlist, setWishlist] = useState(new Set());

  // Calculator state
  const [calcIndex, setCalcIndex] = useState(0);
  const [calcDays, setCalcDays] = useState(8);

  // Reservation modal state
  const [activeReserveItem, setActiveReserveItem] = useState(null);
  const [reserveDays, setReserveDays] = useState(3);
  const [isReserving, setIsReserving] = useState(false);

  const categoriesScrollRef = useRef(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchNeed.trim()) params.set("q", searchNeed.trim());
    if (selectedNeighborhood) params.set("neighborhood", selectedNeighborhood);
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

  // Calculator computations
  const currentCalcItem = CALCULATOR_PRESETS[calcIndex];
  const monthlyEarnings = currentCalcItem.rate * calcDays;
  const annualEarnings = monthlyEarnings * 12;

  // Reservation handler
  const handleConfirmReservation = () => {
    setIsReserving(true);
    setTimeout(() => {
      setIsReserving(false);
      setActiveReserveItem(null);
      toast.success(
        `Reservation request sent for ${activeReserveItem.name}! No charges will clear until handoff.`
      );
    }, 600);
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
                  Bengaluru Hyper-Local Circle
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
                      <select
                        value={selectedNeighborhood}
                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-transparent outline-none font-medium text-[#131b2e] dark:text-white cursor-pointer"
                      >
                        <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                        <option value="Koramangala, Bengaluru">Koramangala, Bengaluru</option>
                        <option value="HSR Layout, Bengaluru">HSR Layout, Bengaluru</option>
                        <option value="Whitefield, Bengaluru">Whitefield, Bengaluru</option>
                        <option value="Bandra, Mumbai">Bandra, Mumbai</option>
                        <option value="Hauz Khas, Delhi">Hauz Khas, Delhi</option>
                        <option value="Jubilee Hills, Hyderabad">Jubilee Hills, Hyderabad</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 3: Rental Period */}
                  <div className="sm:col-span-3 px-3 py-2 bg-[#faf8ff] dark:bg-neutral-800/80 rounded-xl border border-[#e2e8f0] dark:border-neutral-700/60 focus-within:border-[#006948]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
                      Rental Period
                    </label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9] shrink-0" />
                      <input
                        type="text"
                        value={rentalDates}
                        onChange={(e) => setRentalDates(e.target.value)}
                        placeholder="Oct 18 - Oct 21"
                        className="w-full text-xs sm:text-sm bg-transparent outline-none font-medium text-[#131b2e] dark:text-white"
                      />
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
                    <span>132 lend-ready items in Bengaluru</span>
                  </div>
                </div>

                {/* Floating Bottom Lender Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/60 dark:border-neutral-700 shadow-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Aarav & Priya"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#006948]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#131b2e] dark:text-white">
                          Aarav & Priya
                        </span>
                        <span className="flex items-center text-[11px] font-bold text-[#fea619]">
                          <Star className="w-3 h-3 fill-current inline mr-0.5" /> 5.0
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-neutral-400">
                        Lent Sony FX3 Cinema Rig • 2h ago
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-sm font-extrabold text-[#006948] dark:text-[#68dba9]">
                      ₹2,400
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
                      Earned today
                    </span>
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
        <div
          ref={categoriesScrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURED_DISCIPLINES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/browse?category=${item.slug}`)}
                className="group relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/11] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e2e8f0] dark:border-neutral-700 hover:-translate-y-1"
              >
                <img
                  src={item.bgImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/90 transition-colors" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {item.activeCount}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-[#006948] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-1">
                    {item.desc}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#68dba9] group-hover:translate-x-1 transition-transform">
                    <span>Browse Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
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
              Top-rated equipment with same-day handoff confirmation across India.
            </p>
          </div>

          <button
            onClick={() => navigate("/browse")}
            className="flex items-center gap-1 text-sm font-semibold text-[#006948] dark:text-[#68dba9] hover:underline shrink-0"
          >
            <span>View all 1,480+ local items in India</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPOTLIGHT_ITEMS.map((item) => {
            const isSaved = wishlist.has(item.id);
            return (
              <Card
                key={item.id}
                className="group flex flex-col justify-between bg-white dark:bg-[#131b2e] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Distance pill */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md text-[11px] font-bold text-[#131b2e] dark:text-white shadow-sm border border-white/40">
                        <Zap className="w-3 h-3 text-[#006948] dark:text-[#68dba9]" />
                        <span>{item.distance}</span>
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
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-[#fea619]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[#131b2e] dark:text-white font-semibold">
                          {item.rating}
                        </span>
                        <span className="text-[#6d7a72] font-normal">
                          ({item.reviewsCount})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-display font-bold text-[#131b2e] dark:text-white line-clamp-1 group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={item.lenderAvatar}
                        alt={item.lenderName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#475569] dark:text-neutral-400 truncate">
                        Lent by <strong className="text-[#131b2e] dark:text-neutral-200">{item.lenderName}</strong> • {item.lenderTag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Action */}
                <div className="p-4 pt-0 border-t border-[#e2e8f0]/60 dark:border-neutral-700/60 mt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-extrabold text-[#131b2e] dark:text-white">
                      ₹{item.rate.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#6d7a72] dark:text-neutral-400 ml-1">
                      / day
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveReserveItem(item)}
                    className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                  >
                    Reserve
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
      {/* 5. LENDER EARNINGS BANNER / GARAGE CALCULATOR (NAVY CARD) */}
      {/* ========================================================= */}
      <section id="lender-earnings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#131b2e] text-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#006948]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fea619]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Calculator Section (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#006948]/30 border border-[#006948] text-[#68dba9] text-xs font-bold">
                <span>🌿</span>
                <span className="uppercase tracking-wider">
                  Earn As A Neighborhood Lender
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-tight">
                Your Garage Holds An Untapped ₹85,000+ Every Single Year.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                The average circular gear sits idle for 340+ days a year. Share your high-quality tools, audio kits, or outdoor gear with vetted neighbors under our ₹50,000 Comprehensive Coverage guarantee.
              </p>

              {/* Interactive Earnings Module */}
              <div className="bg-[#1e293b]/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      What gear do you own?
                    </label>
                    <select
                      value={calcIndex}
                      onChange={(e) => setCalcIndex(Number(e.target.value))}
                      className="mt-1 block w-full bg-[#0f172a] text-white text-sm font-semibold rounded-xl px-3 py-2 border border-slate-600 outline-none cursor-pointer focus:border-[#68dba9]"
                    >
                      {CALCULATOR_PRESETS.map((preset, idx) => (
                        <option key={preset.label} value={idx}>
                          {preset.label} (₹{preset.rate.toLocaleString("en-IN")}/day)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#68dba9]">
                      ₹{monthlyEarnings.toLocaleString("en-IN")} / mo
                    </span>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      Estimated returns: ₹{annualEarnings.toLocaleString("en-IN")}/year
                    </span>
                  </div>
                </div>

                {/* Slider for days */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Lending frequency:</span>
                    <strong className="text-white font-semibold">
                      {calcDays} days / month
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00855d]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 weekend</span>
                    <span>2 weekends</span>
                    <span>Half month</span>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 rounded-xl bg-[#006948] hover:bg-[#005137] text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  List Your Idle Gear
                </button>
                <button
                  onClick={() => navigate("/browse")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#68dba9] hover:underline"
                >
                  <span>Calculate custom earnings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Proof Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white text-[#131b2e] rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Dev & Ananya H."
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#006948]"
                    />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#131b2e]">
                        Dev & Ananya H.
                      </h4>
                      <p className="text-xs text-[#6d7a72]">
                        Lending since March 2023 • Indiranagar, Bengaluru
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#006948] text-xs font-bold border border-[#a7f3d0]">
                    Level 4 Host
                  </span>
                </div>

                {/* 3 Metric Stats */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#e2e8f0] text-center">
                  <div>
                    <span className="block text-xl font-extrabold text-[#131b2e]">
                      124
                    </span>
                    <span className="text-[11px] font-semibold text-[#6d7a72]">
                      Handoffs
                    </span>
                  </div>
                  <div>
                    <span className="block text-xl font-extrabold text-[#006948]">
                      ₹1,84,500
                    </span>
                    <span className="text-[11px] font-semibold text-[#6d7a72]">
                      Earned
                    </span>
                  </div>
                  <div>
                    <span className="block text-xl font-extrabold text-[#fea619]">
                      4.99
                    </span>
                    <span className="text-[11px] font-semibold text-[#6d7a72]">
                      Rating
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#475569] italic leading-relaxed">
                  "Our lawn aerator, power tile cutter, and Sony FX3 rig alone paid for themselves four times over. Met awesome neighbors down the street too."
                </p>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] text-xs text-[#006948] font-semibold">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-[#006948]" />
                  <span>
                    Every owner is backed by identity verification, ₹50,000 asset protection, and zero-tax transfer shields.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. QUICK RESERVATION MODAL                                */}
      {/* ========================================================= */}
      {activeReserveItem && (
        <Modal
          isOpen={Boolean(activeReserveItem)}
          onClose={() => setActiveReserveItem(null)}
          title={`Reserve: ${activeReserveItem.name}`}
          size="md"
        >
          <div className="space-y-5 text-[#131b2e] dark:text-white">
            <div className="flex gap-4 items-center">
              <img
                src={activeReserveItem.image}
                alt={activeReserveItem.name}
                className="w-20 h-20 rounded-xl object-cover border border-[#e2e8f0] dark:border-neutral-700"
              />
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006948] dark:text-[#68dba9]">
                  {activeReserveItem.category}
                </span>
                <h4 className="font-bold text-sm leading-snug">
                  {activeReserveItem.name}
                </h4>
                <p className="text-xs text-[#475569] dark:text-neutral-400">
                  Lender: {activeReserveItem.lenderName} • {activeReserveItem.distance}
                </p>
              </div>
            </div>

            {/* Rental Duration Selector */}
            <div className="bg-[#faf8ff] dark:bg-neutral-800/60 p-4 rounded-xl border border-[#e2e8f0] dark:border-neutral-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Rental Duration:</span>
                <span className="font-semibold text-[#006948] dark:text-[#68dba9]">
                  {reserveDays} {reserveDays === 1 ? "day" : "days"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={reserveDays}
                onChange={(e) => setReserveDays(Number(e.target.value))}
                className="w-full accent-[#006948]"
              />

              <div className="pt-2 border-t border-[#e2e8f0] dark:border-neutral-700 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>₹{activeReserveItem.rate.toLocaleString("en-IN")} / day</span>
                </div>
                <div className="flex justify-between">
                  <span>Rental Subtotal:</span>
                  <span className="font-bold">
                    ₹{(activeReserveItem.rate * reserveDays).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#006948] dark:text-[#68dba9]">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold">₹{activeReserveItem.deposit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300 text-xs border border-[#a7f3d0] dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>No upfront charge:</strong> Your card will only be placed on a temporary authorization hold upon lender confirmation. Security deposit releases automatically upon item return.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveReserveItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isReserving}
                onClick={handleConfirmReservation}
                className="font-semibold px-6"
              >
                Confirm Reservation Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
