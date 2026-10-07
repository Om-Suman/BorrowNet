import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Zap,
  ShieldCheck,
  Star,
  X,
  Heart,
  Grid,
  Map as MapIcon,
  ChevronDown,
  Check,
  RotateCcw,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Truck,
  PackageCheck,
  Award,
} from "lucide-react";
import { categoriesApi, itemsApi } from "../api/endpoints";
import useDebounce from "../hooks/useDebounce";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";

// Fallback curated equipment inventory matching reference mockup
const DEFAULT_HARDWARE_ITEMS = [
  {
    id: "milwaukee-m18",
    name: "Milwaukee M18 FUEL Hammer Drill & Impact Driver Set (2x Batt...)",
    category: "Drills & Fastening",
    categorySlug: "power-tools",
    rating: 4.9,
    reviewsCount: 38,
    rate: 550,
    deposit: 2500,
    condition: "Like New",
    distance: "1.1 km",
    locality: "Indiranagar, Bengaluru",
    lenderName: "Alex T.",
    lenderInitials: "AT",
    tags: ["Instant Book", "Super Lender"],
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "simpson-megablaster",
    name: "Simpson Megablaster 3400 PSI Commercial Pressure Washer",
    category: "Surface Cleaning",
    categorySlug: "pressure-cleaning",
    rating: 5.0,
    reviewsCount: 24,
    rate: 899,
    deposit: 4000,
    condition: "Excellent",
    distance: "2.3 km",
    locality: "Koramangala, Bengaluru",
    lenderName: "Dave M.",
    lenderInitials: "DM",
    tags: ["Top Choice", "Instant Book"],
    image:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dewalt-12-miter",
    name: "DeWalt 12-Inch Sliding Compound Miter Saw with Mobile Stand",
    category: "Cutting & Saws",
    categorySlug: "power-tools",
    rating: 4.85,
    reviewsCount: 16,
    rate: 750,
    deposit: 3500,
    condition: "Excellent",
    distance: "3.4 km",
    locality: "HSR Layout, Bengaluru",
    lenderName: "Chloe S.",
    lenderInitials: "CS",
    tags: ["Instant Book"],
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ryobi-40v-mower",
    name: "Ryobi 40V Cordless Brushless Lawn Mower + Fast Charger Kit",
    category: "Lawn Maintenance",
    categorySlug: "lawn-garden-machinery",
    rating: 4.9,
    reviewsCount: 29,
    rate: 650,
    deposit: 3000,
    condition: "Like New",
    distance: "1.6 km",
    locality: "Indiranagar, Bengaluru",
    lenderName: "Marcus P.",
    lenderInitials: "MP",
    tags: ["Super Lender", "Instant Book"],
    image:
      "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bosch-sds-max",
    name: "Bosch 1-9/16 in. SDS-Max Rotary Hammer with Chisels & Case",
    category: "Demolition & Masonry",
    categorySlug: "power-tools",
    rating: 5.0,
    reviewsCount: 11,
    rate: 950,
    deposit: 4500,
    condition: "Like New",
    distance: "4.0 km",
    locality: "Whitefield, Bengaluru",
    lenderName: "Keith B.",
    lenderInitials: "KB",
    tags: ["Instant Book"],
    image:
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "little-giant-ladder",
    name: "Little Giant King Kombo 3-in-1 Fiberglass Extension Ladder",
    category: "Ladders & Scaffolding",
    categorySlug: "outdoor-diy-rigging",
    rating: 4.95,
    reviewsCount: 44,
    rate: 450,
    deposit: 2000,
    condition: "Excellent",
    distance: "2.1 km",
    locality: "Koramangala, Bengaluru",
    lenderName: "Sarah J.",
    lenderInitials: "SJ",
    tags: ["Super Lender", "Instant Book"],
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "stihl-leaf-blower",
    name: "STIHL Gas Powered Backpack Leaf Blower (Full Tank Inc.)",
    category: "Yard Cleanup",
    categorySlug: "lawn-garden-machinery",
    rating: 4.8,
    reviewsCount: 19,
    rate: 599,
    deposit: 2500,
    condition: "Good",
    distance: "3.2 km",
    locality: "BTM Layout, Bengaluru",
    lenderName: "Ryan W.",
    lenderInitials: "RW",
    tags: ["Instant Book"],
    image:
      "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "generac-3300-generator",
    name: "Generac 3300-Watt Portable Inverter Generator (Ultra Quiet)",
    category: "Power & Backup",
    categorySlug: "generators-site-power",
    rating: 5.0,
    reviewsCount: 32,
    rate: 1100,
    deposit: 5000,
    condition: "Like New",
    distance: "4.5 km",
    locality: "Indiranagar, Bengaluru",
    lenderName: "Elena R.",
    lenderInitials: "ER",
    tags: ["Top Choice", "Super Lender"],
    image:
      "https://images.unsplash.com/photo-1609137144822-261541484643?auto=format&fit=crop&w=600&q=80",
  },
];

// Bundled accessories for ML recommendation strip
const BUNDLE_ACCESSORIES = [
  {
    id: "b1",
    title: "100ft Heavy-Duty Cord",
    desc: "12-Gauge All-Weather",
    price: 150,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "b2",
    title: "Stud Finder Pro Multi-LED",
    desc: "Deep wall radar sensor",
    price: 120,
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "b3",
    title: "3M Ear & Eye Protection Kit",
    desc: "Sanitized after every loan",
    price: 90,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=120&q=80",
  },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";

  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filter States
  const [distanceKm, setDistanceKm] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState(
    categorySlug ? [categorySlug] : []
  );
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [instantOnly, setInstantOnly] = useState(false);
  const [superLendersOnly, setSuperLendersOnly] = useState(false);
  const [depositWaived, setDepositWaived] = useState(false);
  const [pickupOption, setPickupOption] = useState("pickup"); // "pickup" or "delivery"

  // Quick Filter Pills
  const [quickWeekend, setQuickWeekend] = useState(false);
  const [quickTopRated, setQuickTopRated] = useState(false);
  const [quickInstant, setQuickInstant] = useState(false);
  const [quickUnderBudget, setQuickUnderBudget] = useState(false);

  // Sync category and search param from URL
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategories([categorySlug]);
    } else {
      setSelectedCategories([]);
    }
  }, [categorySlug]);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  // Sorting & View Mode
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"

  // Wishlist and Reservation Modal
  const [wishlist, setWishlist] = useState(new Set());
  const [activeReserveItem, setActiveReserveItem] = useState(null);
  const [reserveDays, setReserveDays] = useState(3);
  const [isReserving, setIsReserving] = useState(false);
  const [addedBundles, setAddedBundles] = useState(new Set());

  // API query for categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    staleTime: 1000 * 60 * 10,
  });

  // API query for items (fetch catalog so client filters can operate smoothly)
  const { data: apiItemsData } = useQuery({
    queryKey: ["items", debouncedSearch],
    queryFn: () => itemsApi.list({ q: debouncedSearch, limit: 100 }),
    staleTime: 1000 * 60,
  });

  const apiItems = Array.isArray(apiItemsData?.data)
    ? apiItemsData.data
    : (apiItemsData?.data?.items || []);

  // Merge API items with default hardware mockup items
  const allItems = useMemo(() => {
    if (apiItems.length > 0) {
      // Map API items to unified card structure if needed
      return apiItems.map((item) => ({
        id: item.id,
        name: item.title,
        category: item.category?.name || "General Hardware",
        categorySlug: item.category?.slug || "power-tools",
        rating: Number(item.averageRating || 4.9),
        reviewsCount: item.reviewCount || 12,
        rate: Number(item.pricePerDay || 650),
        deposit: Number(item.depositValue || 2500),
        condition:
          item.condition === "LIKE_NEW"
            ? "Like New"
            : item.condition === "NEW"
            ? "Brand New"
            : item.condition === "GOOD"
            ? "Good"
            : (item.condition || "Excellent"),
        distance: "1.5 km",
        locality: item.location || "Indiranagar, Bengaluru",
        lenderName: item.owner?.name || "Verified Neighbor",
        lenderInitials: (item.owner?.name || "VN").substring(0, 2).toUpperCase(),
        tags: ["Instant Book"],
        image:
          item.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
      }));
    }
    return DEFAULT_HARDWARE_ITEMS;
  }, [apiItems]);

  const availableCategories = useMemo(() => {
    const list = [
      { label: "Power Tools", slug: "power-tools" },
      { label: "Pressure Cleaning", slug: "pressure-cleaning" },
      { label: "Lawn & Garden Machinery", slug: "lawn-garden-machinery" },
      { label: "Generators & Site Power", slug: "generators-site-power" },
      { label: "Tents & Trail Gear", slug: "tents-trail-gear" },
      { label: "Cameras & Studio Lights", slug: "cameras-studio-lights" },
      { label: "Carpentry & Saws", slug: "carpentry-woodworking" },
      { label: "Outdoor DIY Rigging", slug: "outdoor-diy-rigging" },
    ];
    return list.map((cat) => ({
      ...cat,
      count: allItems.filter((i) => i.categorySlug === cat.slug).length,
    }));
  }, [allItems]);

  // Client-side filtering
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Search term
      if (debouncedSearch) {
        const matchesName = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesCat = item.category.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesLoc = item.locality?.toLowerCase().includes(debouncedSearch.toLowerCase());
        if (!matchesName && !matchesCat && !matchesLoc) return false;
      }

      // Categories
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.categorySlug)
      ) {
        return false;
      }

      // Price range
      if (item.rate < minPrice || item.rate > maxPrice) return false;

      // Condition filter
      if (
        selectedConditions.length > 0 &&
        !selectedConditions.includes(item.condition)
      ) {
        return false;
      }

      // Quick filter: under budget (<= ₹700)
      if (quickUnderBudget && item.rate > 700) return false;

      // Quick filter: top rated (>= 4.9)
      if (quickTopRated && item.rating < 4.9) return false;

      // Quick filter / trust toggle: instant booking
      if ((quickInstant || instantOnly) && !item.tags.includes("Instant Book")) {
        return false;
      }

      // Super lenders
      if (superLendersOnly && !item.tags.includes("Super Lender")) {
        return false;
      }

      return true;
    });
  }, [
    allItems,
    debouncedSearch,
    selectedCategories,
    selectedConditions,
    minPrice,
    maxPrice,
    quickUnderBudget,
    quickTopRated,
    quickInstant,
    instantOnly,
    superLendersOnly,
  ]);

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

  const handleToggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleToggleCondition = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(10000);
    setSelectedConditions([]);
    setInstantOnly(false);
    setSuperLendersOnly(false);
    setDepositWaived(false);
    setQuickWeekend(false);
    setQuickTopRated(false);
    setQuickInstant(false);
    setQuickUnderBudget(false);
    setSearchTerm("");
    setSearchParams({});
    toast.info("All filters have been reset.");
  };

  const handleToggleBundle = (bId) => {
    setAddedBundles((prev) => {
      const next = new Set(prev);
      if (next.has(bId)) {
        next.delete(bId);
        toast.info("Bundle accessory removed");
      } else {
        next.add(bId);
        toast.success("Added accessory to your project kit!");
      }
      return next;
    });
  };

  const handleConfirmReservation = () => {
    setIsReserving(true);
    setTimeout(() => {
      setIsReserving(false);
      setActiveReserveItem(null);
      toast.success(
        `Reservation confirmed for ${activeReserveItem.name}! No charges will clear until handoff.`
      );
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16 text-[#131b2e] dark:text-white">
      {/* ========================================================= */}
      {/* 1. ACTIVE SEARCH & QUICK FILTER PILLS BAR                 */}
      {/* ========================================================= */}
      <div className="space-y-3 pt-2">
        {/* Search Active Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#6d7a72] dark:text-neutral-400 mr-1">
            Search Active
          </span>
          {debouncedSearch && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm font-semibold">
              <Search className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
              <span>Query: "{debouncedSearch}"</span>
            </div>
          )}
          {selectedCategories.length > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm font-semibold">
              <Search className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
              <span>
                {selectedCategories
                  .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
                  .join(", ")}
              </span>
            </div>
          ) : !debouncedSearch ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm font-semibold">
              <Search className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
              <span>All Equipment</span>
            </div>
          ) : null}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
            <span>Bengaluru (within {distanceKm} km)</span>
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[11px] text-[#6d7a72] dark:text-neutral-400 mr-1">
            Quick Filters:
          </span>

          {/* Available This Weekend */}
          <button
            onClick={() => setQuickWeekend(!quickWeekend)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
              quickWeekend
                ? "bg-[#006948] text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 text-[#131b2e] dark:text-white"
            }`}
          >
            <span>Available This Weekend</span>
            {quickWeekend && <X className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Top Rated (4.8+) */}
          <button
            onClick={() => setQuickTopRated(!quickTopRated)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
              quickTopRated
                ? "bg-[#006948] text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 text-[#131b2e] dark:text-white"
            }`}
          >
            <Star className="w-3 h-3 text-[#fea619] fill-current" />
            <span>Top Rated (4.8+)</span>
            {quickTopRated && <X className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Instant Book */}
          <button
            onClick={() => setQuickInstant(!quickInstant)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
              quickInstant
                ? "bg-[#006948] text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 text-[#131b2e] dark:text-white"
            }`}
          >
            <Zap className="w-3 h-3 text-[#006948] dark:text-[#68dba9]" />
            <span>Instant Book</span>
            {quickInstant && <X className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Under ₹700/day */}
          <button
            onClick={() => setQuickUnderBudget(!quickUnderBudget)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
              quickUnderBudget
                ? "bg-[#006948] text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 text-[#131b2e] dark:text-white"
            }`}
          >
            <span>Under ₹700/day</span>
            {quickUnderBudget && <X className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-[#006948] dark:text-[#68dba9] hover:underline ml-1"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SECTION HEADER (TITLE, COUNTER, SORT & VIEW TOGGLES)   */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#e2e8f0] dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Available Hardware in Bengaluru
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/60 border border-[#a7f3d0] dark:border-emerald-800 text-[#006948] dark:text-[#68dba9] text-xs font-bold">
              {filteredItems.length} Items live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-neutral-400 mt-0.5">
            Peer-inspected equipment ready for same-day local pickup or porch delivery.
          </p>
        </div>

        {/* Sort & View Mode Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#6d7a72] dark:text-neutral-400 font-medium">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer focus:border-[#006948]"
            >
              <option value="recommended">Recommended for You</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Distance: Nearest</option>
            </select>
          </div>

          {/* Grid vs Map Split Toggle */}
          <div className="flex items-center bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-[#ecfdf5] dark:bg-emerald-950/80 text-[#006948] dark:text-[#68dba9]"
                  : "text-[#6d7a72] hover:text-[#131b2e] dark:hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-[#ecfdf5] dark:bg-emerald-950/80 text-[#006948] dark:text-[#68dba9]"
                  : "text-[#6d7a72] hover:text-[#131b2e] dark:hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN SPLIT CONTENT: FILTER SIDEBAR + CARDS GRID        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ------------------------------------------------------- */}
        {/* LEFT COLUMN: FILTERS SIDEBAR (3 cols)                  */}
        {/* ------------------------------------------------------- */}
        <aside className="lg:col-span-3 bg-white dark:bg-[#131b2e] border border-[#e2e8f0] dark:border-neutral-700 rounded-2xl p-5 space-y-6 shadow-sm sticky top-24">
          <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0] dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#006948] dark:text-[#68dba9]" />
              <h3 className="text-sm font-bold">Filters</h3>
            </div>
            <button
              onClick={() => toast.success("Preset saved to your profile!")}
              className="text-xs font-semibold text-[#006948] dark:text-[#68dba9] hover:underline"
            >
              Save Preset
            </button>
          </div>

          {/* Search Distance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Search Distance</span>
              <span className="px-2 py-0.5 rounded-full bg-[#f2f4ff] dark:bg-neutral-800 text-[#006948] dark:text-[#68dba9] font-bold">
                {distanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-[#006948] h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6d7a72] dark:text-neutral-400 font-mono">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Categories Checkboxes */}
          <div className="space-y-2.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
              Categories
            </span>
            <div className="space-y-2 text-xs">
              {availableCategories.map((cat) => {
                const checked = selectedCategories.includes(cat.slug);
                return (
                  <label
                    key={cat.slug}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleCategory(cat.slug)}
                        className="w-3.5 h-3.5 rounded text-[#006948] accent-[#006948]"
                      />
                      <span className="group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors">
                        {cat.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6d7a72] dark:text-neutral-400 font-mono">
                      {cat.count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Per Day Range Inputs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Price Per Day</span>
              <span className="text-[#6d7a72] dark:text-neutral-400 text-[11px]">
                ₹{minPrice} – ₹{maxPrice}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="px-2.5 py-1.5 rounded-xl border border-[#e2e8f0] dark:border-neutral-700 bg-[#faf8ff] dark:bg-neutral-800 text-xs">
                <span className="text-[10px] text-[#6d7a72] block">Min (₹)</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full bg-transparent outline-none font-bold text-xs"
                />
              </div>
              <div className="px-2.5 py-1.5 rounded-xl border border-[#e2e8f0] dark:border-neutral-700 bg-[#faf8ff] dark:bg-neutral-800 text-xs">
                <span className="text-[10px] text-[#6d7a72] block">Max (₹)</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full bg-transparent outline-none font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Gear Condition Checkboxes */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
              Gear Condition
            </span>
            <div className="space-y-1.5 text-xs">
              {[
                { label: "Like New", hint: "(zero scuffs)" },
                { label: "Excellent", hint: "(minor signs)" },
                { label: "Well-Maintained Workhorse", hint: "" },
              ].map((cond) => {
                const checked = selectedConditions.includes(cond.label);
                return (
                  <label
                    key={cond.label}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCondition(cond.label)}
                      className="w-3.5 h-3.5 rounded text-[#006948] accent-[#006948]"
                    />
                    <span>
                      {cond.label}{" "}
                      <span className="text-[10px] text-[#6d7a72]">
                        {cond.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Trust & Verification */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
              Trust & Verification
            </span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  <span>Instant Booking Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={instantOnly}
                  onChange={(e) => setInstantOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#006948] accent-[#006948]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  <span>Super Lenders Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={superLendersOnly}
                  onChange={(e) => setSuperLendersOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#006948] accent-[#006948]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  <span>Security Deposit Waived</span>
                </div>
                <input
                  type="checkbox"
                  checked={depositWaived}
                  onChange={(e) => setDepositWaived(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#006948] accent-[#006948]"
                />
              </label>
            </div>
          </div>

          {/* Pickup Options */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#6d7a72] dark:text-neutral-400">
              Pickup Options
            </span>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pickup"
                  value="pickup"
                  checked={pickupOption === "pickup"}
                  onChange={() => setPickupOption("pickup")}
                  className="accent-[#006948]"
                />
                <span>Self Local Pickup (Free)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pickup"
                  value="delivery"
                  checked={pickupOption === "delivery"}
                  onChange={() => setPickupOption("delivery")}
                  className="accent-[#006948]"
                />
                <span>Lender Porch Delivery (+₹150–₹250)</span>
              </label>
            </div>
          </div>

          {/* Clear All Parameters button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full py-2.5 rounded-xl bg-[#eaedff] dark:bg-neutral-800 hover:bg-[#dae2fd] dark:hover:bg-neutral-750 text-[#006948] dark:text-[#68dba9] text-xs font-bold transition-colors"
          >
            Clear All Parameters
          </button>
        </aside>

        {/* ------------------------------------------------------- */}
        {/* RIGHT COLUMN: EQUIPMENT LISTINGS GRID (9 cols)          */}
        {/* ------------------------------------------------------- */}
        <div className="lg:col-span-9 space-y-8">
          {viewMode === "map" && (
            <div className="h-64 bg-[#f2f4ff] dark:bg-neutral-800 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-center z-10">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-black/70 shadow-sm">
                  📍 Map View: Bengaluru Hyper-Local Hubs
                </span>
                <span className="text-[11px] text-[#6d7a72] dark:text-neutral-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded-md">
                  Active radius: {distanceKm} km
                </span>
              </div>

              {/* Pin Clusters */}
              <div className="relative w-full h-full flex items-center justify-around z-10">
                <div className="text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-lg animate-bounce">
                    18
                  </div>
                  <span className="text-[10px] font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded shadow mt-1 inline-block">
                    Indiranagar
                  </span>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    24
                  </div>
                  <span className="text-[10px] font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded shadow mt-1 inline-block">
                    Koramangala
                  </span>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    14
                  </div>
                  <span className="text-[10px] font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded shadow mt-1 inline-block">
                    HSR Layout
                  </span>
                </div>

                <div className="text-center group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    12
                  </div>
                  <span className="text-[10px] font-bold bg-white dark:bg-black px-1.5 py-0.5 rounded shadow mt-1 inline-block">
                    Whitefield
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-center text-[#6d7a72] dark:text-neutral-400 z-10">
                Click any cluster to narrow search to that neighborhood.
              </div>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#131b2e] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 p-8 space-y-4">
              <PackageCheck className="w-12 h-12 text-[#6d7a72] mx-auto" />
              <h3 className="text-lg font-bold">No equipment found matching filters</h3>
              <p className="text-xs text-[#6d7a72] max-w-sm mx-auto">
                Try widening your price range, distance slider, or removing selected tags.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 rounded-xl bg-[#006948] text-white font-semibold text-xs shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isSaved = wishlist.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveReserveItem(item)}
                    className="group bg-white dark:bg-[#131b2e] border border-[#e2e8f0] dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame with badges */}
                      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Left Status Pills */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          {item.tags.includes("Instant Book") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fea619] text-[#131b2e] text-[10px] font-extrabold shadow-sm">
                              <Zap className="w-2.5 h-2.5" />
                              <span>Instant Book</span>
                            </span>
                          )}
                          {item.tags.includes("Super Lender") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#006948] text-white text-[10px] font-extrabold shadow-sm">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Super Lender</span>
                            </span>
                          )}
                          {item.tags.includes("Top Choice") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#005236] text-[#68dba9] text-[10px] font-extrabold shadow-sm border border-[#68dba9]/40">
                              <Award className="w-2.5 h-2.5" />
                              <span>Top Choice</span>
                            </span>
                          )}
                        </div>

                        {/* Wishlist Heart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md flex items-center justify-center text-[#131b2e] dark:text-white shadow-sm hover:scale-110 transition-transform"
                          aria-label="Save to wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isSaved ? "fill-red-500 text-red-500" : "text-neutral-600 dark:text-neutral-300"
                            }`}
                          />
                        </button>

                        {/* Bottom image pills: Condition & Distance */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20">
                            {item.condition}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-[#68dba9]" />
                            <span>{item.distance}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 space-y-2">
                        {/* Category & Rating */}
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

                        {/* Title */}
                        <h4 className="text-sm font-bold text-[#131b2e] dark:text-white line-clamp-2 group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors leading-snug">
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    {/* Card Footer: Lender Avatar & Price */}
                    <div className="p-4 pt-3 border-t border-[#e2e8f0]/80 dark:border-neutral-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#ecfdf5] text-[#006948] dark:bg-emerald-950/80 dark:text-[#68dba9] flex items-center justify-center font-bold text-[10px]">
                          {item.lenderInitials}
                        </div>
                        <span className="text-xs font-semibold text-[#475569] dark:text-neutral-300">
                          {item.lenderName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-[#006948] dark:text-[#68dba9]">
                          ₹{item.rate.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-[#6d7a72] dark:text-neutral-400">
                          {" "}/ day
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================= */}
          {/* 4. "SMART PAIRING FOR YOUR WEEKEND PROJECT" (ML BUNDLE)  */}
          {/* ======================================================= */}
          <div className="bg-[#faf8ff] dark:bg-[#131b2e] border border-[#d2d9f4] dark:border-neutral-700 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#006948] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">
                    Smart Pairing for Your Weekend Project
                  </h4>
                  <p className="text-xs text-[#6d7a72] dark:text-neutral-400">
                    Bengaluru borrowers who rented drills or pressure washers also bundled:
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-[#006948] text-white text-[10px] font-bold tracking-wider uppercase">
                ML Bundle Discount Applied
              </span>
            </div>

            {/* Bundle items carousel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BUNDLE_ACCESSORIES.map((b) => {
                const isAdded = addedBundles.has(b.id);
                return (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-[#006948] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold truncate">{b.title}</h5>
                        <p className="text-[10px] text-[#6d7a72] dark:text-neutral-400 truncate">
                          {b.desc}
                        </p>
                        <span className="text-xs font-extrabold text-[#006948] dark:text-[#68dba9]">
                          ₹{b.price} / d
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBundle(b.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isAdded
                          ? "bg-[#006948] text-white"
                          : "bg-[#f2f4ff] hover:bg-[#006948] hover:text-white text-[#006948]"
                      }`}
                      aria-label="Add to rental"
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* 5. PAGINATION ROW                                       */}
          {/* ======================================================= */}
          <div className="pt-4 border-t border-[#e2e8f0] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6d7a72] dark:text-neutral-400">
            <div>
              Showing <strong className="text-[#131b2e] dark:text-white">1 – {filteredItems.length}</strong> of{" "}
              <strong className="text-[#131b2e] dark:text-white">84</strong> equipment listings
            </div>

            <div className="flex items-center gap-1.5 font-semibold">
              <button
                disabled
                className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] dark:border-neutral-700 opacity-50 cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button className="w-8 h-8 rounded-lg bg-[#006948] text-white font-bold flex items-center justify-center shadow-sm">
                1
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center">
                2
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center">
                3
              </button>
              <span className="px-1 text-[#6d7a72]">...</span>
              <button className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center">
                11
              </button>

              <button className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-1">
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE RESERVATION MODAL                          */}
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
                  Lender: {activeReserveItem.lenderName} • {activeReserveItem.distance} away ({activeReserveItem.locality})
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
                  <span className="font-bold">
                    ₹{activeReserveItem.deposit.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300 text-xs border border-[#a7f3d0] dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>No upfront charge:</strong> Your card will only be placed on a temporary escrow hold upon lender confirmation. Security deposit releases automatically upon item return.
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
