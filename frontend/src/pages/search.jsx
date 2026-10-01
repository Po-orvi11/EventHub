import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PostCard from "../components/PostCard";
import PostDetail from "../components/Postdetail";
import api from "../api";
import {
  Search as SearchIcon,
  X,
  History,
  SlidersHorizontal,
  MapPin,
  Tag,
  DollarSign,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const EVENT_CATEGORIES = [
  "All",
  "Wedding",
  "Birthday",
  "Corporate",
  "Reception",
  "Anniversary",
];

const SERVICE_TYPES = [
  "All",
  "Decoration",
  "Catering",
  "Photography",
  "Music & Sound",
  "Venue",
];

const BUDGET_RANGES = [
  { value: "all", label: "All Budgets" },
  { value: "under_25k", label: "Under ₹25,000" },
  { value: "25k_50k", label: "₹25,000 - ₹50,000" },
  { value: "50k_1lakh", label: "₹50,000 - ₹1,00,000" },
  { value: "above_1lakh", label: "₹1,00,000+" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "latest", label: "Newest First" },
];

const RECENT_SEARCHES_KEY = "eventhub_recent_searches";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);

  // Combinable Filters
  const selectedCategory = searchParams.get("category") || "All";
  const selectedService = searchParams.get("service") || "All";
  const selectedCity = searchParams.get("city") || "All";
  const selectedBudget = searchParams.get("budget") || "all";
  const selectedSort = searchParams.get("sort") || "relevance";

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState([]);

  // Selected Post for Modal
  const [selectedPostId, setSelectedPostId] = useState(null);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    // Load recent searches from local storage
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    // Load available cities
    api.get("/api/categories/")
      .then((res) => {
        setCities(res.data?.cities || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Update query state if searchParams change externally (e.g. from navbar)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    executeBackendSearch();
  }, [searchParams]);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentSearch = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const executeBackendSearch = async () => {
    try {
      setLoading(true);
      const params = {};

      const currentQ = searchParams.get("q");
      if (currentQ && currentQ.trim()) {
        params.q = currentQ.trim();
      }

      const currentCat = searchParams.get("category");
      if (currentCat && currentCat !== "All") {
        params.category = currentCat;
      }

      const currentServ = searchParams.get("service");
      if (currentServ && currentServ !== "All") {
        params.service = currentServ;
      }

      const currentCity = searchParams.get("city");
      if (currentCity && currentCity !== "All") {
        params.city = currentCity;
      }

      const currentBudget = searchParams.get("budget");
      if (currentBudget && currentBudget !== "all") {
        params.budget = currentBudget;
      }

      const currentSort = searchParams.get("sort") || "relevance";
      params.sort = currentSort;

      // Always execute directly against the backend API
      const res = await api.get("/api/posts/", { params });
      setPosts(res.data || []);
    } catch (err) {
      console.error("Backend search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      nextParams.set("q", query.trim());
      saveRecentSearch(query.trim());
    } else {
      nextParams.delete("q");
    }
    setSearchParams(nextParams);
  };

  const handleClearQuery = () => {
    setQuery("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("q");
    setSearchParams(nextParams);
  };

  const updateFilterParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === "All" || value === "all" || !value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const handleResetAllFilters = () => {
    setQuery("");
    setSearchParams({});
  };

  // Determine active filter badges
  const activeFilters = [];
  if (searchParams.get("q")) {
    activeFilters.push({ key: "q", label: `Keyword: "${searchParams.get("q")}"` });
  }
  if (selectedCategory !== "All") {
    activeFilters.push({ key: "category", label: `Event: ${selectedCategory}` });
  }
  if (selectedService !== "All") {
    activeFilters.push({ key: "service", label: `Service: ${selectedService}` });
  }
  if (selectedCity !== "All") {
    activeFilters.push({ key: "city", label: `City: ${selectedCity}` });
  }
  if (selectedBudget !== "all") {
    const bObj = BUDGET_RANGES.find((b) => b.value === selectedBudget);
    activeFilters.push({ key: "budget", label: bObj ? bObj.label : selectedBudget });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar togglesidebar={toggleSidebar} />

      <main className="relative flex-1 pt-16 md:pt-18">
        <Sidebar open={open} />

        <div
          className={`transition-all duration-300 min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto ${
            open ? "md:ml-[168px]" : "md:ml-[68px]"
          }`}
        >
          {/* Main Search Bar Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Search Event Inspirations & Services
            </h1>

            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-4">
              <SearchIcon size={22} className="absolute left-4 text-primary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by theme, vendor name, city, decor style (e.g. Wedding Mandap, Kanpur)..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm sm:text-base transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
                  title="Clear input"
                >
                  <X size={18} />
                </button>
              )}
            </form>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mr-1">
                  <History size={13} /> Recent Searches:
                </span>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.set("q", term);
                      setSearchParams(nextParams);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="text-xs text-primary hover:underline ml-2"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>

          {/* Combinable Filters Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <SlidersHorizontal size={17} className="text-primary" />
                <span>Refine Search Results</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {posts.length} {posts.length === 1 ? "result found" : "results found"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Location / City */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-primary" /> Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => updateFilterParam("city", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-primary"
                >
                  <option value="All">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Event Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Tag size={12} className="text-primary" /> Event Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilterParam("category", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-primary"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Service Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-primary" /> Service Type
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => updateFilterParam("service", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-primary"
                >
                  {SERVICE_TYPES.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Budget Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <DollarSign size={12} className="text-primary" /> Budget Range
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => updateFilterParam("budget", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-primary"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Sort By */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <ArrowUpDown size={12} className="text-primary" /> Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => updateFilterParam("sort", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-700 outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Pill Bar & Reset Option */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500">Active Filters:</span>
                {activeFilters.map((af) => (
                  <span
                    key={af.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                  >
                    <span>{af.label}</span>
                    <button
                      type="button"
                      onClick={() => updateFilterParam(af.key, null)}
                      className="hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary font-semibold ml-2"
                >
                  <RotateCcw size={12} /> Reset All
                </button>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostClick={() => setSelectedPostId(post.id)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto my-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <SearchIcon size={34} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We couldn't find any events or organizers matching your search criteria. Try modifying your keywords, broadening location filters, or resetting options.
              </p>
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow hover:opacity-95 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          isModal={true}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
