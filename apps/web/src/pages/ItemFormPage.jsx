import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  Camera,
  Trash2,
  UploadCloud,
  ArrowLeft,
  ShieldAlert,
  CameraOff,
  Check,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
import { itemsApi, categoriesApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

const CONDITIONS = [
  {
    value: "LIKE_NEW",
    title: "Like New",
    badge: "Mint",
    desc: "Flawless cosmetic condition, zero scratches or marks, fully functional.",
  },
  {
    value: "GOOD",
    title: "Good",
    badge: "Popular",
    desc: "Minor normal wear, strictly maintained & tested 100% operational.",
  },
  {
    value: "FAIR",
    title: "Fair",
    badge: "Rugged",
    desc: "Visible wear from active use, fully functional and safe to operate.",
  },
  {
    value: "NEW",
    title: "Brand New",
    badge: "Unopened",
    desc: "Unopened or never used, original box and accessories included.",
  },
];

const LOCALITY_PRESETS = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar"];

// Clean image compressor to keep uploads lightweight
function compressAndReadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ItemFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form states - clean, zero dummy defaults
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("ACTIVE");

  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 1. Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    staleTime: 1000 * 60 * 10,
  });

  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  // 2. Fetch existing item in edit mode
  const {
    data: existingItemData,
    isLoading: isItemLoading,
    isError: isItemError,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => itemsApi.getById(id),
    enabled: isEditMode,
  });

  const existingItem = existingItemData?.data;

  // Populate fields in edit mode
  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title || "");
      setDescription(existingItem.description || "");
      setCategoryId(existingItem.categoryId || existingItem.category?.id || "");
      setCondition(existingItem.condition || "GOOD");
      setPricePerDay(existingItem.pricePerDay !== undefined ? String(existingItem.pricePerDay) : "");
      setLocation(existingItem.location || "");
      setRules(existingItem.rules || "");
      setStatus(existingItem.status || "ACTIVE");

      if (Array.isArray(existingItem.images) && existingItem.images.length > 0) {
        setImages(existingItem.images.map((img) => (typeof img === "string" ? img : img.url)));
      } else {
        setImages([]);
      }
    }
  }, [existingItem]);

  // Set default category when loaded
  useEffect(() => {
    if (!isEditMode && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, isEditMode, categoryId]);

  // Ownership security check
  const isUnauthorized = isEditMode && existingItem && user && existingItem.ownerId !== user.id;

  // 3. Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => itemsApi.create(payload),
    onSuccess: (res) => {
      toast.success("Equipment listing created successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      const createdItem = res?.data;
      if (createdItem?.id) {
        navigate(`/items/${createdItem.id}`);
      } else {
        navigate("/dashboard");
      }
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to create listing.");
    },
  });

  // 4. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => itemsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Listing updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate(`/items/${id}`);
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to update listing.");
    },
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => itemsApi.delete(id),
    onSuccess: () => {
      toast.success("Listing removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err?.error?.message || err?.message || "Failed to remove listing.");
    },
  });

  // Photo handlers
  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 10 photos allowed.");
      return;
    }

    const validFiles = Array.from(files)
      .slice(0, remainingSlots)
      .filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      toast.error("Please select valid image files (PNG, JPG, WEBP).");
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrls = await Promise.all(validFiles.map((f) => compressAndReadImage(f)));
      setImages((prev) => [...prev, ...dataUrls]);
      toast.success(`Added ${dataUrls.length} photo${dataUrls.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Could not process photos.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!title.trim() || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    } else if (title.trim().length > 120) {
      errors.title = "Title cannot exceed 120 characters.";
    }

    if (!description.trim() || description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long.";
    } else if (description.trim().length > 5000) {
      errors.description = "Description cannot exceed 5000 characters.";
    }

    if (!categoryId) {
      errors.categoryId = "Please select a category.";
    }

    const priceNum = Number(pricePerDay);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.pricePerDay = "Daily rate must be 0 or higher.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      condition,
      pricePerDay: Number(pricePerDay),
      rules: rules.trim() || null,
      location: location.trim() || null,
      images: images,
    };

    if (isEditMode) {
      payload.status = status;
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Calculations & checklist
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const dailyPriceNum = Number(pricePerDay) || 0;

  const readinessChecks = [
    { label: "Item title & specs", done: title.trim().length >= 3 },
    { label: "Category chosen", done: Boolean(categoryId) },
    { label: "Daily price configured", done: dailyPriceNum > 0 },
    { label: "Detailed description", done: description.trim().length >= 10 },
    { label: "Photo uploaded (boost)", done: images.length > 0 },
  ];

  const completedChecksCount = readinessChecks.filter((c) => c.done).length;
  const readinessPercent = Math.round((completedChecksCount / readinessChecks.length) * 100);

  // Unauthorized guard
  if (isUnauthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-sm text-slate-500">You can only edit your own listings.</p>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (isEditMode && isItemLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-neutral-800 rounded w-1/3" />
        <div className="h-96 bg-slate-200 dark:bg-neutral-800 rounded-3xl" />
      </div>
    );
  }

  // Not found
  if (isEditMode && (isItemError || !existingItem)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Listing Not Found</h2>
        <p className="text-sm text-slate-500">The listing may have been removed.</p>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#006948]" />
              Fast 4-Minute Community Listing
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? "Edit Your Equipment Listing" : "List Your Gear & Earn Passive Income"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {isEditMode
              ? "Update your item pricing, details, condition, and photos to keep your listing current."
              : "Join over 4,200 local lenders making an average of ₹12,000/month renting unused equipment safely with community guarantee."}
          </p>
        </div>

        {/* Top Right Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to={isEditMode ? `/items/${id}` : "/dashboard"}>
            <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl h-11 px-4">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Step Indicator Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#006948] text-white font-semibold text-xs shadow-sm">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
            1
          </span>
          <span className="truncate">Gear Info & Category</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-300 font-semibold text-xs border border-slate-200 dark:border-neutral-700">
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-bold">
            2
          </span>
          <span className="truncate">Photos & Condition</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-300 font-semibold text-xs border border-slate-200 dark:border-neutral-700">
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-bold">
            3
          </span>
          <span className="truncate">Pricing & Potential</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-neutral-800/80 text-slate-700 dark:text-neutral-300 font-semibold text-xs border border-slate-200 dark:border-neutral-700">
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-bold">
            4
          </span>
          <span className="truncate">Location & Handover</span>
        </div>
      </div>

      {/* Main Full-Spread Grid: 2 Columns */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Sections (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Basic Gear Information */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-[#68dba9] flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/40">
                    1
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Basic Gear Information
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/40">
                  Required Details
                </span>
              </div>

              {/* Item Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Item Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{title.length}/120</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., DeWalt 20V Max Cordless Miter Saw with Rolling Stand"
                  className={`w-full text-sm px-4 py-3 rounded-2xl border ${
                    fieldErrors.title
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : "border-slate-200 dark:border-neutral-700"
                  } bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none font-medium transition-all`}
                  required
                />
                {fieldErrors.title && (
                  <p className="text-xs text-rose-500 font-semibold">{fieldErrors.title}</p>
                )}
                <p className="text-[11px] text-slate-400">
                  Mention brand, voltage, size, or model number to rank higher in local search.
                </p>
              </div>

              {/* Category & Condition Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006948] outline-none font-semibold transition-all cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Equipment Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006948] outline-none font-semibold transition-all cursor-pointer"
                    required
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.title} — {cond.badge}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Included Accessories */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Description & Included Accessories <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{description.length}/5000</span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your equipment, working condition, accessories included (e.g. blades, batteries, carry case), and any safety notes..."
                  className={`w-full text-sm p-4 rounded-2xl border ${
                    fieldErrors.description
                      ? "border-rose-400 ring-1 ring-rose-400"
                      : "border-slate-200 dark:border-neutral-700"
                  } bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none resize-y transition-all`}
                  required
                />
                {fieldErrors.description && (
                  <p className="text-xs text-rose-500 font-semibold">{fieldErrors.description}</p>
                )}
              </div>
            </div>

            {/* Section 2: Gear Photos & Condition */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-[#68dba9] flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/40">
                    2
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Gear Photos & Condition
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/40">
                  2x Exposure
                </span>
              </div>

              {/* Pro Tip Box */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold">Pro Tip: </span>
                  Listings with clear photos rent 2.2x faster and reduce dispute inquiries by 94%.
                  Include photos of accessories, serial plate, and overall condition.
                </div>
              </div>

              {/* Upload Zone */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-neutral-700 hover:border-[#006948] dark:hover:border-[#68dba9] bg-slate-50/50 dark:bg-neutral-800/30 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 mx-auto flex items-center justify-center text-[#006948] dark:text-[#68dba9] group-hover:scale-105 transition-transform shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    Drag & drop up to 10 high-resolution photos, or{" "}
                    <span className="text-[#006948] dark:text-[#68dba9] underline">browse</span>
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Supports JPG, PNG, WEBP up to 20MB each. If no photo is uploaded, listing will
                    display cleanly without images.
                  </p>
                </div>

                {/* Uploaded Photos Grid */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold">{images.length}/10 photos uploaded</span>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="text-rose-500 hover:underline font-semibold"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-700 group shadow-xs bg-slate-900"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gear photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-[#006948] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Condition Cards Grid */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider block">
                  Select Item Condition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONDITIONS.filter((c) => c.value !== "NEW").map((cond) => {
                    const isSelected = condition === cond.value;
                    return (
                      <div
                        key={cond.value}
                        onClick={() => setCondition(cond.value)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#006948] bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                            : "border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {cond.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#006948] dark:text-[#68dba9]" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
                          {cond.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Rental Pricing & Security */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-[#68dba9] flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/40">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rental Pricing & Security Deposit
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/40">
                  Automated Escrow
                </span>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Daily Rental Rate (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      placeholder="e.g., 500"
                      className={`w-full text-sm pl-8 pr-4 py-3 rounded-2xl border ${
                        fieldErrors.pricePerDay
                          ? "border-rose-400 ring-1 ring-rose-400"
                          : "border-slate-200 dark:border-neutral-700"
                      } bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none font-bold transition-all`}
                      required
                    />
                  </div>
                  {fieldErrors.pricePerDay && (
                    <p className="text-xs text-rose-500 font-semibold">{fieldErrors.pricePerDay}</p>
                  )}
                  <p className="text-[11px] text-slate-400">Market average for tools is ₹300 - ₹800/day.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Security Deposit Protection
                  </label>
                  <div className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-100/70 dark:bg-neutral-800/40 text-slate-700 dark:text-neutral-300 flex items-center justify-between">
                    <span className="font-semibold text-xs">Automated Platform Escrow</span>
                    <span className="text-[11px] font-bold text-[#006948] dark:text-[#68dba9]">
                      100% Protected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Held securely in escrow during the rental and released upon check-in.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Location & Handover */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#006948] dark:text-[#68dba9] flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/40">
                    4
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Location & Handover Preferences
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-[#68dba9] border border-emerald-200 dark:border-emerald-800/40">
                  Privacy Protected
                </span>
              </div>

              {/* Locality Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Pickup Locality / Neighborhood Area
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Indiranagar / Koramangala, Bengaluru"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none transition-all"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
                  {LOCALITY_PRESETS.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        location === loc
                          ? "bg-[#006948] text-white border-transparent shadow-xs"
                          : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:border-[#006948]"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handover Guidelines */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Usage Guidelines & Handover Notes (Optional)
                </label>
                <input
                  type="text"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="e.g., Valid ID required at pickup, return fully charged, porch pickup available"
                  className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#006948] outline-none transition-all"
                />
              </div>

              {/* Edit Mode Status & Delete Controls */}
              {isEditMode && (
                <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 block">
                        Listing Visibility Status
                      </span>
                      <span className="text-xs text-slate-400">
                        {status === "ACTIVE"
                          ? "Public and searchable in the equipment catalog"
                          : "Paused and hidden from search"}
                      </span>
                    </div>

                    <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-neutral-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setStatus("ACTIVE")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          status === "ACTIVE"
                            ? "bg-[#006948] text-white shadow-xs"
                            : "text-slate-600 dark:text-neutral-400"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("PAUSED")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          status === "PAUSED"
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-neutral-400"
                        }`}
                      >
                        Paused
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete this listing</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006948] shrink-0" />
                <span>Protected by BorrowNet guarantee. Lenders keep 100% of rental earnings.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link to={isEditMode ? `/items/${id}` : "/dashboard"} className="flex-1 sm:flex-none">
                  <Button type="button" variant="secondary" size="md" className="w-full text-xs font-bold px-5">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  variant="primary"
                  size="md"
                  className="flex-1 sm:flex-none px-7 py-3 text-sm font-bold shadow-md"
                >
                  {isEditMode ? "Save Changes" : "Publish Listing to BorrowNet"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* 1. Listing Readiness Card */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Listing Readiness
                </h3>
                <span className="text-xs font-black text-[#006948] dark:text-[#68dba9]">
                  {readinessPercent}% Ready
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-[#006948] transition-all duration-300 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                {readinessChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        check.done
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-[#006948] dark:text-[#68dba9]"
                          : "border border-slate-300 dark:border-neutral-700 text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span
                      className={`truncate ${
                        check.done
                          ? "text-slate-800 dark:text-neutral-200 font-semibold"
                          : "text-slate-400 dark:text-neutral-500"
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Live Listing Card Preview */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-neutral-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Eye className="w-3.5 h-3.5 text-[#006948]" />
                  Listing Card Live Preview
                </span>
                {location && (
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#006948]" />
                    {location}
                  </span>
                )}
              </div>

              {/* Simulated Item Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden bg-slate-50 dark:bg-neutral-900/60 shadow-xs">
                <div className="aspect-[16/10] bg-slate-100 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={title || "Listing preview"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <CameraOff className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400 font-medium">No photos uploaded yet</p>
                    </div>
                  )}

                  <span className="absolute top-2.5 left-2.5 bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Owner
                  </span>

                  {dailyPriceNum > 0 && (
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                      ₹{dailyPriceNum}/day
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                    <span className="text-[#006948] dark:text-[#68dba9] font-bold uppercase tracking-wider">
                      {selectedCategory?.name || "Equipment"}
                    </span>
                    <span>★ 5.0 (New)</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {title.trim() || "Untitled Equipment"}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
                    {description.trim() || "Add a description to tell borrowers about your equipment..."}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Community Guarantee Card */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#006948] dark:text-[#68dba9]">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  BorrowNet Guarantee
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                Every borrower is identity verified before picking up gear. Tools and equipment are
                safeguarded with automated escrow protection.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                <span>Escrow Payouts</span>
                <span>•</span>
                <span>24/7 Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
        title="Delete Listing"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-neutral-400">
            Are you sure you want to delete <strong>{title || "this listing"}</strong>? This action
            cannot be undone.
          </p>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}