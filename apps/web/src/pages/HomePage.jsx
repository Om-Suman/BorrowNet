import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Send, Handshake, RotateCcw, Star } from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import { categoriesApi } from "../api/endpoints";

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
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight">
          Share Equipment.
          <br />
          <span className="text-accent">Build Community.</span>
          <br />
          Save Money.
        </h1>
        <p className="text-xl text-textSecondary">
          BorrowNet is the peer-to-peer sharing platform for tools, gear, and
          tech. Borrow what you need, lend what you don't.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto mt-8"
        >
          <div className="flex rounded-md shadow-sm">
            <div className="relative flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textSecondary" />
              </div>
              <input
                type="text"
                className="focus:ring-accent focus:border-accent block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-borderSubtle bg-surface text-white py-4"
                placeholder="What do you need to borrow?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-none rounded-r-md"
            >
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-display font-bold text-white">
            Popular Categories
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-surfaceElevated animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                hoverable
                onClick={() => navigate(`/browse?category=${cat.slug}`)}
                className="text-center"
              >
                <CardBody className="py-6 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="font-medium text-sm text-textPrimary">
                    {cat.name}
                  </span>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-12 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400 font-mono">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Borrowing, made simple.
          </h2>
          <p className="text-sm md:text-base text-textSecondary">
            Five steps between you and the thing you need – no buying, no
            clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {/* Step 1 */}
          <div className="relative bg-surface border border-borderSubtle hover:border-borderStrong hover:bg-surfaceElevated transition-all duration-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg group">
            <span className="absolute top-4 right-5 text-2xl md:text-3xl font-display font-bold text-textSecondary/25 group-hover:text-textSecondary/40 transition-colors select-none">
              1
            </span>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-white mb-2">
              Discover
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Find items near you with search, filters and the nearby map.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-surface border border-borderSubtle hover:border-borderStrong hover:bg-surfaceElevated transition-all duration-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg group">
            <span className="absolute top-4 right-5 text-2xl md:text-3xl font-display font-bold text-textSecondary/25 group-hover:text-textSecondary/40 transition-colors select-none">
              2
            </span>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-white mb-2">
              Request
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Pick your dates, see the full cost upfront and send a request.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-surface border border-borderSubtle hover:border-borderStrong hover:bg-surfaceElevated transition-all duration-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg group">
            <span className="absolute top-4 right-5 text-2xl md:text-3xl font-display font-bold text-textSecondary/25 group-hover:text-textSecondary/40 transition-colors select-none">
              3
            </span>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-white mb-2">
              Borrow
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Meet the owner, record the condition together and enjoy.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative bg-surface border border-borderSubtle hover:border-borderStrong hover:bg-surfaceElevated transition-all duration-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg group">
            <span className="absolute top-4 right-5 text-2xl md:text-3xl font-display font-bold text-textSecondary/25 group-hover:text-textSecondary/40 transition-colors select-none">
              4
            </span>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-white mb-2">
              Return
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Return on time. Your deposit comes back, your trust goes up.
            </p>
          </div>

          {/* Step 5 */}
          <div className="relative bg-surface border border-borderSubtle hover:border-borderStrong hover:bg-surfaceElevated transition-all duration-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg group">
            <span className="absolute top-4 right-5 text-2xl md:text-3xl font-display font-bold text-textSecondary/25 group-hover:text-textSecondary/40 transition-colors select-none">
              5
            </span>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-white mb-2">
              Review
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Rate each other and grow the community's trust network.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
