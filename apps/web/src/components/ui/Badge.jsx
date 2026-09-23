export default function Badge({
  variant = "default",
  children,
  className = "",
}) {
  const variants = {
    default:
      "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    mint: "bg-[#c1fbd4] text-black font-semibold",
    aloe: "bg-[#c1fbd4] text-black font-semibold",
    pistachio: "bg-[#d4f9e0] text-black font-semibold",
    shade: "bg-[#d4d4d8] text-black",
    success:
      "bg-[#c1fbd4] text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    warning:
      "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300",
    info: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-tight ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
