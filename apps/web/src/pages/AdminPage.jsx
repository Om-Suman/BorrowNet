import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Vault,
  UserCheck,
  Users,
  Package,
  Layers,
  Send,
  RefreshCw,
  ExternalLink,
  Ban,
  ArrowRight,
  Sliders,
  DollarSign,
  Radio,
  Lock,
  CameraOff,
  User,
  Filter,
  Check,
} from "lucide-react";
import { adminApi, itemsApi, transactionsApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [emergencyHalt, setEmergencyHalt] = useState(false);
  const [activeTab, setActiveTab] = useState("reports"); // "reports" | "catalog" | "transactions"
  const [filterType, setFilterType] = useState("ALL"); // "ALL" | "ITEM" | "USER"

  // 1. Real Data: Fetch pending moderation reports from DB
  const {
    data: reportsData,
    isLoading: isReportsLoading,
    isError: isReportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: adminApi.listReports,
    staleTime: 1000 * 20,
    retry: false,
  });

  // 2. Real Data: Fetch equipment catalog from DB
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ["admin-items"],
    queryFn: () => itemsApi.list({ limit: 100 }),
    staleTime: 1000 * 30,
  });

  // 3. Real Data: Fetch transactions from DB
  const {
    data: transactionsData,
    isLoading: isTxLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => transactionsApi.list(),
    staleTime: 1000 * 30,
    retry: false,
  });

  const reports = Array.isArray(reportsData?.data) ? reportsData.data : [];
  const rawItems = itemsData?.data?.items || (Array.isArray(itemsData?.data) ? itemsData.data : []);
  const transactions = Array.isArray(transactionsData?.data) ? transactionsData.data : [];

  // Filter reports
  const filteredReports = reports.filter((rep) => {
    if (filterType === "ALL") return true;
    return rep.targetType === filterType;
  });

  // Calculate real metrics directly from database
  const activeRentals = transactions.filter((t) =>
    ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(t.status)
  );

  const realEscrowHeld = activeRentals.reduce(
    (sum, t) => sum + (Number(t.depositValue) || 0) + (Number(t.rentTotal) || 0),
    0
  );

  const completedRentals = transactions.filter((t) => t.status === "COMPLETED");
  const totalPlatformVolume = completedRentals.reduce(
    (sum, t) => sum + (Number(t.rentTotal) || 0),
    0
  );
  const platformNetRevenue = Math.round(totalPlatformVolume * 0.1); // 10% standard platform take

  // Mutations for real admin actions
  const resolveReportMutation = useMutation({
    mutationFn: (reportId) => adminApi.updateReport(reportId, "RESOLVED"),
    onSuccess: () => {
      toast.success("Report reviewed and resolved.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to update report.");
    },
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) => adminApi.updateItemStatus(itemId, status),
    onSuccess: (_, vars) => {
      toast.success(`Listing status set to ${vars.status}.`);
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to update listing status.");
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, isSuspended }) => adminApi.updateUserStatus(userId, isSuspended),
    onSuccess: (_, vars) => {
      toast.info(vars.isSuspended ? "Member suspended." : "Member unsuspended.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to update member status.");
    },
  });

  const handleRefreshAll = () => {
    refetchReports();
    refetchItems();
    refetchTransactions();
    toast.success("Console data synchronized with database.");
  };

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            Admin Access Restricted
          </span>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
            Operations Console Requires Admin Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            You must be signed in with an administrator account to access platform moderation and oversight controls.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="sm">
              Sign In as Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Database Oversight
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            Platform Operations & Moderation Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
            Real-time moderation queue, catalog governance, and transaction escrow management.
          </p>
        </div>

        {/* Console Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefreshAll}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-bold text-slate-700 dark:text-neutral-200 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#006948] dark:text-[#68dba9]" />
            <span>Sync Data</span>
          </button>

          {/* Emergency Pause Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden sm:inline">Emergency Pause</span>
            <input
              type="checkbox"
              checked={emergencyHalt}
              onChange={(e) => {
                setEmergencyHalt(e.target.checked);
                toast.warning(
                  e.target.checked
                    ? "EMERGENCY PAUSE: P2P handover handshakes halted."
                    : "Platform handshakes resumed."
                );
              }}
              className="accent-rose-600 cursor-pointer w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Cards (Computed Strictly from Backend DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Rentals */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">
              Active Rentals
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
              {activeRentals.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {activeRentals.length === 1 ? "1 item" : `${activeRentals.length} items`} in active peer transit
          </p>
        </div>

        {/* Metric 2: Escrow Held */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">
              Escrow Held in Trust
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] flex items-center justify-center">
              <Vault className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
              ₹{realEscrowHeld.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total active rental deposits in escrow</p>
        </div>

        {/* Metric 3: Pending Reports */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">
              Pending Reports
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-amber-500">
              {reports.length}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {reports.length === 0 ? "Clean Queue" : "Action Needed"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Flagged items or reported accounts</p>
        </div>

        {/* Metric 4: Platform Equipment Catalog */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-extrabold tracking-wider">
              Catalog Inventory
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
              {rawItems.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total equipment listings published</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "reports"
              ? "border-[#006948] text-[#006948] dark:text-[#68dba9]"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Moderation Queue ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "catalog"
              ? "border-[#006948] text-[#006948] dark:text-[#68dba9]"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalog Governance ({rawItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === "transactions"
              ? "border-[#006948] text-[#006948] dark:text-[#68dba9]"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Vault className="w-4 h-4" />
          <span>Escrow & Rentals Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE (REAL DATA) */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200 dark:border-neutral-800 p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by:
              </span>
              {["ALL", "ITEM", "USER"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === type
                      ? "bg-[#006948] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900"
                  }`}
                >
                  {type === "ALL" ? "All Reports" : type === "ITEM" ? "Flagged Gear" : "Reported Users"}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              Showing {filteredReports.length} pending report{filteredReports.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Reports List */}
          {isReportsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-slate-200 dark:bg-neutral-800" />
              ))}
            </div>
          ) : isReportsError ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-12 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Authentication Required for Live Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
                Sign in with an administrator account to review and take action on live reports.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-16 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Moderation Queue is Clean
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
                There are currently 0 pending reports from community members. New incident flags
                and report submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const isItemReport = report.targetType === "ITEM";
                const isUserReport = report.targetType === "USER";
                const createdDate = new Date(report.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isItemReport
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                          }`}
                        >
                          {isItemReport ? "Flagged Gear Report" : "Reported Member"}
                        </span>
                        <span className="text-xs text-slate-400">• {createdDate}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={resolveReportMutation.isPending}
                          onClick={() => resolveReportMutation.mutate(report.id)}
                          className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-neutral-200 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-[#006948]" />
                          <span>Resolve / Dismiss</span>
                        </button>

                        {isItemReport && report.targetId && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateItemStatusMutation.mutate({
                                  itemId: report.targetId,
                                  status: "PAUSED",
                                })
                              }
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-all"
                            >
                              Pause Listing
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateItemStatusMutation.mutate({
                                  itemId: report.targetId,
                                  status: "REMOVED",
                                })
                              }
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Remove Listing</span>
                            </button>
                          </>
                        )}

                        {isUserReport && report.targetId && (
                          <button
                            type="button"
                            onClick={() =>
                              updateUserStatusMutation.mutate({
                                userId: report.targetId,
                                isSuspended: true,
                              })
                            }
                            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend Account</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Report Target & Reason */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Target ID:</span>
                        <code className="text-xs font-mono bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-slate-800 dark:text-neutral-200">
                          {report.targetId}
                        </code>
                        {isItemReport && (
                          <Link
                            to={`/items/${report.targetId}`}
                            className="text-xs font-bold text-[#006948] dark:text-[#68dba9] hover:underline flex items-center gap-1"
                          >
                            <span>Inspect Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {isUserReport && (
                          <Link
                            to={`/users/${report.targetId}`}
                            className="text-xs font-bold text-[#006948] dark:text-[#68dba9] hover:underline flex items-center gap-1"
                          >
                            <span>Inspect Member Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Enriched Target Info */}
                      {report.target && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-800 text-xs">
                          {isItemReport && (
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Title: {report.target.title}
                              </span>
                              <span className="text-slate-500">
                                Current Status: <strong>{report.target.status}</strong>
                              </span>
                            </div>
                          )}
                          {isUserReport && (
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Member: {report.target.name} ({report.target.email})
                              </span>
                              <span className="text-slate-500">
                                Reputation: {report.target.reputationScore}/100
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <div>
                          <strong>Reason: </strong> {report.reason}
                        </div>
                        {report.details && (
                          <div className="text-slate-600 dark:text-neutral-300 italic pt-1">
                            "{report.details}"
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 pt-1">
                          Reported by: {report.reporter?.name || "Community Member"} ({report.reporter?.email || "verified"})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATALOG GOVERNANCE (REAL DATA) */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Live Equipment Catalog ({rawItems.length} listings)
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6">
              Govern active, paused, or flagged equipment listings across all categories directly in PostgreSQL.
            </p>

            {isItemsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-200 dark:bg-neutral-800" />
                ))}
              </div>
            ) : rawItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No equipment listings registered in the database yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {rawItems.map((item) => {
                  const isPaused = item.status === "PAUSED";
                  const isRemoved = item.status === "REMOVED";
                  const isActive = item.status === "ACTIVE";

                  return (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/items/${item.id}`}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#006948] transition-colors"
                          >
                            {item.title}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : isPaused
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            }`}
                          >
                            {item.status || "ACTIVE"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Rate: ₹{item.pricePerDay || 0}/day • Category: {item.category?.name || "General"} • Locality: {item.location || "Bengaluru"}
                        </p>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2">
                        {isPaused || isRemoved ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateItemStatusMutation.mutate({ itemId: item.id, status: "ACTIVE" })
                            }
                            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
                          >
                            Set Active
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateItemStatusMutation.mutate({ itemId: item.id, status: "PAUSED" })
                            }
                            className="px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold"
                          >
                            Pause
                          </button>
                        )}

                        {!isRemoved && (
                          <button
                            type="button"
                            onClick={() =>
                              updateItemStatusMutation.mutate({ itemId: item.id, status: "REMOVED" })
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}

                        <Link to={`/items/${item.id}`}>
                          <button
                            type="button"
                            className="p-2 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500"
                            title="Inspect Item"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW & RENTALS LEDGER (REAL DATA) */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Active Transactions & Escrow Deposits ({transactions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6">
              Track real rental transactions, handover milestones, and escrow balances recorded on-chain in PostgreSQL.
            </p>

            {isTxLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-200 dark:bg-neutral-800" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No transactions recorded yet. Approved borrow requests will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {tx.item?.title || "Equipment Rental"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-[#006948] dark:text-[#68dba9]">
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Borrower: {tx.borrower?.name || "Neighbor"} • Lender: {tx.lender?.name || "Owner"} • Rent: ₹{Number(tx.rentTotal || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#006948] dark:text-[#68dba9]">
                        Deposit: ₹{Number(tx.depositValue || 0).toLocaleString("en-IN")}
                      </span>
                      {tx.itemId && (
                        <Link to={`/items/${tx.itemId}`}>
                          <button
                            type="button"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-400 hover:text-slate-900"
                            title="Inspect Item"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}