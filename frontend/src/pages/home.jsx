import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import ScrollRow from "../components/ScrollRow";
import PostDetail from "../components/Postdetail";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import {
  Flame,
  Sparkles,
  History,
  MapPin,
  Heart,
  Crown,
  Camera,
  Utensils,
  PartyPopper,
  Search,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Selected post for modal
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Row Data States
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [youMightLikePosts, setYouMightLikePosts] = useState([]);
  const [recentlyViewedPosts, setRecentlyViewedPosts] = useState([]);
  const [popularNearYouPosts, setPopularNearYouPosts] = useState([]);
  const [weddingPosts, setWeddingPosts] = useState([]);
  const [birthdayPosts, setBirthdayPosts] = useState([]);
  const [decorationPosts, setDecorationPosts] = useState([]);
  const [cateringPosts, setCateringPosts] = useState([]);
  const [photographyPosts, setPhotographyPosts] = useState([]);
  const [interestsPosts, setInterestsPosts] = useState([]);

  // User location / city
  const [userCity, setUserCity] = useState("");

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(ACCESS_TOKEN);

      // 1. Fetch Recommendations (popular, recent, by_category, top_organizers)
      const recsPromise = api.get("/api/posts/recommendations/");

      // 2. Fetch User Profile to get preferred location if authenticated
      const profilePromise = token
        ? api.get("/api/profile/").catch(() => ({ data: {} }))
        : Promise.resolve({ data: {} });

      // 3. Fetch View History if authenticated
      const historyPromise = token
        ? api.get("/api/history/").catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });

      // 4. Fetch all posts to distribute across categories
      const allPostsPromise = api.get("/api/posts/");

      const [recsRes, profileRes, historyRes, allPostsRes] = await Promise.all([
        recsPromise,
        profilePromise,
        historyPromise,
        allPostsPromise,
      ]);

      const allPosts = allPostsRes.data || [];
      const recs = recsRes.data || {};
      const city = profileRes.data?.city || "";
      setUserCity(city);

      // Trending (sorted by likes or popular from recs)
      const popular = recs.popular && recs.popular.length > 0 ? recs.popular : allPosts.slice(0, 8);
      setTrendingPosts(popular);

      // You Might Like (fresh recent posts)
      const recent = recs.recent && recs.recent.length > 0 ? recs.recent : allPosts.slice(0, 8);
      setYouMightLikePosts(recent);

      // Recently Viewed (extract post objects from history items)
      if (Array.isArray(historyRes.data) && historyRes.data.length > 0) {
        const historyPosts = historyRes.data
          .map((item) => item.post)
          .filter(Boolean);
        setRecentlyViewedPosts(historyPosts);
      } else {
        setRecentlyViewedPosts([]);
      }

      // Popular Near You: filter by user city if set, else fallback to top posts with a city
      let nearYou = [];
      if (city) {
        nearYou = allPosts.filter(
          (p) => p.city && p.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      if (nearYou.length === 0) {
        // Fallback to posts that have a city
        nearYou = allPosts.filter((p) => Boolean(p.city));
      }
      setPopularNearYouPosts(nearYou.length > 0 ? nearYou : allPosts.slice(0, 6));

      // Event-Type: Wedding
      const weddings = allPosts.filter(
        (p) =>
          (p.service && p.service.toLowerCase().includes("wedding")) ||
          (p.caption && p.caption.toLowerCase().includes("wedding"))
      );
      setWeddingPosts(weddings.length > 0 ? weddings : allPosts.slice(0, 5));

      // Event-Type: Birthday
      const birthdays = allPosts.filter(
        (p) =>
          (p.service && p.service.toLowerCase().includes("birthday")) ||
          (p.caption && p.caption.toLowerCase().includes("birthday"))
      );
      setBirthdayPosts(birthdays.length > 0 ? birthdays : allPosts.slice(1, 6));

      // Service-Type: Decoration
      const decorations = allPosts.filter(
        (p) =>
          (p.service && p.service.toLowerCase().includes("decor")) ||
          (p.caption && p.caption.toLowerCase().includes("decor"))
      );
      setDecorationPosts(decorations.length > 0 ? decorations : allPosts.slice(0, 6));

      // Service-Type: Catering
      const catering = allPosts.filter(
        (p) =>
          (p.service && p.service.toLowerCase().includes("cater")) ||
          (p.service && p.service.toLowerCase().includes("food")) ||
          (p.caption && p.caption.toLowerCase().includes("catering"))
      );
      setCateringPosts(catering.length > 0 ? catering : allPosts.slice(2, 7));

      // Service-Type: Photography
      const photography = allPosts.filter(
        (p) =>
          (p.service && p.service.toLowerCase().includes("photo")) ||
          (p.caption && p.caption.toLowerCase().includes("photo"))
      );
      setPhotographyPosts(photography.length > 0 ? photography : allPosts.slice(3, 8));

      // Based on Your Interests (curated mix)
      const interests = [...allPosts].reverse().slice(0, 8);
      setInterestsPosts(interests);
    } catch (err) {
      console.error("Failed to fetch home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPostId(post.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar togglesidebar={toggleSidebar} />

      <main className="relative flex-1 pt-16 md:pt-18">
        {/* Responsive Sidebar */}
        <Sidebar open={open} />

        {/* Content Container */}
        <div
          className={`transition-all duration-300 min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto ${
            open ? "md:ml-[168px]" : "md:ml-[68px]"
          }`}
        >
          {/* Welcome Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 sm:mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <Sparkles size={14} />
                <span>Premier Event Planning & Vendor Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Plan Your Unforgettable Moments With Elegance
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-2 leading-relaxed">
                Connect with verified wedding decorators, gourmet caterers, candid photographers, and bespoke venues.
              </p>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <button
                onClick={() => navigate("/explore")}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-white shadow-xs hover:opacity-95 transition"
              >
                All Events
              </button>
              <button
                onClick={() => navigate("/explore?category=Decoration")}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
              >
                Decoration
              </button>
              <button
                onClick={() => navigate("/explore?category=Wedding")}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
              >
                Wedding
              </button>
              <button
                onClick={() => navigate("/explore?category=Catering")}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
              >
                Catering
              </button>
              <button
                onClick={() => navigate("/explore?category=Photography")}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition"
              >
                Photography
              </button>
            </div>
          </div>

          {/* 1. Trending Row */}
          <ScrollRow
            title="Trending Now"
            subtitle="Most loved celebrations and setups across EventHub"
            icon={Flame}
            posts={trendingPosts}
            loading={loading}
            seeAllUrl="/explore?sort=popular"
            onPostClick={handlePostClick}
          />

          {/* 2. You Might Like Row */}
          <ScrollRow
            title="You Might Like"
            subtitle="Fresh event inspirations curated for you"
            icon={Sparkles}
            posts={youMightLikePosts}
            loading={loading}
            seeAllUrl="/explore?sort=latest"
            onPostClick={handlePostClick}
          />

          {/* 3. Recently Viewed Row (displayed when user has history) */}
          {recentlyViewedPosts.length > 0 && (
            <ScrollRow
              title="Recently Viewed"
              subtitle="Pick up right where you left off"
              icon={History}
              posts={recentlyViewedPosts}
              loading={loading}
              seeAllUrl="/saved"
              onPostClick={handlePostClick}
            />
          )}

          {/* 4. Popular Near You Row */}
          <ScrollRow
            title={userCity ? `Popular in ${userCity}` : "Popular Near You"}
            subtitle={
              userCity
                ? `Trending vendors and setups in ${userCity}`
                : "Top event coordinators and venues across active regions"
            }
            icon={MapPin}
            posts={popularNearYouPosts}
            loading={loading}
            seeAllUrl={userCity ? `/explore?city=${encodeURIComponent(userCity)}` : "/explore"}
            onPostClick={handlePostClick}
          />

          {/* 5. Event-Type Rows: Wedding Inspirations */}
          <ScrollRow
            title="Wedding Inspirations"
            subtitle="Grand mandaps, royal stages, and dreamy destination ceremonies"
            icon={Heart}
            posts={weddingPosts}
            loading={loading}
            seeAllUrl="/explore?category=Wedding"
            onPostClick={handlePostClick}
          />

          {/* 6. Event-Type Rows: Birthday Celebrations */}
          <ScrollRow
            title="Birthday Celebrations"
            subtitle="Themed setups, fairy lights, and milestone memories"
            icon={PartyPopper}
            posts={birthdayPosts}
            loading={loading}
            seeAllUrl="/explore?category=Birthday"
            onPostClick={handlePostClick}
          />

          {/* 7. Service-Type Rows: Decoration & Ambiance */}
          <ScrollRow
            title="Decorations & Ambiance"
            subtitle="Floral canopies, mood lighting, and bespoke stage backdrops"
            icon={Crown}
            posts={decorationPosts}
            loading={loading}
            seeAllUrl="/explore?service=Decoration"
            onPostClick={handlePostClick}
          />

          {/* 8. Service-Type Rows: Gourmet Catering */}
          <ScrollRow
            title="Gourmet Catering & Banquets"
            subtitle="Artisanal delicacies, live counters, and exquisite spreads"
            icon={Utensils}
            posts={cateringPosts}
            loading={loading}
            seeAllUrl="/explore?service=Catering"
            onPostClick={handlePostClick}
          />

          {/* 9. Service-Type Rows: Photography */}
          <ScrollRow
            title="Cinematic Photography & Films"
            subtitle="Capturing timeless emotions, pre-wedding journeys, and candid bliss"
            icon={Camera}
            posts={photographyPosts}
            loading={loading}
            seeAllUrl="/explore?service=Photography"
            onPostClick={handlePostClick}
          />

          {/* 10. Based on Your Interests */}
          <ScrollRow
            title="Based on Your Interests"
            subtitle="Handcrafted selections matching your event taste"
            icon={Sparkles}
            posts={interestsPosts}
            loading={loading}
            seeAllUrl="/explore"
            onPostClick={handlePostClick}
          />
        </div>
      </main>

      {/* Reusable PostDetail Modal View */}
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
