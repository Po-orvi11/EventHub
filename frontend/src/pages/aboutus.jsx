import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import {
  Flower2,
  Sparkles,
  Target,
  Compass,
  Calendar,
  CheckCircle2,
  Users,
  Building2,
  Bookmark,
  ShieldCheck,
  Search,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";

export default function AboutUs() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar togglesidebar={toggleSidebar} />

      <main className="relative flex-1 pt-16 md:pt-18">
        <Sidebar open={open} />

        <div
          className={`eventhub-page-content transition-all duration-300 min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-12 ${
            open ? "md:ml-[168px]" : "md:ml-[68px]"
          }`}
        >
          {/* Hero Banner */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
                <Flower2 size={16} /> Welcome to EventHub
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Bringing Memorable Events <br className="hidden sm:inline" />
                <span className="text-primary">To Life, Seamlessly</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                EventHub connects event hosts and planners with verified decorators, caterers,
                photographers, and organizers to turn visions into unforgettable celebrations.
              </p>
            </div>
          </section>

          {/* Section 1: Who We Are & Section 2: Our Mission */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Who We Are */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Users size={26} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                  EventHub is an event discovery and vendor collaboration platform designed to simplify how people organize gatherings. From milestone weddings and birthdays to intimate family ceremonies and corporate celebrations, we provide an open space where creativity meets practical planning.
                </p>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  We empower both hosts looking for design inspiration and talented service providers wanting to showcase their real-world work directly to interested clients.
                </p>
              </div>
            </div>

            {/* Our Mission */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-6">
                  <Target size={26} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                  Our mission is to eliminate the stress, uncertainty, and fragmented communication that often surround event planning. We believe finding trustworthy organizers and transparent packages should be simple and inspiring.
                </p>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  By pairing real photographic portfolios with direct inquiry channels, EventHub ensures that every celebration is backed by clear expectations and mutual confidence.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How EventHub Works */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                How EventHub Works
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                From finding aesthetic themes to locking your dates with confirmed vendors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Discover & Explore</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-1">
                  Browse real setups, mandap decor, banquet menus, and floral stages. Filter by event type, service category, location, and budget range to match your vision.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Inquire & Connect</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-1">
                  Submit transparent booking inquiries directly to the organizer with your event date, venue city, guest count, and specific requirements without middleman markups.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm & Celebrate</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-1">
                  Organizers review and confirm your reservation. Track your inquiries under your profile dashboard and collaborate directly for a flawless event day.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Benefits for Customers */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                For Hosts & Event Planners
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Benefits for Customers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Verified Portfolios</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Real photographic galleries showcasing actual setups, decor themes, and catering presentations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <HeartHandshake size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Direct Communication</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Transparent connections with organizers with no middleman interference or hidden broker commissions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Search size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Smart Discovery</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Filter by wedding, birthday, corporate event, catering, photography, city, and pricing range with ease.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bookmark size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Centralized Planning</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Bookmark favorite designs, revisit viewing history, and monitor active booking inquiries in one place.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Benefits for Organizers */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-1">
                For Vendors & Creative Partners
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Benefits for Organizers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Business Showcase</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  A professional profile with your bio, coverage cities, service offerings, and starting package rates.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Multi-Photo Works</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Publish high-resolution photo galleries with categorized tags, descriptions, and localities.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <Calendar size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Inquiry Management</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Receive structured inquiries with guest counts, dates, and locations. Accept or reject with one click.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Zero Friction Setup</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Start creating and managing your portfolio directly from your account without technical complexity.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Action Footer Card */}
          <section className="bg-primary text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold">Ready to Start Planning?</h2>
              <p className="text-white/85 text-xs sm:text-sm max-w-xl">
                Explore thousands of inspiring setups or list your business on EventHub today.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-3 bg-white text-primary rounded-xl font-semibold shadow hover:bg-gray-50 transition cursor-pointer text-sm inline-flex items-center gap-2"
              >
                Explore Events <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/organizer")}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition cursor-pointer text-sm"
              >
                Organizer Profile
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
