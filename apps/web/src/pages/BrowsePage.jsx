import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { categoriesApi, itemsApi } from "../api/endpoints";
import useDebounce from "../hooks/useDebounce";
import FormInput from "../components/ui/FormInput";
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
    NEW: "success",
    LIKE_NEW: "info",
    GOOD: "default",
    FAIR: "warning",
    POOR: "danger",
  };

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Browse Equipment
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            {isItemsLoading
              ? "Discovering available gear..."
              : `${totalItems} items available for borrow`}
          </p>
        </div>
        <div className="w-full md:w-80 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-textSecondary" />
          </div>
          <FormInput
            type="text"
            placeholder="Search cameras, tools, tents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!categorySlug ? "bg-accent text-white" : "bg-surfaceElevated text-textSecondary hover:text-white border border-borderSubtle"}`}
        >
          All Equipment
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${categorySlug === cat.slug ? "bg-accent text-white" : "bg-surfaceElevated text-textSecondary hover:text-white border border-borderSubtle"}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isItemsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-borderSubtle rounded-lg p-4 space-y-3"
            >
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="text" />
              <LoadingSkeleton variant="text" count={2} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-borderSubtle rounded-xl border-dashed max-w-lg mx-auto p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium text-white mb-2">
            No equipment found
          </h3>
          <p className="text-sm text-textSecondary mb-6">
            We couldn't find anything matching your search criteria. Try a
            different search term or category.
          </p>
          <Button variant="secondary" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const primaryImage =
              item.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80";
            return (
              <Card
                key={item.id}
                hoverable
                className="flex flex-col h-full group"
              >
                <div className="relative aspect-[4/3] bg-surfaceElevated overflow-hidden">
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
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {item.condition && (
                      <Badge
                        variant={conditionVariants[item.condition] || "default"}
                      >
                        {item.condition.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono font-medium text-white">
                    ₹{Number(item.depositValue || 0).toLocaleString("en-IN")}{" "}
                    dep
                  </div>
                </div>

                <CardBody className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
                      {item.category?.name}
                    </div>
                    <h3 className="font-display font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-textSecondary line-clamp-2 mt-1.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-borderSubtle flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold font-display text-accent">
                        ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-textSecondary"> / day</span>
                    </div>

                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-textSecondary">
                        <MapPin className="w-3.5 h-3.5 text-textSecondary" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  {item.owner && (
                    <div className="flex items-center gap-2 pt-2 text-xs text-textSecondary">
                      {item.owner.avatarUrl ? (
                        <img
                          src={item.owner.avatarUrl}
                          alt={item.owner.name}
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-surfaceElevated flex items-center justify-center text-[10px] text-white">
                          {item.owner.name?.[0] || "U"}
                        </div>
                      )}
                      <span className="truncate">{item.owner.name}</span>
                      <div className="ml-auto flex items-center gap-1 text-trust font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{item.owner.reputationScore}</span>
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
