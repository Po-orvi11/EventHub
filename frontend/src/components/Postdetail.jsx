import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  X,
  Check,
  Building2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api";
import BackNav from "./BackNav";
import { ACCESS_TOKEN } from "../constants";
import { getImageUrl } from "./PostCard";

export default function PostDetail({ postId, onClose, isModal = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const id = postId || params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getPost();
    }
  }, [id]);

  // Sync external state changes
  useEffect(() => {
    const handleLikeSync = (e) => {
      if (e.detail?.postId === Number(id)) {
        setIsLiked(e.detail.isLiked);
        if (typeof e.detail.likesCount === "number") {
          setLikesCount(e.detail.likesCount);
        }
      }
    };

    const handleSaveSync = (e) => {
      if (e.detail?.postId === Number(id)) {
        setIsSaved(e.detail.isSaved);
      }
    };

    window.addEventListener("eventhub:post-like-sync", handleLikeSync);
    window.addEventListener("eventhub:post-save-sync", handleSaveSync);

    return () => {
      window.removeEventListener("eventhub:post-like-sync", handleLikeSync);
      window.removeEventListener("eventhub:post-save-sync", handleSaveSync);
    };
  }, [id]);

  const getPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/post/${id}/`);
      setPost(res.data);
      setIsLiked(Boolean(res.data.is_liked));
      setLikesCount(res.data.likes_count || 0);
      setIsSaved(Boolean(res.data.is_saved));
    } catch (err) {
      console.error("Failed to load post details:", err);
      setError("Unable to load post details. It might have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate("/login");
      return;
    }
    if (likeLoading) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;
    const newLiked = !prevLiked;
    const newCount = newLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsLiked(newLiked);
    setLikesCount(newCount);
    setLikeLoading(true);

    try {
      const res = await api.post(`/api/post/${id}/like/`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);

      window.dispatchEvent(
        new CustomEvent("eventhub:post-like-sync", {
          detail: { postId: Number(id), isLiked: res.data.liked, likesCount: res.data.likes_count },
        })
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate("/login");
      return;
    }
    if (saveLoading) return;

    const prevSaved = isSaved;
    const newSaved = !prevSaved;
    setIsSaved(newSaved);
    setSaveLoading(true);

    try {
      const res = await api.post(`/api/post/${id}/save/`);
      setIsSaved(res.data.saved);

      window.dispatchEvent(
        new CustomEvent("eventhub:post-save-sync", {
          detail: { postId: Number(id), isSaved: res.data.saved },
        })
      );
    } catch (err) {
      console.error("Failed to toggle save:", err);
      setIsSaved(prevSaved);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.caption || `${post?.company} Event`,
          text: `Check out this event by ${post?.company} on EventHub!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log("Fallback to copy link:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy link:", err);
    }
  };

  const handleOrganizerClick = () => {
    if (post?.organizer_id) {
      navigate(`/organizer?id=${post.organizer_id}`);
    }
  };

  const content = (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full mx-auto flex flex-col md:flex-row border border-gray-100">
      {/* Left Column: Image display */}
      <div className="md:w-1/2 w-full bg-gray-900 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
        {post?.image ? (
          <img
            src={getImageUrl(post.image)}
            alt={post.caption || "Event Showcase"}
            className="w-full h-full object-contain max-h-[70vh]"
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <Building2 size={48} />
            <p className="mt-2 text-sm">No Preview Image</p>
          </div>
        )}

        {/* Category tag */}
        {post?.service && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-xs text-primary font-semibold text-xs px-3 py-1.5 rounded-full shadow">
              {post.service}
            </span>
          </div>
        )}
      </div>

      {/* Right Column: Information & Actions */}
      <div className="md:w-1/2 w-full p-6 md:p-8 flex flex-col justify-between bg-white">
        <div>
          {/* Modal Close Button */}
          {isModal && onClose && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Organizer Info Box */}
          <div
            onClick={handleOrganizerClick}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/40 transition cursor-pointer group mb-6"
          >
            <div className="w-13 h-13 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
              {post?.company ? post.company.charAt(0).toUpperCase() : "E"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition truncate text-base">
                  {post?.company || "EventHub Organizer"}
                </h3>
                {post?.organizer?.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 shrink-0">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {post.organizer.rating}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {post?.organizer?.username ? `@${post.organizer.username}` : "Verified Event Partner"}
              </p>
            </div>

            <ChevronRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
          </div>

          {/* Post Caption / Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {post?.caption || `${post?.service || "Event"} Celebration Showcase`}
            </h2>

            {post?.city && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <MapPin size={16} className="text-primary" />
                <span>{post.city}</span>
              </div>
            )}

            {post?.organizer?.bio && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                {post.organizer.bio}
              </p>
            )}
          </div>

          {/* Organizer Contacts */}
          {(post?.organizer?.phone || post?.organizer?.email) && (
            <div className="space-y-2 mb-6 text-xs text-gray-600">
              {post.organizer.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  <span>{post.organizer.phone}</span>
                </div>
              )}
              {post.organizer.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-primary" />
                  <span>{post.organizer.email}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Toolbar & CTA */}
        <div>
          {/* Like, Save, Share Bar */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-6">
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  isLiked
                    ? "bg-[#bb847d]/10 text-[#bb847d]"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart
                  size={18}
                  className={isLiked ? "fill-[#bb847d] text-[#bb847d]" : "text-gray-600"}
                />
                <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  isSaved
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bookmark
                  size={18}
                  className={isSaved ? "fill-primary text-primary" : "text-gray-600"}
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
              title="Share Event"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (isModal && onClose) onClose();
                navigate(`/organizer?book=${post?.organizer_id || ""}&service=${encodeURIComponent(post?.service || "")}`);
              }}
              className="flex-1 bg-primary text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:opacity-95 transition text-center flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              Book Organizer
            </button>

            <button
              onClick={handleOrganizerClick}
              className="border border-primary text-primary py-3.5 px-6 rounded-xl font-semibold hover:bg-primary/5 transition text-center"
            >
              View Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Presentation
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading event details...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-xl">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    );
  }

  // Standalone Full-Page Presentation
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BackNav />
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading event details...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg max-w-md mx-auto">
            <p className="text-gray-700 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow hover:opacity-95"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        ) : (
          content
        )}
      </main>
    </div>
  );
}