import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, ShieldCheck, X } from "lucide-react";
import { categoriesApi, itemsApi } from "../api/endpoints";
import useDebounce from "../hooks/useDebounce";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card, { CardBody } from "../components/ui/Card";
import LoadingSkeleton from "../components/feedback/LoadingSkeleton";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";

  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
  const categories = categoriesData?.data || [];

  const { data: itemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items", categorySlug, debouncedSearch],
    queryFn: () =>
      itemsApi.list({ category: categorySlug, q: debouncedSearch }),
  });
  const items = itemsData?.data || [];
  const totalItems = itemsData?.meta?.total ?? items.length;

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  const toggleCategory = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  const conditionVariants = {
    NEW: "mint",
    LIKE_NEW: "info",
    GOOD: "default",
    FAIR: "warning",
    POOR: "danger",
  };

  const activeCategoryObj = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="space-y-8 py-4">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-borderSubtle">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-textPrimary tracking-tight">
            Browse Equipment
          </h1>
          <p className="text-sm sm:text-base text-textSecondary mt-1.5 font-normal">
            {isItemsLoading
              ? "Discovering verified gear across India..."
              : `${totalItems} items available for borrow right now`}
          </p>
        </div>

        {/* Search Pill Input */}
        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textSecondary" />
          </div>
          <input
            type="text"
            placeholder="Search cameras, tools, tech..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full pl-11 pr-10 py-3 text-sm sm:text-base bg-surface border border-borderSubtle text-textPrimary placeholder:text-textSecondary/60 focus:border-neutral-500 focus:outline-none transition-all shadow-level-3 dark:shadow-level-1"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textSecondary hover:text-textPrimary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Carousel / Chips */}
      <div className="relative">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
          <button
            onClick={() => toggleCategory("")}
            className={`shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-150 select-none ${
              !categorySlug
                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-surface border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            All Equipment
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.slug)}
              className={`shrink-0 px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-150 select-none flex items-center gap-2 ${
                categorySlug === cat.slug
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "bg-surface border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Info & Reset Button */}
      {(categorySlug || debouncedSearch) && (
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-borderSubtle text-xs sm:text-sm text-textSecondary">
          <div className="flex items-center gap-2">
            <span>Filtering by:</span>
            {activeCategoryObj && (
              <span className="font-medium text-textPrimary bg-surface px-2.5 py-1 rounded-full border border-borderSubtle">
                {activeCategoryObj.icon} {activeCategoryObj.name}
              </span>
            )}
            {debouncedSearch && (
              <span className="font-medium text-textPrimary bg-surface px-2.5 py-1 rounded-full border border-borderSubtle">
                "{debouncedSearch}"
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white underline ml-4"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Items Grid */}
      {isItemsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-borderSubtle rounded-2xl p-5 space-y-4 shadow-level-3 dark:shadow-level-1"
            >
              <LoadingSkeleton variant="card" className="h-52 rounded-xl" />
              <LoadingSkeleton variant="text" />
              <LoadingSkeleton variant="text" count={2} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-surface border border-borderSubtle rounded-2xl max-w-lg mx-auto p-10 shadow-level-3 dark:shadow-level-1">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-display font-medium text-textPrimary mb-2">
            No equipment found
          </h3>
          <p className="text-sm text-textSecondary mb-6 leading-relaxed">
            We couldn't find anything matching your search criteria. Try a
            different search term or browse our popular categories.
          </p>
          <Button
            variant="primary"
            onClick={clearFilters}
            className="px-6 py-2.5"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {items.map((item) => {
            const primaryImage =
              item.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80";
            return (
              <Card
                key={item.id}
                hoverable
                className="flex flex-col h-full group rounded-2xl border border-borderSubtle overflow-hidden shadow-level-3 dark:shadow-level-1 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Photo container */}
                <div className="relative aspect-[16/10] bg-surfaceElevated overflow-hidden">
                  <img
                    src={primaryImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.condition && (
                      <Badge
                        variant={conditionVariants[item.condition] || "default"}
                      >
                        {item.condition.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-medium text-white shadow-sm">
                    ₹{Number(item.depositValue || 0).toLocaleString("en-IN")}{" "}
                    dep
                  </div>
                </div>

                {/* Content body */}
                <CardBody className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-textSecondary mb-1.5">
                      {item.category?.name}
                    </div>
                    <h3 className="font-display font-medium text-textPrimary text-base sm:text-lg leading-snug line-clamp-1 group-hover:opacity-75 transition-opacity">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-textSecondary line-clamp-2 mt-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and Location */}
                  <div className="pt-3 border-t border-borderSubtle flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold font-display text-textPrimary">
                        ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-textSecondary font-normal">
                        {" "}
                        / day
                      </span>
                    </div>

                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-textSecondary">
                        <MapPin className="w-3.5 h-3.5 text-textSecondary shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {item.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Owner & Trust Footer */}
                  {item.owner && (
                    <div className="flex items-center gap-2.5 pt-3 border-t border-borderSubtle/60 text-xs text-textSecondary">
                      {item.owner.avatarUrl ? (
                        <img
                          src={item.owner.avatarUrl}
                          alt={item.owner.name}
                          className="w-6 h-6 rounded-full object-cover border border-borderSubtle shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-textPrimary shrink-0">
                          {item.owner.name?.[0] || "U"}
                        </div>
                      )}
                      <span className="truncate font-medium text-textPrimary">
                        {item.owner.name}
                      </span>
                      <div className="ml-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{item.owner.reputationScore} trust</span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
