import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Send, Handshake, RotateCcw, Star } from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import { categoriesApi } from "../api/endpoints";

const steps = [
  {
    num: "01",
    title: "Discover",
    desc: "Search verified tools, cameras, and gear right in your neighborhood.",
    icon: Search,
  },
  {
    num: "02",
    title: "Request",
    desc: "Pick your rental dates, view transparent pricing, and send a request.",
    icon: Send,
  },
  {
    num: "03",
    title: "Borrow",
    desc: "Meet the owner, inspect item condition together, and start using it.",
    icon: Handshake,
  },
  {
    num: "04",
    title: "Return",
    desc: "Bring the gear back on time. Your security deposit returns instantly.",
    icon: RotateCcw,
  },
  {
    num: "05",
    title: "Review",
    desc: "Rate the experience and grow the verified peer-to-peer network.",
    icon: Star,
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const categories = categoriesData?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/browse?q=${encodeURIComponent(search)}`);
    } else {
      navigate("/browse");
    }
  };

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-light md:font-thin text-textPrimary tracking-display leading-[1.06]">
          Share Equipment.
          <br />
          <span className="text-neutral-500 dark:text-neutral-400">
            Build Community.
          </span>
          <br />
          Save Money.
        </h1>
        <p className="text-base sm:text-xl text-textSecondary max-w-2xl mx-auto font-normal leading-relaxed">
          BorrowNet is the peer-to-peer sharing platform for tools, gear, and
          tech. Borrow what you need, lend what you don't.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mt-8"
        >
          <div className="flex items-center rounded-full bg-surface border border-borderSubtle p-2 shadow-level-3 dark:shadow-level-1 focus-within:border-neutral-500 transition-all">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textSecondary" />
              </div>
              <input
                type="text"
                className="w-full pl-12 sm:pl-14 pr-3 py-3 text-base bg-transparent text-textPrimary placeholder:text-textSecondary/60 border-none outline-none font-normal"
                placeholder="What do you need to borrow?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="rounded-full px-7 py-3 text-base shrink-0"
            >
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Categories */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-textPrimary tracking-tight">
              Popular Categories
            </h2>
            <p className="text-sm sm:text-base text-textSecondary mt-2">
              Explore equipment curated for creators, makers, and outdoor
              explorers
            </p>
          </div>
          <Button
            variant="outline-on-light"
            size="md"
            onClick={() => navigate("/browse")}
            className="dark:border-white/30 dark:text-white shrink-0 self-start sm:self-auto px-6 py-2"
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-surfaceElevated animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                hoverable
                onClick={() => navigate(`/browse?category=${cat.slug}`)}
                className="text-center group rounded-2xl border border-borderSubtle hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <CardBody className="py-8 px-4 flex flex-col items-center justify-center gap-3.5 min-h-[160px]">
                  <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">
                    {cat.icon}
                  </span>
                  <span className="font-medium text-sm sm:text-base text-textPrimary group-hover:opacity-75 transition-opacity tracking-tight">
                    {cat.name}
                  </span>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-16 space-y-12 border-t border-borderSubtle">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-medium tracking-eyebrow uppercase text-textSecondary">
            <span>●</span> The Process
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-light md:font-thin text-textPrimary tracking-display leading-tight">
            Borrowing, made simple.
          </h2>
          <p className="text-base sm:text-lg text-textSecondary font-normal max-w-xl mx-auto leading-relaxed">
            Five steps between you and the equipment you need — zero clutter,
            maximum trust.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-surface border border-borderSubtle hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-level-3 dark:shadow-level-1 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm font-semibold text-textSecondary/40 tracking-wider">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-medium text-textPrimary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-borderSubtle/60 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-textSecondary/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white inline-block" />
                  <span>Step {idx + 1} of 5</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
