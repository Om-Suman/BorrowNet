import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Sparkles,
  Truck,
  PackageCheck,
  Award,
} from "lucide-react";
import { categoriesApi, itemsApi, recommendationsApi } from "../api/endpoints";
import useDebounce from "../hooks/useDebounce";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { selectUniqueRecommendations } from "../utils/recommendations.js";

const FALLBACK_ITEM_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#eef2f7"/><path d="M96 158l36-40 25 27 21-22 46 52H96z" fill="#cbd5e1"/><circle cx="126" cy="85" r="13" fill="#cbd5e1"/><rect x="72" y="54" width="176" height="132" rx="12" fill="none" stroke="#94a3b8" stroke-width="8"/></svg>',
)}`;

function handleListingImageError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_ITEM_IMAGE;
}

function mapApiItemToCard(item) {
  const ownerName = item.owner?.name || "Owner";
  return {
    id: item.id,
    name: item.title,
    category: item.category?.name || "Uncategorized",
    categorySlug: item.category?.slug || "",
    rating: Number(item.averageRating || 0),
    reviewsCount: item.reviewCount || 0,
    rate: Number(item.pricePerDay || 0),
    deposit: Number(item.depositValue || 0),
    condition:
      item.condition === "LIKE_NEW"
        ? "Like New"
        : item.condition === "NEW"
        ? "Brand New"
        : item.condition === "GOOD"
        ? "Good"
        : (item.condition || "Not specified"),
    distance: item.location || item.owner?.location || "Location not provided",
    locality: item.location || item.owner?.location || "Location not provided",
    lenderName: ownerName,
    lenderInitials: ownerName.substring(0, 2).toUpperCase(),
    tags: [],
    image:
      item.images?.[0]?.url ||
      FALLBACK_ITEM_IMAGE,
  };
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const allItems = useMemo(() => apiItems.map(mapApiItemToCard), [apiItems]);

  const categoryRows = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const availableCategories = categoryRows.map((category) => ({
    label: category.name,
    slug: category.slug,
    count: category._count?.items ?? 0,
  }));

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
      if (quickTopRated && !item.rating) return false;

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

  const recommendationQuery = debouncedSearch.trim();
  const recommendationAnchor = apiItems.find(({ id }) => id === filteredItems[0]?.id);
  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useQuery({
    queryKey: ["recommendations", "related", recommendationQuery, recommendationAnchor?.id],
    queryFn: () => recommendationsApi.related(
      recommendationAnchor
        ? { itemId: recommendationAnchor.id, limit: 20 }
        : { q: recommendationQuery, limit: 20 },
    ),
    enabled: recommendationQuery.length >= 2,
    staleTime: 1000 * 60,
    retry: false,
  });

  const recommendedItems = useMemo(() => {
    const items = Array.isArray(recommendationsData?.data) ? recommendationsData.data : [];
    return selectUniqueRecommendations(items, filteredItems, 20).map(mapApiItemToCard);
  }, [filteredItems, recommendationsData]);

  const searchItemsWithRelated = useMemo(() => {
    const directItems = filteredItems.map((item) => ({ ...item, isRelated: false }));
    const relatedItems = recommendedItems.map((item) => ({ ...item, isRelated: true }));
    const results = [];

    directItems.forEach((item, index) => {
      results.push(item);
      if (relatedItems[index]) results.push(relatedItems[index]);
    });
    results.push(...relatedItems.slice(directItems.length));
    return results;
  }, [filteredItems, recommendedItems]);

  const handleConfirmReservation = () => {
    setActiveReserveItem(null);
    toast.info("Borrow requests cannot be submitted from this screen yet.");
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
            <span>All locations</span>
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
              Available items
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/60 border border-[#a7f3d0] dark:border-emerald-800 text-[#006948] dark:text-[#68dba9] text-xs font-bold">
              {filteredItems.length} matches
              {recommendationQuery.length >= 2 && (
                <>
                  <span className="mx-1" aria-hidden="true">·</span>
                  {recommendationsLoading
                    ? "Finding related…"
                    : recommendationsError
                      ? "Related unavailable"
                      : `${recommendedItems.length} related`}
                </>
              )}
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
                  Map preview
                </span>
                <span className="text-[11px] text-[#6d7a72] dark:text-neutral-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded-md">
                  Active radius: {distanceKm} km
                </span>
              </div>

              <div className="flex h-full items-center justify-center text-sm text-[#6d7a72] dark:text-neutral-400">Map markers are unavailable because the catalog API does not provide coordinates.</div>
            </div>
          )}

          {searchItemsWithRelated.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#131b2e] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 p-8 space-y-4">
              <PackageCheck className="w-12 h-12 text-[#6d7a72] mx-auto" />
              <h3 className="text-lg font-bold">No equipment found matching filters</h3>
              <p className="text-xs text-[#6d7a72] max-w-sm mx-auto">
                Try changing the search, category, price, or condition filters.
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
              {searchItemsWithRelated.map((item) => {
                const isSaved = wishlist.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/items/${item.id}`)}
                    className="group bg-white dark:bg-[#131b2e] border border-[#e2e8f0] dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame with badges */}
                      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={handleListingImageError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Left Status Pills */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          {item.isRelated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#006948] text-[10px] font-extrabold shadow-sm border border-[#a7f3d0]">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Related</span>
                            </span>
                          )}
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
                            <span>{item.locality}</span>
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
                              {item.rating ? item.rating.toFixed(1) : "Not rated"}
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

          {recommendationQuery.length >= 2 && recommendationsLoading && (
            <p className="text-center text-xs text-[#6d7a72] dark:text-neutral-400" role="status">
              Finding related listings to add to your results…
            </p>
          )}
          {recommendationQuery.length >= 2 && recommendationsError && (
            <p className="text-center text-xs text-[#6d7a72] dark:text-neutral-400" role="status">
              Related listings are temporarily unavailable. Search results are still shown above.
            </p>
          )}

          {/* ======================================================= */}
          {/* 5. PAGINATION ROW                                       */}
          {/* ======================================================= */}
          <div className="pt-4 border-t border-[#e2e8f0] dark:border-neutral-800 text-xs text-[#6d7a72] dark:text-neutral-400">
            Showing <strong className="text-[#131b2e] dark:text-white">{searchItemsWithRelated.length}</strong>{" "}
            {searchItemsWithRelated.length === 1 ? "listing" : "listings"} including related recommendations
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
                onError={handleListingImageError}
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
