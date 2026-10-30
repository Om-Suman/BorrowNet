import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  CameraOff,
  User,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
  Send,
  Check,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { transactionsApi, reviewsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

export default function TransactionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [roleFilter, setRoleFilter] = useState("all"); // "all" | "borrower" | "lender"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "returned" | "completed"

  // Action Modals State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const userId = user?.id;

  // 1. Fetch transactions
  const {
    data: transactionsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transactions", userId, roleFilter, statusFilter],
    queryFn: () => {
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;
      return transactionsApi.list(params);
    },
    enabled: Boolean(userId),
  });

  const transactions = Array.isArray(transactionsData?.data) ? transactionsData.data : [];

  // Filter by status on client side
  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") {
      return ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(tx.status);
    }
    if (statusFilter === "returned") {
      return tx.status === "RETURNED";
    }
    if (statusFilter === "completed") {
      return tx.status === "COMPLETED";
    }
    return true;
  });

  // Calculate metrics
  const activeCount = transactions.filter((tx) =>
    ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(tx.status)
  ).length;
  const returnedCount = transactions.filter((tx) => tx.status === "RETURNED").length;
  const completedCount = transactions.filter((tx) => tx.status === "COMPLETED").length;

  // 2. Mark Returned Mutation
  const markReturnedMutation = useMutation({
    mutationFn: (txId) => transactionsApi.markReturned(txId),
    onSuccess: () => {
      toast.success("Equipment marked as returned! Awaiting lender sign-off.");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setReturnModalOpen(false);
      setSelectedTx(null);
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to mark return.");
    },
  });

  // 3. Complete Mutation (Lender only)
  const completeMutation = useMutation({
    mutationFn: (txId) => transactionsApi.complete(txId),
    onSuccess: (_, txId) => {
      toast.success("Rental finalized! Escrow released.");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setCompleteModalOpen(false);

      // Prompt for review
      if (selectedTx) {
        setRating(5);
        setComment("");
        setReviewModalOpen(true);
      }
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to complete transaction.");
    },
  });

  // 4. Create Review Mutation
  const reviewMutation = useMutation({
    mutationFn: ({ txId, data }) => reviewsApi.create(txId, data),
    onSuccess: (res) => {
      toast.success("Review submitted! Thank you for supporting the community.");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setReviewModalOpen(false);
      setSelectedTx(null);
      setComment("");
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to submit review.");
    },
  });

  // Modal handlers
  const handleOpenReturnModal = (tx) => {
    setSelectedTx(tx);
    setReturnModalOpen(true);
  };

  const handleOpenCompleteModal = (tx) => {
    setSelectedTx(tx);
    setCompleteModalOpen(true);
  };

  const handleOpenReviewModal = (tx) => {
    setSelectedTx(tx);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!selectedTx) return;
    markReturnedMutation.mutate(selectedTx.id);
  };

  const handleConfirmComplete = () => {
    if (!selectedTx) return;
    completeMutation.mutate(selectedTx.id);
  };

  const handleConfirmReview = (e) => {
    e.preventDefault();
    if (!selectedTx) return;
    reviewMutation.mutate({
      txId: selectedTx.id,
      data: { rating: Number(rating), comment: comment.trim() || undefined },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
              Peer-to-Peer Rental Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Active Rentals & Return Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Track equipment in use, manage return confirmations, and release escrow deposits safely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl h-10 px-4">
              Dashboard
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="primary" size="sm" className="text-xs font-bold rounded-xl h-10 px-4">
              Borrow Gear
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active In-Use Rentals
            </span>
            <span className="text-3xl font-display font-black text-[#006948] dark:text-[#68dba9] mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Returned & Awaiting Sign-off
            </span>
            <span className="text-3xl font-display font-black text-amber-500 mt-1 block">
              {returnedCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Successfully Completed
            </span>
            <span className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1 block">
              {completedCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Role Toggle Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-neutral-800 p-3 shadow-xs">
        {/* Role Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-neutral-800 text-xs font-bold">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              roleFilter === "all"
                ? "bg-white dark:bg-[#0c1222] text-[#006948] dark:text-[#68dba9] shadow-xs font-black"
                : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
            }`}
          >
            All Rentals ({transactions.length})
          </button>
          <button
            onClick={() => setRoleFilter("borrower")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              roleFilter === "borrower"
                ? "bg-white dark:bg-[#0c1222] text-[#006948] dark:text-[#68dba9] shadow-xs font-black"
                : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
            }`}
          >
            I Borrowed
          </button>
          <button
            onClick={() => setRoleFilter("lender")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              roleFilter === "lender"
                ? "bg-white dark:bg-[#0c1222] text-[#006948] dark:text-[#68dba9] shadow-xs font-black"
                : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
            }`}
          >
            My Equipment Lent
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "All Statuses" },
            { id: "active", label: "Active & Ongoing" },
            { id: "returned", label: "Awaiting Confirmation" },
            { id: "completed", label: "Completed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                statusFilter === st.id
                  ? "bg-[#006948] text-white shadow-xs"
                  : "bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 hover:border-slate-300"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-neutral-800" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Failed to load transactions
            </h3>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No rentals found
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto mt-1">
                {statusFilter !== "all" || roleFilter !== "all"
                  ? "Try adjusting your filters to see more rentals."
                  : "Once borrow requests are approved by lenders, active transactions with return tracking will appear here."}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/browse">
                <Button variant="primary" size="sm" className="text-xs font-bold">
                  Browse Gear Catalog
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" className="text-xs font-bold">
                  View Requests
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isBorrower = tx.borrowerId === userId;
            const isLender = tx.lenderId === userId;
            const otherParty = isBorrower ? tx.lender : tx.borrower;
            const otherPartyRole = isBorrower ? "Lender" : "Borrower";

            const hasPhoto = Array.isArray(tx.item?.images) && tx.item.images.length > 0;
            const photoUrl = hasPhoto ? tx.item.images[0].url || tx.item.images[0] : null;

            const scheduledPickup = tx.scheduledPickupAt
              ? new Date(tx.scheduledPickupAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : null;
            const scheduledReturn = tx.scheduledReturnAt
              ? new Date(tx.scheduledReturnAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            // Status Badge Helpers
            const isReturned = tx.status === "RETURNED";
            const isCompleted = tx.status === "COMPLETED";
            const isActive = ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(
              tx.status
            );

            return (
              <div
                key={tx.id}
                className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs hover:border-slate-300 dark:hover:border-neutral-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Item & Counterparty Info */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Item Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 border border-slate-200 dark:border-neutral-800 shrink-0 overflow-hidden relative">
                    {hasPhoto ? (
                      <img
                        src={photoUrl}
                        alt={tx.item?.title || "Equipment"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                        <CameraOff className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Item & User Details */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Pill */}
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/60">
                          Active Rental
                        </span>
                      )}
                      {isReturned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                          Returned • Awaiting Final Sign-Off
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                          Completed
                        </span>
                      )}

                      <span className="text-[11px] font-bold text-slate-400">
                        {isBorrower ? "You are Borrowing" : "You Lent this Gear"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {tx.item?.title || "Equipment Rental"}
                    </h3>

                    {/* Counterparty avatar & name */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                      <span>{otherPartyRole}:</span>
                      <Link
                        to={otherParty?.id ? `/users/${otherParty.id}` : "#"}
                        className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-neutral-200 hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] overflow-hidden">
                          {otherParty?.avatarUrl ? (
                            <img src={otherParty.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            otherParty?.name?.charAt(0) || <User className="w-3 h-3" />
                          )}
                        </div>
                        <span>{otherParty?.name || "Community Member"}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Middle: Timeline & Dates */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 lg:px-6 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-neutral-800 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Rental Period
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-neutral-200">
                      <Calendar className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                      <span>
                        {scheduledPickup || "Pickup"} — {scheduledReturn || "Return"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Rent Total
                    </span>
                    <span className="text-sm font-extrabold text-[#006948] dark:text-[#68dba9] block">
                      ₹{Number(tx.rentTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  {/* 1. Mark as Returned Action (Borrower or Lender when Active) */}
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(tx)}
                      className="px-4 py-2.5 rounded-2xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Returned</span>
                    </button>
                  )}

                  {/* 2. Confirm Return & Finalize (Lender only when RETURNED) */}
                  {isReturned && isLender && (
                    <button
                      type="button"
                      onClick={() => handleOpenCompleteModal(tx)}
                      className="px-4 py-2.5 rounded-2xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Complete Rental</span>
                    </button>
                  )}

                  {/* Awaiting Lender note when Returned and current user is Borrower */}
                  {isReturned && isBorrower && (
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/50">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lender verifying condition</span>
                    </div>
                  )}

                  {/* 3. Leave Review when Completed */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(tx)}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-neutral-700 hover:border-[#006948] bg-slate-50 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Review Experience</span>
                    </button>
                  )}

                  {/* View Item link */}
                  {tx.itemId && (
                    <Link to={`/items/${tx.itemId}`}>
                      <button
                        type="button"
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 transition-colors"
                        title="View Item Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. Mark as Returned Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        size="md"
        title="Confirm Equipment Return"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#006948] shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              Confirm that <strong>{selectedTx?.item?.title}</strong> has been handed back in good
              operational condition with all accessories included.
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Once marked as returned, the lender will inspect the gear and confirm completion to
            release the escrow deposit.
          </p>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => setReturnModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={markReturnedMutation.isPending}
              isLoading={markReturnedMutation.isPending}
              className="flex-1 text-xs font-bold"
              onClick={handleConfirmReturn}
            >
              Confirm Return
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Complete Transaction Modal (Lender) */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        size="md"
        title="Finalize Rental & Release Escrow"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
            Have you received <strong>{selectedTx?.item?.title}</strong> back from{" "}
            <strong>{selectedTx?.borrower?.name}</strong> and verified it is undamaged?
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">
              What happens next:
            </span>
            <span>• The rental status changes to Completed.</span>
            <br />
            <span>• Escrow deposit hold is released.</span>
            <br />
            <span>• Both you and the borrower can leave a public reputation review.</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => setCompleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={completeMutation.isPending}
              isLoading={completeMutation.isPending}
              className="flex-1 text-xs font-bold"
              onClick={handleConfirmComplete}
            >
              Confirm & Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Leave Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        size="md"
        title="Leave a Community Review"
      >
        <form onSubmit={handleConfirmReview} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider block mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300 dark:text-neutral-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-extrabold text-slate-700 dark:text-neutral-300 ml-2">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider block">
              Your Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the equipment condition and handover experience?"
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => setReviewModalOpen(false)}
            >
              Skip
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={reviewMutation.isPending}
              isLoading={reviewMutation.isPending}
              className="flex-1 text-xs font-bold"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}