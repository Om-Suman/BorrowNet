import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Zap,
  Star,
  Heart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Package,
  Layers,
  ArrowRight,
  Share2,
  Lock,
} from 'lucide-react';
import { itemsApi, recommendationsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#f1f5f9"/><path d="M240 395l90-100 63 68 53-55 114 130H240z" fill="#cbd5e1"/><circle cx="315" cy="212" r="32" fill="#cbd5e1"/><rect x="180" y="135" width="440" height="330" rx="30" fill="none" stroke="#94a3b8" stroke-width="20"/></svg>'
)}`;

function formatDateToIso(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  // Selected image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Rental form dates & state
  const todayStr = useMemo(() => formatDateToIso(new Date()), []);
  const tomorrowStr = useMemo(() => formatDateToIso(addDaysToDate(new Date(), 1)), []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(tomorrowStr);
  const [borrowerNote, setBorrowerNote] = useState('');

  // 1. Fetch item details
  const {
    data: itemData,
    isLoading: isItemLoading,
    isError: isItemError,
    error: itemError,
  } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getById(id),
    staleTime: 1000 * 60 * 5,
  });

  const item = itemData?.data;

  // 2. Fetch availability ranges
  const { data: availabilityData } = useQuery({
    queryKey: ['item-availability', id],
    queryFn: () => itemsApi.getAvailability(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });

  const bookedRanges = useMemo(() => {
    return (availabilityData?.data?.bookedRanges || []).map((range) => ({
      start: new Date(range.startDate).getTime(),
      end: new Date(range.endDate).getTime(),
    }));
  }, [availabilityData]);

  // 3. Related items recommendation
  const { data: relatedData } = useQuery({
    queryKey: ['related-items', id],
    queryFn: () => recommendationsApi.related({ itemId: id, limit: 4 }),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

  const relatedItems = Array.isArray(relatedData?.data?.items) ? relatedData.data.items : [];

  // Duration calculation
  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [pickupDate, returnDate]);

  // Date conflict checker
  const isDateRangeBlocked = useMemo(() => {
    if (!pickupDate || !returnDate || rentalDays <= 0) return false;
    const reqStart = new Date(pickupDate).getTime();
    const reqEnd = new Date(returnDate).getTime();

    return bookedRanges.some((range) => {
      return reqStart < range.end && reqEnd > range.start;
    });
  }, [pickupDate, returnDate, bookedRanges, rentalDays]);

  // Pricing calculations
  const pricePerDay = Number(item?.pricePerDay || 0);
  const depositValue = Number(item?.depositValue || 0);
  const rentalSubtotal = pricePerDay * rentalDays;
  const platformFee = Math.round(rentalSubtotal * 0.05); // 5% community service fee
  const totalDueInEscrow = rentalSubtotal + platformFee + depositValue;

  // Preset quick duration selector (1d, 3d, 7d)
  const setQuickDuration = (days) => {
    const start = pickupDate ? new Date(pickupDate) : new Date();
    const end = addDaysToDate(start, days);
    setPickupDate(formatDateToIso(start));
    setReturnDate(formatDateToIso(end));
  };

  // Submit Borrow Request Mutation
  const borrowMutation = useMutation({
    mutationFn: (requestPayload) => itemsApi.createBorrowRequest(id, requestPayload),
    onSuccess: () => {
      toast.success('Your borrow request has been submitted to the lender!');
      queryClient.invalidateQueries({ queryKey: ['item-availability', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setBorrowerNote('');
      navigate('/dashboard');
    },
    onError: (err) => {
      const msg = err?.error?.message || err?.message || 'Unable to submit rental request.';
      toast.error(msg);
    },
  });

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to request gear.');
      navigate('/login');
      return;
    }

    if (item?.owner?.id === user?.id) {
      toast.warning('You cannot borrow your own listed equipment.');
      return;
    }

    if (rentalDays < (item?.minDays || 1)) {
      toast.warning(`Minimum rental period is ${item?.minDays || 1} day(s).`);
      return;
    }

    if (rentalDays > (item?.maxDays || 30)) {
      toast.warning(`Maximum rental period is ${item?.maxDays || 30} days.`);
      return;
    }

    if (isDateRangeBlocked) {
      toast.error('The selected dates overlap with an existing confirmed booking.');
      return;
    }

    borrowMutation.mutate({
      startDate: new Date(pickupDate).toISOString(),
      endDate: new Date(returnDate).toISOString(),
      note: borrowerNote.trim() || undefined,
    });
  };

  // Share link handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard!');
    }
  };

  // Loading state
  if (isItemLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 dark:bg-neutral-800 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] bg-slate-200 dark:bg-neutral-800 rounded-3xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-200 dark:bg-neutral-800 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 h-96 bg-slate-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (isItemError || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Item Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400">
          {itemError?.error?.message || 'This listing may have been unlisted, completed, or removed by its owner.'}
        </p>
        <Link to="/browse">
          <Button variant="primary">Browse Other Available Equipment</Button>
        </Link>
      </div>
    );
  }

  const galleryImages = (item.images && item.images.length > 0)
    ? item.images.map((img) => img.url)
    : [FALLBACK_IMAGE];

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];
  const owner = item.owner || {};
  const isOwner = user?.id === owner.id;

  return (
    <div className="space-y-12 pb-16">
      {/* ----------------------------------------------------------------- */}
      {/* BREADCRUMB & HEADER METADATA                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0c1222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400">
          <nav className="flex items-center gap-1.5 flex-wrap font-medium">
            <Link to="/browse" className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors">
              Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {item.category?.slug ? (
              <>
                <Link
                  to={`/browse?category=${item.category.slug}`}
                  className="hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors"
                >
                  {item.category.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : null}
            <span className="text-slate-900 dark:text-white truncate max-w-xs font-semibold">
              {item.title}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-semibold transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-semibold transition-all active:scale-95"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500 dark:text-neutral-300'
                }`}
              />
              <span>{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* =============================================================== */}
          {/* LEFT COLUMN: MEDIA GALLERY, SPECIFICATIONS & LENDER (7 cols)    */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 space-y-8">
            {/* Gallery Section */}
            <div className="space-y-3">
              {/* Main Feature Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-neutral-800 shadow-md group">
                <img
                  src={activeImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-[#006948] dark:text-[#68dba9] shadow-sm border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                    <span>Verified Gear</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold shadow-sm backdrop-blur-md">
                    <Zap className="w-3.5 h-3.5" />
                    <span>P2P Handover</span>
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#006948] dark:border-[#68dba9] scale-98 shadow-sm ring-2 ring-[#006948]/20'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-101'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Category & Quick Metrics */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] text-xs font-bold tracking-wider uppercase border border-emerald-500/30">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{item.category?.name || 'General Equipment'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  <span>{item.location || owner.location || 'Neighborhood pickup'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                  <span>Condition: <strong>{item.condition?.replace('_', ' ') || 'Good'}</strong></span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {item.title}
              </h1>

              {/* Trust & Lender badges row */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">
                    {owner.reputationScore ? (owner.reputationScore / 20).toFixed(1) : '5.0'}
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400 font-normal">
                    (Reputation score: {owner.reputationScore || 100})
                  </span>
                </div>
                <span>•</span>
                <div className="inline-flex items-center gap-1 text-[#006948] dark:text-[#68dba9] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Community Lender</span>
                </div>
                <span>•</span>
                <div className="inline-flex items-center gap-1 text-slate-600 dark:text-neutral-400 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{item.minDays}–{item.maxDays} days rental window</span>
                </div>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#006948] dark:text-[#68dba9]" />
                <span>Equipment Overview & Specifications</span>
              </h2>
              <p className="text-slate-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {item.description || 'No detailed description provided for this gear.'}
              </p>
            </div>

            {/* Lender Care Instructions & Handover Rules */}
            {item.rules && (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <h3 className="text-base font-display font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Lender Care Instructions & Handover Rules</span>
                </h3>
                <p className="text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed whitespace-pre-line">
                  {item.rules}
                </p>
              </div>
            )}

            {/* In-Person Handover & Location Details */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#006948] dark:text-[#68dba9]" />
                    <span>Pickup & Return Location</span>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
                    {item.location || owner.location || 'Bengaluru Local Area'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-xs font-semibold text-slate-600 dark:text-neutral-400 self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Exact pickup address unlocked after confirmation</span>
                </span>
              </div>

              {/* Location Card Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1222] border border-slate-200/70 dark:border-neutral-800 flex items-center gap-4 text-xs text-slate-600 dark:text-neutral-400">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] dark:bg-emerald-950/60 flex items-center justify-center text-[#006948] dark:text-[#68dba9] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">Direct Handover Protocol</p>
                  <p>Meet in-person with the lender to inspect item functionality, verify accessories, and inspect condition.</p>
                </div>
              </div>
            </div>

            {/* Lender Profile Card */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                    alt={owner.name || 'Lender'}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#006948]/20"
                  />
                  {owner.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#006948] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                      {owner.name || 'Verified Lender'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] text-[11px] font-bold">
                      Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    {owner.bio || 'Active peer-to-peer lender on BorrowNet.'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                    Based in {owner.location || 'Bengaluru'} • Member since {new Date(owner.createdAt || Date.now()).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 block">
                  Reputation Score
                </span>
                <span className="text-2xl font-display font-extrabold text-[#006948] dark:text-[#68dba9]">
                  {owner.reputationScore || 95}/100
                </span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT COLUMN: RENTAL BOOKING CARD (Sticky 5 cols)               */}
          {/* =============================================================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-700/80 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Daily Rate Header */}
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-neutral-800 pb-5">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                      ₹{pricePerDay.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-neutral-400">
                      / day
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    Refundable deposit: ₹{depositValue.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] text-xs font-bold border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Instant Booking</span>
                  </span>
                </div>
              </div>

              {/* Reservation Form */}
              <form onSubmit={handleReserveSubmit} className="space-y-5">
                {/* Dates Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                      <span>Rental Dates</span>
                    </span>
                    <span className="text-[#006948] dark:text-[#68dba9] font-extrabold">
                      {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        required
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006948] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                        Return Date
                      </label>
                      <input
                        type="date"
                        min={pickupDate || todayStr}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006948] outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400">Quick selectors:</span>
                    <div className="flex gap-1.5">
                      {[1, 3, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setQuickDuration(days)}
                          className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                            rentalDays === days
                              ? 'bg-[#006948] text-white border-[#006948]'
                              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border-transparent hover:bg-slate-200'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conflicting Date Alert */}
                {isDateRangeBlocked && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Dates are currently booked</p>
                      <p className="text-[11px] mt-0.5">
                        This equipment already has an active reservation for the chosen interval. Please select different dates.
                      </p>
                    </div>
                  </div>
                )}

                {/* Note to Lender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 flex items-center justify-between">
                    <span>Message to Lender (Optional)</span>
                    <span className="text-[10px] text-slate-400">Brief intended use</span>
                  </label>
                  <textarea
                    rows={2}
                    value={borrowerNote}
                    onChange={(e) => setBorrowerNote(e.target.value)}
                    placeholder="E.g., Weekend home renovation project, taking extra care of all bits..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none resize-none"
                  />
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>
                      ₹{pricePerDay.toLocaleString('en-IN')} × {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{rentalSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1">
                      <span>Community platform fee (5%)</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{platformFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/60">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-neutral-200">
                        Refundable Security Deposit
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                        Auto-released 24h after safe item return
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{depositValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        Total Due in Escrow
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Includes refundable deposit & protection
                      </span>
                    </div>
                    <span className="text-2xl font-display font-extrabold text-[#006948] dark:text-[#68dba9]">
                      ₹{totalDueInEscrow.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <Button
                  type="submit"
                  disabled={borrowMutation.isPending || isDateRangeBlocked || rentalDays <= 0 || isOwner}
                  isLoading={borrowMutation.isPending}
                  className="w-full py-3.5 text-sm font-bold shadow-md"
                >
                  {isOwner
                    ? 'This is your own listing'
                    : isDateRangeBlocked
                    ? 'Dates Unavailable'
                    : rentalDays <= 0
                    ? 'Select Valid Dates'
                    : 'Reserve Equipment'}
                </Button>

                <p className="text-center text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                  <span>Protected by BorrowNet Escrow & ₹50,000 Lender Guarantee</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* RELATED / RECOMMENDED EQUIPMENT SECTION                            */}
        {/* ----------------------------------------------------------------- */}
        {relatedItems.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 dark:border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  Related Equipment in this Category
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
                  Discover similar tools and kits nearby for your project.
                </p>
              </div>
              <Link
                to={`/browse?category=${item.category?.slug || ''}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#006948] dark:text-[#68dba9] hover:underline"
              >
                <span>View all in category</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relItem) => (
                <Link
                  key={relItem.id}
                  to={`/items/${relItem.id}`}
                  className="group bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                      <img
                        src={relItem.images?.[0]?.url || FALLBACK_IMAGE}
                        alt={relItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#006948] dark:text-[#68dba9]">
                        {relItem.category?.name || 'Equipment'}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#006948] dark:group-hover:text-[#68dba9] transition-colors">
                        {relItem.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                        {relItem.location || 'Bengaluru'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-neutral-800/80 mt-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      ₹{Number(relItem.pricePerDay || 0).toLocaleString('en-IN')}
                      <span className="text-[11px] font-normal text-slate-500"> / day</span>
                    </span>
                    <span className="text-xs font-semibold text-[#006948] dark:text-[#68dba9]">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

