import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PostCard from "../components/PostCard";
import PostDetail from "../components/Postdetail";
import api from "../api";
import { Bookmark, Compass, Sparkles } from "lucide-react";

export default function Saved() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    fetchSavedPosts();

    // Listen for unsave actions dispatched anywhere in the app
    const handleSaveSync = (e) => {
      if (e.detail?.postId && e.detail.isSaved === false) {
        setSavedPosts((prev) => prev.filter((item) => item.id !== e.detail.postId));
      }
    };

    window.addEventListener("eventhub:post-save-sync", handleSaveSync);
    return () => window.removeEventListener("eventhub:post-save-sync", handleSaveSync);
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/saved-posts/");
      // The API returns SavedPost objects with nested 'post'
      const posts = (res.data || [])
        .map((entry) => ({
          ...entry.post,
          saved_id: entry.id,
          saved_at: entry.created_at,
          is_saved: true, // definitely saved
        }))
        .filter(Boolean);
      setSavedPosts(posts);
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (postId, e) => {
    e?.stopPropagation();
    try {
      await api.post(`/api/post/${postId}/save/`);
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      window.dispatchEvent(
        new CustomEvent("eventhub:post-save-sync", {
          detail: { postId, isSaved: false },
        })
      );
    } catch (err) {
      console.error("Failed to remove saved post:", err);
    }
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
                <Bookmark size={18} />
                <span>My Collection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Saved Events & Inspirations
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                All event designs, vendors, and setups bookmarked for your special day.
              </p>
            </div>

            <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 self-start sm:self-auto">
              {savedPosts.length} {savedPosts.length === 1 ? "Saved Event" : "Saved Events"}
            </div>
          </div>

          {/* Content Grid */}
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
          ) : savedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <PostCard
                    post={post}
                    onPostClick={() => setSelectedPostId(post.id)}
                  />
                  {/* Quick Remove Overlay Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(post.id, e)}
                    className="mt-2 w-full text-center text-xs text-gray-500 hover:text-red-500 font-semibold py-1 transition"
                  >
                    Remove from Saved
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto my-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Bookmark size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Saved Events Yet
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Whenever you find an event setup, decor theme, or catering inspiration you love, click the bookmark icon to save it here for quick access.
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
