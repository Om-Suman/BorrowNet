import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Calendar,
  Layers,
  MapPin,
  Ban,
  ThumbsUp,
  Inbox,
  Send,
  Package,
  Edit3,
  Plus,
  CameraOff,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Card, { CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { requestsApi, transactionsApi, usersApi } from "../api/endpoints";

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("borrower"); // "borrower" (My Requests) | "lender" (Incoming)

  // Decline/Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestToReject, setSelectedRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Queries bound to the authenticated user ID so cache is isolated per user
  const userId = user?.id || "guest";

  const { data: myItemsData } = useQuery({
    queryKey: ["my-items", userId],
    queryFn: usersApi.getMyItems,
    enabled: Boolean(user?.id),
  });

  const { data: borrowerRequestsData } = useQuery({
    queryKey: ["requests", "borrower", userId],
    queryFn: () => requestsApi.list({ role: "borrower" }),
    enabled: Boolean(user?.id),
  });

  const { data: lenderRequestsData } = useQuery({
    queryKey: ["requests", "lender", userId],
    queryFn: () => requestsApi.list({ role: "lender" }),
    enabled: Boolean(user?.id),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => transactionsApi.list(),
    enabled: Boolean(user?.id),
  });

  const myItems = Array.isArray(myItemsData?.data) ? myItemsData.data : [];
  const borrowerRequests = Array.isArray(borrowerRequestsData?.data)
    ? borrowerRequestsData.data
    : [];
  const lenderRequests = Array.isArray(lenderRequestsData?.data)
    ? lenderRequestsData.data
    : [];
  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : [];

  const pendingIncoming = lenderRequests.filter((r) => r.status === "PENDING");
  const pendingOutgoing = borrowerRequests.filter((r) => r.status === "PENDING");
  const activeBorrows = transactions.filter((t) =>
    ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(
      t.status
    )
  );

  // Mutations for Request Actions
  // 1. Borrower Withdraw/Cancel
  const cancelMutation = useMutation({
    mutationFn: (requestId) => requestsApi.cancel(requestId),
    onSuccess: () => {
      toast.success("Request withdrawn successfully.");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to withdraw request.");
    },
  });

  // 2. Lender Approve
  const approveMutation = useMutation({
    mutationFn: (requestId) => requestsApi.approve(requestId),
    onSuccess: () => {
      toast.success("Borrow request approved! Active transaction created.");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to approve request.");
    },
  });

  // 3. Lender Reject / Decline
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => requestsApi.reject(requestId, reason),
    onSuccess: () => {
      toast.info("Request declined.");
      setRejectModalOpen(false);
      setSelectedRequestToReject(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to decline request.");
    },
  });

  const handleOpenRejectModal = (request) => {
    setSelectedRequestToReject(request);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedRequestToReject) return;
    rejectMutation.mutate({
      requestId: selectedRequestToReject.id,
      reason: rejectReason.trim() || undefined,
    });
  };

  const currentRequestsList =
    activeTab === "borrower" ? borrowerRequests : lenderRequests;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1 text-sm">
            Welcome back, <strong className="text-slate-900 dark:text-white">{user?.name}</strong>! Manage your borrowing requests, active rentals, and listed gear.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {user?.id && (
            <Link to={`/users/${user.id}`}>
              <Button variant="secondary" className="text-xs font-bold flex items-center gap-1.5 border-slate-300 dark:border-neutral-700">
                <User className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
                <span>My Public Profile</span>
              </Button>
            </Link>
          )}
          <Link to="/browse">
            <Button variant="secondary" className="text-xs font-bold">
              Browse Equipment
            </Button>
          </Link>
          <Link to="/items/new">
            <Button variant="primary" className="text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>List an Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/transactions" className="block group">
          <Card className="rounded-2xl border border-slate-200 dark:border-neutral-800 group-hover:border-[#006948] transition-all">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                  Active Rentals
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006948] transition-colors" />
              </div>
              <div className="text-3xl font-display font-extrabold text-[#006948] dark:text-[#68dba9] mt-1">
                {activeBorrows.length}
              </div>
            </CardBody>
          </Card>
        </Link>

        <Card className="rounded-2xl border border-slate-200 dark:border-neutral-800">
          <CardBody>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              Incoming to Review
            </div>
            <div className="text-3xl font-display font-extrabold text-[#006948] dark:text-[#68dba9] mt-1">
              {pendingIncoming.length}
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-neutral-800">
          <CardBody>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              Pending Outgoing
            </div>
            <div className="text-3xl font-display font-extrabold text-amber-500 mt-1">
              {pendingOutgoing.length}
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-neutral-800">
          <CardBody>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              Reputation Score
            </div>
            <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              {user?.reputationScore ?? 100}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Active Rentals Quick Access Banner */}
      {activeBorrows.length > 0 && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                You have {activeBorrows.length} active rental{activeBorrows.length > 1 ? "s" : ""} in progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Mark gear as returned, inspect condition, and confirm completion in the rentals ledger.
              </p>
            </div>
          </div>

          <Link to="/transactions" className="shrink-0">
            <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span>View Rentals & Return Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main Request Management Section */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#006948] dark:text-[#68dba9]" />
              <span>Rental Requests & Approvals</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Review, withdraw, or approve peer-to-peer gear requests.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-neutral-800/80 self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab("borrower")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeTab === "borrower"
                  ? "bg-white dark:bg-[#0c1222] text-[#006948] dark:text-[#68dba9] shadow-sm font-extrabold"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>My Requests ({borrowerRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("lender")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeTab === "lender"
                  ? "bg-white dark:bg-[#0c1222] text-[#006948] dark:text-[#68dba9] shadow-sm font-extrabold"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming as Lender ({lenderRequests.length})</span>
              {pendingIncoming.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Requests List */}
        {currentRequestsList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">
              {activeTab === "borrower"
                ? "You haven't requested any equipment yet."
                : "No incoming borrow requests for your listings right now."}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === "borrower"
                ? "Find gear in your neighborhood, select rental dates, and reserve instantly."
                : "When neighbors request to borrow your tools, their requests will appear here for one-click approval."}
            </p>
            {activeTab === "borrower" && (
              <Link to="/browse">
                <Button variant="primary" className="text-xs font-bold mt-2">
                  Find Equipment to Borrow
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentRequestsList.map((req) => {
              const isPending = req.status === "PENDING";
              const isApproved = req.status === "APPROVED";
              const isRejected = req.status === "REJECTED";
              const isCancelled = req.status === "CANCELLED";

              const itemTitle = req.item?.title || "Equipment";
              const itemImage = req.item?.images?.[0]?.url;
              const formattedStart = new Date(req.startDate).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedEnd = new Date(req.endDate).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-700">
                      {itemImage ? (
                        <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/items/${req.itemId}`}
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#006948] dark:hover:text-[#68dba9] transition-colors"
                        >
                          {itemTitle}
                        </Link>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Approval</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9] text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800/60 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Declined</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 text-[10px] font-bold inline-flex items-center gap-1">
                            <span>Withdrawn</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedStart} → {formattedEnd} ({req.totalDays} days)</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-neutral-300">
                          ₹{Number(req.rentTotal || 0).toLocaleString("en-IN")} rent + ₹{Number(req.estimatedDeposit || 0).toLocaleString("en-IN")} deposit
                        </span>
                        {/* Tab-specific participant tag */}
                        {activeTab === "borrower" && (
                          <>
                            <span>•</span>
                            <span>
                              Lender:{" "}
                              <Link
                                to={req.item?.owner?.id ? `/users/${req.item.owner.id}` : "#"}
                                className="font-bold text-slate-800 dark:text-neutral-200 hover:text-[#006948] dark:hover:text-[#68dba9] hover:underline transition-colors"
                              >
                                {req.item?.owner?.name || "Equipment Owner"}
                              </Link>
                            </span>
                            {isApproved && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                (Approved by{" "}
                                <Link
                                  to={req.item?.owner?.id ? `/users/${req.item.owner.id}` : "#"}
                                  className="hover:underline"
                                >
                                  {req.item?.owner?.name || "Lender"}
                                </Link>
                                )
                              </span>
                            )}
                          </>
                        )}
                        {activeTab === "lender" && (
                          <>
                            <span>•</span>
                            <span>
                              Requested by:{" "}
                              <Link
                                to={req.borrower?.id ? `/users/${req.borrower.id}` : "#"}
                                className="font-bold text-slate-800 dark:text-neutral-200 hover:text-[#006948] dark:hover:text-[#68dba9] hover:underline transition-colors"
                              >
                                {req.borrower?.name || "Neighbor"}
                              </Link>
                            </span>
                            {req.borrower?.reputationScore !== undefined && (
                              <span className="text-amber-500 font-semibold">
                                ★ {(req.borrower.reputationScore / 20).toFixed(1)}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {req.note && (
                        <p className="text-xs text-slate-600 dark:text-neutral-300 italic bg-slate-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-slate-200/50 dark:border-neutral-800 mt-1">
                          "{req.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Borrower View: Withdraw Button */}
                    {activeTab === "borrower" && isPending && (
                      <button
                        onClick={() => cancelMutation.mutate(req.id)}
                        disabled={cancelMutation.isPending}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Withdraw Request</span>
                      </button>
                    )}

                    {/* Lender View: Approve & Decline Buttons */}
                    {activeTab === "lender" && isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenRejectModal(req)}
                          disabled={rejectMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline / Withdraw</span>
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending}
                          className="px-4 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#005137] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Handover</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Equipment Listings Section */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#006948] dark:text-[#68dba9]" />
              <span>My Equipment Inventory ({myItems.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Manage your published listings, update pricing, or edit gear specifications.
            </p>
          </div>

          <Link to="/items/new">
            <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>List New Gear</span>
            </Button>
          </Link>
        </div>

        {myItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">
              You haven't listed any equipment yet.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Put your idle tools, cameras, and camping gear to work and start earning peer-to-peer rental income.
            </p>
            <Link to="/items/new">
              <Button variant="primary" className="text-xs font-bold mt-2">
                List Your First Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myItems.map((item) => {
              const hasCover = Array.isArray(item.images) && item.images.length > 0;
              const coverUrl = hasCover ? (typeof item.images[0] === "string" ? item.images[0] : item.images[0].url) : null;
              const isPaused = item.status === "PAUSED";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-neutral-700 transition-all shadow-sm group"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                      {hasCover ? (
                        <img
                          src={coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-neutral-800 flex flex-col items-center justify-center text-slate-400 gap-1">
                          <CameraOff className="w-6 h-6 text-slate-400" />
                          <span className="text-[10px] font-semibold text-slate-400">No image</span>
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-[#006948] dark:text-[#68dba9] shadow-sm">
                          {item.category?.name || "Equipment"}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                            isPaused
                              ? "bg-amber-500 text-slate-950"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isPaused ? "Paused" : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                        {item.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-neutral-400 truncate max-w-[130px]">
                          {item.location || "Bengaluru"}
                        </span>
                        <span className="font-extrabold text-[#006948] dark:text-[#68dba9]">
                          ₹{Number(item.pricePerDay || 0).toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-neutral-800/60 border-t border-slate-200 dark:border-neutral-800 flex items-center gap-2">
                    <Link to={`/items/${item.id}`} className="flex-1">
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold transition-all"
                      >
                        View Item
                      </button>
                    </Link>
                    <Link to={`/items/${item.id}/edit`} className="flex-1">
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lender Decline / Withdraw Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        size="sm"
        title="Decline Borrow Request"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-neutral-400">
            Are you sure you want to decline this request for{" "}
            <strong>{selectedRequestToReject?.item?.title}</strong>?
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Equipment undergoing maintenance, dates conflict with personal project..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
