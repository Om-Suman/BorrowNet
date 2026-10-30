import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Package,
  CameraOff,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { usersApi, reviewsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("items"); // "items" | "reviews"

  const isOwnProfile = currentUser?.id === id;

  // 1. Fetch user public profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => usersApi.getPublicProfile(id),
    enabled: Boolean(id),
  });

  const profile = profileData?.data;

  // 2. Fetch user's listed items
  const {
    data: itemsData,
    isLoading: isItemsLoading,
  } = useQuery({
    queryKey: ["user-items", id],
    queryFn: () => usersApi.getUserItems(id),
    enabled: Boolean(id),
  });

  const items = Array.isArray(itemsData?.data) ? itemsData.data : [];
  const activeItems = items.filter((item) => item.status === "ACTIVE" || isOwnProfile);

  // 3. Fetch user's received reviews
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
  } = useQuery({
    queryKey: ["user-reviews", id],
    queryFn: () => reviewsApi.listByUser(id),
    enabled: Boolean(id),
  });

  const reviews = Array.isArray(reviewsData?.data) ? reviewsData.data : [];

  // Calculate review score averages
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : profile?.reputationScore
      ? (profile.reputationScore / 20).toFixed(1)
      : "5.0";

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-44 bg-slate-200 dark:bg-neutral-800 rounded-3xl" />
        <div className="h-96 bg-slate-200 dark:bg-neutral-800 rounded-3xl" />
      </div>
    );
  }

  // Error / Not found state
  if (isProfileError || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          The member profile you are looking for does not exist or has been disabled.
        </p>
        <Link to="/browse">
          <Button variant="primary" size="sm">
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  const memberSinceYear = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Community Member";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006948] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#006948]/10 text-[#006948] dark:text-[#68dba9] border-2 border-emerald-500/20 flex items-center justify-center font-display font-black text-2xl sm:text-3xl shrink-0 overflow-hidden shadow-xs">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  Verified Neighbor
                </span>
                {isOwnProfile && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                    Your Profile
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                {profile.bio || "Active local peer lender helping neighbors share quality equipment safely."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {memberSinceYear}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Reputation & Trust Badges */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-neutral-800">
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Star className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                  Reputation Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {profile.reputationScore ?? 100}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                  <span className="text-xs font-bold text-amber-500 ml-1.5">
                    ★ {avgRating} ({totalReviews})
                  </span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl px-4">
                  Manage Gear & Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "items"
              ? "border-[#006948] text-[#006948] dark:text-[#68dba9]"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Available Gear ({activeItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "reviews"
              ? "border-[#006948] text-[#006948] dark:text-[#68dba9]"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Verified Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab 1: Available Gear */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {isItemsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-neutral-800" />
              ))}
            </div>
          ) : activeItems.length === 0 ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No active listings currently
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                {profile.name} does not have any active gear available for rental right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeItems.map((item) => {
                const hasPhoto = Array.isArray(item.images) && item.images.length > 0;
                const photoUrl = hasPhoto
                  ? typeof item.images[0] === "string"
                    ? item.images[0]
                    : item.images[0].url
                  : null;

                return (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="group bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
                        {hasPhoto ? (
                          <img
                            src={photoUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <CameraOff className="w-7 h-7 text-slate-400 mx-auto mb-1" />
                            <span className="text-[10px] font-semibold text-slate-400">
                              No photo provided
                            </span>
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-[#006948] dark:text-[#68dba9] shadow-xs">
                          {item.category?.name || "Equipment"}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                          ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}/day
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-neutral-800/40 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-neutral-400 truncate max-w-[140px]">
                        {item.location || "Bengaluru"}
                      </span>
                      <span className="font-bold text-[#006948] dark:text-[#68dba9] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Verified Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-black text-2xl shadow-xs">
                {avgRating}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(avgRating))
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-neutral-400 mt-1 block">
                  Based on {totalReviews} verified rental review{totalReviews !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006948]" />
              <span>Reviews can only be submitted after transaction completion.</span>
            </div>
          </div>

          {/* Reviews List */}
          {isReviewsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-28 rounded-3xl bg-slate-200 dark:bg-neutral-800" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-12 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No reviews yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                {profile.name} hasn't received reviews yet. Be among the first neighbors to borrow
                gear from them!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => {
                const reviewDate = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={rev.id}
                    className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-neutral-300 overflow-hidden">
                          {rev.reviewer?.avatarUrl ? (
                            <img
                              src={rev.reviewer.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            rev.reviewer?.name?.charAt(0) || <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {rev.reviewer?.name || "Verified Neighbor"}
                            </span>
                            <span className="text-[10px] font-bold text-[#006948] dark:text-[#68dba9] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              Verified Rental
                            </span>
                          </div>
                          {reviewDate && (
                            <span className="text-[11px] text-slate-400">{reviewDate}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (rev.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-neutral-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed italic bg-slate-50/60 dark:bg-neutral-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-neutral-800/60">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}