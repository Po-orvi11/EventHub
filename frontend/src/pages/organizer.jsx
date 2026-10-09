import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PostCard, { getImageUrl } from "../components/PostCard";
import CreateEditPostModal from "../components/CreateEditPostModal";
import BookingModal from "../components/BookingModal";
import api from "../api";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Star,
  CirclePlus,
  Calendar,
  CheckCircle,
  XCircle,
  Sparkles,
  Tag,
  Trash2,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const CATEGORY_FILTERS = [
  "All",
  "Wedding",
  "Birthday",
  "Decoration",
  "Catering",
  "Photography",
];

export default function Organizer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orgIdParam = searchParams.get("id");
  const autoBookParam = searchParams.get("book");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile Data
  const [organizerData, setOrganizerData] = useState(null);
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");

  const [isOwner, setIsOwner] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Active Tab for owner: 'portfolio' | 'bookings'
  const [activeTab, setActiveTab] = useState("portfolio");

  // Portfolio Category Filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Post modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Delete post confirmation modal
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Incoming Bookings (Owner only)
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    loadProfile();
  }, [orgIdParam]);

  useEffect(() => {
    if (autoBookParam && organizerData) {
      setIsBookingModalOpen(true);
    }
  }, [autoBookParam, organizerData]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (orgIdParam) {
        // Viewing someone else's public profile (or own via ID)
        const res = await api.get(`/api/organizer/${orgIdParam}/`);
        setOrganizerData(res.data);
        populateFields(res.data);
        setIsOwner(Boolean(res.data.is_owner));
        setIsOrganizer(true);
      } else {
        // Viewing logged-in user's organizer profile
        const res = await api.get("/api/organizer/update/");
        setOrganizerData(res.data);
        populateFields(res.data);
        setIsOwner(true);
        setIsOrganizer(true);
        loadIncomingBookings();
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsOrganizer(false);
        setIsOwner(!orgIdParam);
      } else {
        console.error("Failed to load organizer profile:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const populateFields = (data) => {
    setCompany(data.company || "");
    setBio(data.bio || "");
    setAddress(data.address || "");
    setLocation(data.location || "");
    setPhone(data.phone || "");
    setEmail(data.email || "");
    setPriceRange(data.price_range || "");
    setRating(data.rating || 0);

    if (Array.isArray(data.services)) {
      setServices(data.services.join(", "));
    } else {
      setServices(data.services || "");
    }

    if (data.profile_photo) {
      setProfilePhotoPreview(getImageUrl(data.profile_photo));
    }
  };

  const loadIncomingBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await api.get("/api/organizer/bookings/");
      setIncomingBookings(res.data || []);
    } catch (err) {
      console.error("Failed to load incoming bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const servicesList = typeof services === "string"
      ? services.split(",").map((s) => s.trim()).filter(Boolean)
      : services;

    const formData = new FormData();
    formData.append("company", company);
    formData.append("bio", bio);
    formData.append("address", address);
    formData.append("location", location);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("price_range", priceRange);
    formData.append("services", JSON.stringify(servicesList));

    if (profilePhoto) {
      formData.append("profile_photo", profilePhoto);
    }

    try {
      if (!isOrganizer) {
        await api.post("/api/organizer/create/", formData);
      } else {
        await api.patch("/api/organizer/update/", formData);
      }
      setEditingProfile(false);
      loadProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update business profile.");
    }
  };

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/`, { status: newStatus });
      setIncomingBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Failed to update booking status:", err);
      alert("Failed to update booking status.");
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/api/post/${postToDelete.id}/manage/`);
      setPostToDelete(null);
      loadProfile();
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Could not delete post.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter posts by category chip
  const allPosts = organizerData?.portfolio_images || [];
  const filteredPosts =
    selectedCategory === "All"
      ? allPosts
      : allPosts.filter((p) => {
          const s = (p.service || "").toLowerCase();
          const ec = (p.event_category || "").toLowerCase();
          const cap = (p.caption || "").toLowerCase();
          const target = selectedCategory.toLowerCase();
          return s.includes(target) || ec.includes(target) || cap.includes(target);
        });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar togglesidebar={toggleSidebar} />
        <main className="relative flex-1 pt-16 md:pt-18 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar togglesidebar={toggleSidebar} />

      <main className="relative flex-1 pt-16 md:pt-18">
        <Sidebar open={open} />

        <div
          className={`eventhub-page-content transition-all duration-300 min-h-screen px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto ${
            open ? "md:ml-[168px]" : "md:ml-[68px]"
          }`}
        >
          {/* State 1: No Business Profile (For user who hasn't created one yet) */}
          {!isOrganizer && !editingProfile && isOwner && (
            <div className="flex justify-center items-center min-h-[70vh]">
              <div className="bg-white shadow-xl rounded-3xl p-10 sm:p-12 max-w-2xl text-center border border-gray-100">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 size={46} className="text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  Start Your Business Profile
                </h1>
                <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-8">
                  Showcase your decor setups, catering banquets, and services to thousands of event planners on EventHub.
                </p>
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-95 transition cursor-pointer"
                >
                  Create Business Profile
                </button>
              </div>
            </div>
          )}

          {/* State 2: Editing Profile Form (Owner only) */}
          {editingProfile && isOwner && (
            <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-10 border border-gray-100 mb-8">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isOrganizer ? "Edit Business Profile" : "Create Business Profile"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Update your public business identity, contacts, and services.
                  </p>
                </div>
                {isOrganizer && (
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Photo & Company */}
                <div className="flex flex-col sm:flex-row gap-6 items-center pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-28 h-28 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold overflow-hidden shadow-md">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profile"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        company.charAt(0).toUpperCase() || "B"
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full shadow border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <Pencil size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfilePhoto(file);
                            setProfilePhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs  font-semibold text-gray-700 mb-1">
                      Business / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Royal Weddings & Decor"
                      className="w-full text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    About Business / Bio
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your expertise, aesthetic style, and event capabilities..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Services & Price Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Services Offered (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="e.g. Wedding Decoration, Catering, Photography"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Packages / Starting Price Range
                    </label>
                    <input
                      type="text"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      placeholder="e.g. ₹25,000 onwards"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Contacts & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Office Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 104 Palace Road"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Cities Covered
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kanpur, Lucknow"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@business.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  {isOrganizer && (
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow hover:opacity-95 transition"
                  >
                    {isOrganizer ? "Save Profile Changes" : "Create Business Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* State 3: Active Profile View (Owner or Public) */}
          {isOrganizer && !editingProfile && (
            <div className="space-y-8">
              {/* Profile Header Card */}
              <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                {/* Cover Banner */}
                <div className="md:h-48 h-36 bg-gradient-to-r from-primary to-purple-600 relative" />

                <div className="md:px-10 px-6 pb-10">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20 mb-6">
                    {/* Avatar Circle */}
                    <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-xl flex items-center justify-center font-bold text-4xl text-primary overflow-hidden border-4 border-white shrink-0">
                      {organizerData?.profile_photo ? (
                        <img
                          src={getImageUrl(organizerData.profile_photo)}
                          alt={company}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        company.charAt(0).toUpperCase() || "E"
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between flex-1 gap-4">
                      <div className="relative z-10 translate-y-3">
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {company}
                          </h1>
                          {rating > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700">
                              <Star size={13} className="text-yellow-500 fill-yellow-500" />
                              {rating}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">
                          @{organizerData?.username} • Verified Event Partner
                        </p>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-3">
                        {isOwner ? (
                          <>
                            <button
                              onClick={() => setEditingProfile(true)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                            >
                              <Pencil size={15} /> Edit Profile
                            </button>
                            <button
                              onClick={() => {
                                setEditingPost(null);
                                setIsPostModalOpen(true);
                              }}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:opacity-95 transition cursor-pointer"
                            >
                              <CirclePlus size={16} /> Add Work
                            </button>
                          </>
                        ) : (
                          /* Public Visitor Action: Book Now */
                          <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition cursor-pointer text-sm"
                          >
                            <Calendar size={18} /> Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1">Services Offered</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {services || "Custom Planning"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1">Cities & Service Areas</span>
                      <span className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                        <MapPin size={14} className="text-primary shrink-0" />
                        {location || "All Regions"}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1">Starting Package Range</span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {priceRange || "Inquire for quote"}
                      </span>
                    </div>
                  </div>

                  {/* Bio Description */}
                  {bio && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-800 mb-2">About The Business</h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                        {bio}
                      </p>
                    </div>
                  )}

                  {/* Contacts */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
                    {address && (
                      <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                        <MapPin size={14} className="text-primary" />
                        <span>{address}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                        <Phone size={14} className="text-primary" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                        <Mail size={14} className="text-primary" />
                        <span>{email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Navigation Tabs */}
              {isOwner && (
                <div className="flex border-b border-gray-200 gap-8">
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className={`pb-3 font-semibold text-sm transition cursor-pointer ${
                      activeTab === "portfolio"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Portfolio Works ({allPosts.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`pb-3 font-semibold text-sm transition cursor-pointer flex items-center gap-2 ${
                      activeTab === "bookings"
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>Incoming Bookings</span>
                    {incomingBookings.filter((b) => b.status === "PENDING").length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700 font-bold">
                        {incomingBookings.filter((b) => b.status === "PENDING").length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Tab Content: Incoming Bookings (Owner only) */}
              {isOwner && activeTab === "bookings" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                      Customer Booking Requests
                    </h2>
                    <span className="text-xs text-gray-500">
                      {incomingBookings.length} total inquiries
                    </span>
                  </div>

                  {bookingsLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading inquiries...</div>
                  ) : incomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {incomingBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-base">
                                {b.event_type || "Event"} - {b.service}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  b.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-800"
                                    : b.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              Client: <strong className="text-gray-700">@{b.user_username}</strong> • Reference: #{b.id}
                            </p>

                            <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-primary" /> {b.event_date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-primary" /> {b.location}
                              </span>
                              {b.budget && (
                                <span className="flex items-center gap-1">
                                  <DollarSign size={13} className="text-primary" /> {b.budget}
                                </span>
                              )}
                              {b.contact_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={13} className="text-primary" /> {b.contact_phone}
                                </span>
                              )}
                            </div>

                            {b.special_notes && (
                              <p className="text-xs text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100 mt-2">
                                "{b.special_notes}"
                              </p>
                            )}
                          </div>

                          {/* Accept / Reject actions */}
                          {b.status === "PENDING" && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleBookingStatusChange(b.id, "CONFIRMED")}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition"
                              >
                                <CheckCircle size={14} /> Accept
                              </button>
                              <button
                                onClick={() => handleBookingStatusChange(b.id, "CANCELLED")}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Calendar size={36} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No customer booking requests yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Portfolio Works */}
              {(!isOwner || activeTab === "portfolio") && (
                <div className="space-y-6">
                  {/* Category Chips Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {CATEGORY_FILTERS.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-gray-500 font-medium">
                      Showing {filteredPosts.length} works
                    </span>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="relative group flex flex-col">
                        <PostCard post={post} />
                        {(post.service_areas || post.packages?.length > 0) && <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs space-y-2">
                          {post.service_areas && <p className="text-gray-600"><span className="font-semibold text-gray-800">Service areas:</span> {post.service_areas}</p>}
                          {post.packages?.map((item, index) => <div key={`${item.name}-${index}`}>
                            <p className="font-semibold text-gray-800">{item.name} <span className="text-primary">{item.price}</span></p>
                            {item.inclusions && <p className="text-gray-600">{item.inclusions}</p>}
                          </div>)}
                        </div>}

                        {/* Owner Post Actions: Edit & Delete (Hidden for non-owners) */}
                        {isOwner && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPost(post);
                                setIsPostModalOpen(true);
                              }}
                              className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition inline-flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Work Card for Owner */}
                    {isOwner && (
                      <div
                        onClick={() => {
                          setEditingPost(null);
                          setIsPostModalOpen(true);
                        }}
                        className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary p-8 flex flex-col items-center justify-center text-gray-400 hover:text-primary transition cursor-pointer min-h-[260px]"
                      >
                        <CirclePlus size={44} className="mb-2" />
                        <span className="text-sm font-semibold">Publish New Work</span>
                        <span className="text-xs text-gray-400 mt-1">
                          Photos, pricing, and themes
                        </span>
                      </div>
                    )}
                  </div>

                  {filteredPosts.length === 0 && !isOwner && (
                    <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
                      <Sparkles size={36} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium">
                        No portfolio works under this category yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Post Modal (Owner only) */}
      {isOwner && (
        <CreateEditPostModal
          post={editingPost}
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingPost(null);
          }}
          onSaved={() => loadProfile()}
        />
      )}

      {/* Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete This Work?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete "
              <strong>{postToDelete.caption || postToDelete.title || "this post"}</strong>"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal (For customers / visitors) */}
      {organizerData && (
        <BookingModal
          organizer={organizerData}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
