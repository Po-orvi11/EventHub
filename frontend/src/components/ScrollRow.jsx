import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";

export default function ScrollRow({
  title,
  subtitle,
  posts = [],
  loading = false,
  seeAllUrl,
  onPostClick,
  emptyMessage = "No events found in this category yet.",
  icon: Icon = null,
}) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [posts, loading]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handleSeeAll = () => {
    if (typeof seeAllUrl === "function") {
      seeAllUrl();
    } else if (typeof seeAllUrl === "string") {
      navigate(seeAllUrl);
    } else {
      navigate("/explore");
    }
  };

  if (!loading && (!posts || posts.length === 0)) {
    return null; // Gracefully hide empty rows or render fallback if desired
  }

  return (
    <section className="mb-10 sm:mb-12">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4 px-2 sm:px-0">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={20} className="text-primary" />}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Left / Right Scroll Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-xs text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Scroll left"
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-xs text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Scroll right"
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* See All Link */}
          {seeAllUrl && (
            <button
              onClick={handleSeeAll}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80 transition py-1 px-2 rounded-md hover:bg-primary/5 shrink-0"
            >
              <span>See All</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 -mx-1"
      >
        {loading ? (
          // Skeleton loading cards
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[260px] sm:w-[280px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-48 sm:h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={onPostClick}
              className="w-[260px] sm:w-[280px] shrink-0"
            />
          ))
        ) : (
          <div className="w-full py-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Sparkles size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}
