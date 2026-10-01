import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PostCard from "../components/PostCard";
import PostDetail from "../components/Postdetail";
import api from "../api";
import {
  History as HistoryIcon,
  Trash2,
  Compass,
  AlertCircle,
  X,
  Heart,
  Crown,
  PartyPopper,
  Utensils,
  Camera,
  Layers,
} from "lucide-react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/history/");
      // The API returns ViewHistory objects with nested 'post'
      const posts = (res.data || [])
        .map((entry) => ({
          ...entry.post,
          history_id: entry.id,
          viewed_at: entry.viewed_at,
        }))
        .filter(Boolean);
      setHistoryPosts(posts);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setClearLoading(true);
      await api.delete("/api/history/");
      setHistoryPosts([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Failed to clear history:", err);
    } finally {
      setClearLoading(false);
    }
  };

  const handleRemoveSingleItem = async (postId, e) => {
    e?.stopPropagation();
    try {
      await api.delete(`/api/history/${postId}/`);
      setHistoryPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to remove history item:", err);
    }
  };

  // Group history items by category (Wedding, Birthday, Decoration, Catering, Photography, Other)
  const categorized = {
    Wedding: [],
    Birthday: [],
    Decoration: [],
    Catering: [],
    Photography: [],
    Other: [],
  };

  historyPosts.forEach((post) => {
    const s = (post.service || "").toLowerCase();
    const c = (post.caption || "").toLowerCase();

    if (s.includes("wedding") || c.includes("wedding")) {
      categorized.Wedding.push(post);
    } else if (s.includes("birthday") || c.includes("birthday")) {
      categorized.Birthday.push(post);
    } else if (s.includes("decor") || c.includes("decor")) {
      categorized.Decoration.push(post);
    } else if (s.includes("cater") || s.includes("food") || c.includes("cater")) {
      categorized.Catering.push(post);
    } else if (s.includes("photo") || c.includes("photo")) {
      categorized.Photography.push(post);
    } else {
      categorized.Other.push(post);
    }
  });

  const categoryMeta = {
    Wedding: { icon: Heart, desc: "Wedding Mandaps, Venues & Receptions" },
    Birthday: { icon: PartyPopper, desc: "Milestone Bashes & Themed Parties" },
    Decoration: { icon: Crown, desc: "Floral Stages, Backdrops & Lighting" },
    Catering: { icon: Utensils, desc: "Gourmet Buffets & Banquet Spreads" },
    Photography: { icon: Camera, desc: "Candid Snaps & Bridal Shoots" },
    Other: { icon: Layers, desc: "Special Event Concepts" },
  };

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
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                <HistoryIcon size={18} />
                <span>Browsing Log</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Recently Viewed Events
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Your previously inspected decorations, caterers, and celebrations.
              </p>
            </div>

            {historyPosts.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
                  {historyPosts.length} Viewed
                </span>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  <Trash2 size={15} />
                  Clear History
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : historyPosts.length > 0 ? (
            <div className="space-y-12">
              {/* 1. Master Timeline View (Latest First) */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Latest Views (Chronological)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {historyPosts.map((post) => (
                    <div key={post.id} className="relative group">
                      <PostCard
                        post={post}
                        onPostClick={() => setSelectedPostId(post.id)}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSingleItem(post.id, e)}
                        className="mt-2 w-full text-center text-xs text-gray-400 hover:text-red-500 font-semibold py-1 transition"
                      >
                        Remove from history
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Categorized Sections (Only shown when data exists) */}
              {Object.keys(categorized).map((catName) => {
                const items = categorized[catName];
                if (!items || items.length === 0) return null; // Show only when data exists!

                const MetaIcon = categoryMeta[catName]?.icon || Layers;
                const desc = categoryMeta[catName]?.desc;

                return (
                  <section key={catName} className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MetaIcon size={20} className="text-primary" />
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {catName}
                      </h2>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary ml-2">
                        {items.length}
                      </span>
                    </div>
                    {desc && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">
                        {desc}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {items.map((post) => (
                        <PostCard
                          key={`${catName}-${post.id}`}
                          post={post}
                          onPostClick={() => setSelectedPostId(post.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto my-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <HistoryIcon size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Browsing History Yet
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                As you click and explore event showcases, decorators, caterers, and vendors, your viewing trail will be recorded here automatically.
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow hover:opacity-95 transition"
              >
                <Compass size={18} />
                Explore Event Inspirations
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Clear All Browsing History?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              This will remove all your recently viewed event showcases. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={clearLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition"
              >
                {clearLoading ? "Clearing..." : "Yes, Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}

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
