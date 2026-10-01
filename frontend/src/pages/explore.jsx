import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PostCard from "../components/PostCard";
import PostDetail from "../components/Postdetail";
import api from "../api";
import {
  Compass,
  Filter,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Wedding",
  "Birthday",
  "Decoration",
  "Catering",
  "Photography",
];

const SORT_OPTIONS = [
  { value: "latest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated Organizers" },
  { value: "oldest", label: "Oldest First" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);

  // Active filter states from URL params or defaults
  const activeCategory = searchParams.get("category") || searchParams.get("service") || "All";
  const activeSort = searchParams.get("sort") || "latest";
  const activeCity = searchParams.get("city") || "All";

  // Modal post selection
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Pagination / Load more
  const [displayCount, setDisplayCount] = useState(12);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    loadCategoriesAndCities();
  }, []);

  useEffect(() => {
    fetchExplorePosts();
  }, [activeCategory, activeSort, activeCity]);

  const loadCategoriesAndCities = async () => {
    try {
      const res = await api.get("/api/categories/");
      setCities(res.data?.cities || []);
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  };

  const fetchExplorePosts = async () => {
    try {
      setLoading(true);
      const params = {};

      if (activeCategory && activeCategory !== "All") {
        params.category = activeCategory;
      }
      if (activeCity && activeCity !== "All") {
        params.city = activeCity;
      }
      if (activeSort) {
        params.sort = activeSort;
      }

      const res = await api.get("/api/posts/", { params });
      setPosts(res.data || []);
      setDisplayCount(12);
    } catch (err) {
      console.error("Failed to fetch explore posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      nextParams.delete("category");
      nextParams.delete("service");
    } else {
      nextParams.set("category", cat);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (sortVal) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("sort", sortVal);
    setSearchParams(nextParams);
  };

  const handleCityChange = (cityVal) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cityVal === "All") {
      nextParams.delete("city");
    } else {
      nextParams.set("city", cityVal);
    }
    setSearchParams(nextParams);
  };

  const visiblePosts = posts.slice(0, displayCount);

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
          {/* Header Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                <Compass size={18} />
                <span>Explore Showcase</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Discover Extraordinary Celebrations
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Browse verified setups, trending party decor, and luxury event themes.
              </p>
            </div>

            {/* Total Results Counter */}
            <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700">
              {loading ? "Searching..." : `${posts.length} Celebrations Found`}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-sm scale-102"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Filter & Sort Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <SlidersHorizontal size={18} className="text-primary" />
              <span>Filter & Sort</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* City Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm">
                <MapPin size={15} className="text-primary shrink-0" />
                <select
                  value={activeCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none cursor-pointer pr-2"
                >
                  <option value="All">All Locations</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm">
                <Filter size={15} className="text-primary shrink-0" />
                <select
                  value={activeSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-gray-700 outline-none cursor-pointer pr-2"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              {(activeCategory !== "All" || activeCity !== "All" || activeSort !== "latest") && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs font-semibold text-gray-500 hover:text-primary transition py-1.5 px-2 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={13} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
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
          ) : visiblePosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostClick={() => setSelectedPostId(post.id)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {displayCount < posts.length && (
                <div className="text-center mt-12 mb-8">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 12)}
                    className="px-8 py-3 bg-white border border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold shadow-xs hover:shadow transition duration-200 cursor-pointer"
                  >
                    Load More Celebrations ({posts.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto my-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Sparkles size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Celebrations Found
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We couldn't find any events matching your selected filters. Try choosing a different category or clearing location filters.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow hover:opacity-95 transition"
              >
                Clear All Filters
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
