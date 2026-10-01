import React, { useState, useEffect } from "react";
import { Heart, Bookmark, Share2, MapPin, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

export const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
  return `${baseUrl.replace(/\/$/, "")}/${img.replace(/^\//, "")}`;
};

export default function PostCard({ post, onPostClick, className = "" }) {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(Boolean(post?.is_liked));
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [isSaved, setIsSaved] = useState(Boolean(post?.is_saved));
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setIsLiked(Boolean(post?.is_liked));
    setLikesCount(post?.likes_count || 0);
    setIsSaved(Boolean(post?.is_saved));
  }, [post?.id, post?.is_liked, post?.likes_count, post?.is_saved]);

  // Global event listener to keep state in sync everywhere across all components
  useEffect(() => {
    const handleLikeSync = (e) => {
      if (e.detail?.postId === post.id) {
        setIsLiked(e.detail.isLiked);
        if (typeof e.detail.likesCount === "number") {
          setLikesCount(e.detail.likesCount);
        }
      }
    };

    const handleSaveSync = (e) => {
      if (e.detail?.postId === post.id) {
        setIsSaved(e.detail.isSaved);
      }
    };

    window.addEventListener("eventhub:post-like-sync", handleLikeSync);
    window.addEventListener("eventhub:post-save-sync", handleSaveSync);

    return () => {
      window.removeEventListener("eventhub:post-like-sync", handleLikeSync);
      window.removeEventListener("eventhub:post-save-sync", handleSaveSync);
    };
  }, [post?.id]);

  const handleCardClick = () => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate("/login");
      return;
    }
    if (likeLoading) return;

    // Optimistic UI update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    const newLiked = !prevLiked;
    const newCount = newLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsLiked(newLiked);
    setLikesCount(newCount);
    setLikeLoading(true);

    try {
      const res = await api.post(`/api/post/${post.id}/like/`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);

      // Notify other instances of this post on the page
      window.dispatchEvent(
        new CustomEvent("eventhub:post-like-sync", {
          detail: { postId: post.id, isLiked: res.data.liked, likesCount: res.data.likes_count },
        })
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate("/login");
      return;
    }
    if (saveLoading) return;

    // Optimistic UI update
    const prevSaved = isSaved;
    const newSaved = !prevSaved;
    setIsSaved(newSaved);
    setSaveLoading(true);

    try {
      const res = await api.post(`/api/post/${post.id}/save/`);
      setIsSaved(res.data.saved);

      // Notify other instances of this post on the page
      window.dispatchEvent(
        new CustomEvent("eventhub:post-save-sync", {
          detail: { postId: post.id, isSaved: res.data.saved },
        })
      );
    } catch (err) {
      console.error("Failed to toggle save:", err);
      setIsSaved(prevSaved);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.caption || `${post.company} Event`,
          text: `Check out this event by ${post.company} on EventHub!`,
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

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer select-none ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full bg-gray-100 overflow-hidden">
        {post?.image ? (
          <img
            src={getImageUrl(post.image)}
            alt={post.caption || `${post.company || "Event"} image`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
            <Sparkles size={32} />
            <span className="text-xs mt-1">EventHub</span>
          </div>
        )}

        {/* Category Badge */}
        {post?.service && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/95 backdrop-blur-xs text-primary font-semibold text-xs px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
              {post.service}
            </span>
          </div>
        )}

        {/* Action Overlay Buttons (Like & Save) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            title={isLiked ? "Unlike" : "Like"}
            disabled={likeLoading}
            className="bg-white/90 backdrop-blur-xs p-2 rounded-full hover:bg-white hover:scale-110 shadow-xs transition duration-200"
          >
            <Heart
              size={16}
              className={`transition-colors ${
                isLiked
                  ? "fill-[#bb847d] text-[#bb847d]"
                  : "text-gray-600 hover:text-[#bb847d]"
              }`}
            />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            title={isSaved ? "Saved" : "Save"}
            disabled={saveLoading}
            className="bg-white/90 backdrop-blur-xs p-2 rounded-full hover:bg-white hover:scale-110 shadow-xs transition duration-200"
          >
            <Bookmark
              size={16}
              className={`transition-colors ${
                isSaved
                  ? "fill-primary text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        {/* Organizer Header & City */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 gap-2">
          <span className="font-semibold text-gray-700 truncate max-w-[65%]">
            {post?.company || "EventHub Verified"}
          </span>
          {post?.city && (
            <span className="flex items-center gap-1 text-gray-500 shrink-0">
              <MapPin size={12} className="text-primary" />
              <span className="truncate max-w-[90px]">{post.city}</span>
            </span>
          )}
        </div>

        {/* Caption */}
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {post?.caption || `${post?.service || "Event"} Celebration Showcase`}
        </h3>

        {/* Card Footer: Likes count and Share button */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Heart
              size={14}
              className={isLiked ? "text-[#bb847d] fill-[#bb847d]" : "text-gray-400"}
            />
            <span>
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              title="Share event"
              className="text-gray-400 hover:text-primary p-1 rounded-full hover:bg-gray-50 transition"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <Check size={14} /> Copied
                </span>
              ) : (
                <Share2 size={15} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
