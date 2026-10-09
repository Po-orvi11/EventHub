import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  XCircle,
  Building2,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const initialTab = searchParams.get("tab") === "bookings" ? "bookings" : "personal";
  const [activeTab, setActiveTab] = useState(initialTab);

  const togglesidebar = () => {
    setOpen(!open);
  };

  const [user, setUser] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  // Customer Bookings
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    getProfile();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "bookings") {
      setActiveTab("bookings");
    } else if (tab === "personal") {
      setActiveTab("personal");
    }
  }, [searchParams]);

  const getProfile = async () => {
    try {
      const res = await api.get("/api/profile/");
      setUser(res.data);
      setFirstname(res.data.firstname || "");
      setLastname(res.data.lastname || "");
      setPhone(res.data.phone || "");
      setCity(res.data.city || "");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await api.get("/api/bookings/");
      setMyBookings(res.data || []);
    } catch (error) {
      console.error("Failed to fetch customer bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await api.patch("/api/profile/", {
        firstname,
        lastname,
        phone,
        city,
      });
      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking inquiry? This action cannot be undone."
    );
    if (!confirmCancel) return;

    try {
      setCancelingId(bookingId);
      await api.patch(`/api/bookings/${bookingId}/`, {
        status: "CANCELLED",
      });
      setMyBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again later.");
    } finally {
      setCancelingId(null);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "bookings" ? { tab: "bookings" } : {});
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-lg text-gray-600 font-medium">Loading...</p>
        </div>
      </>
    );
  }

  const pendingCount = myBookings.filter((b) => b.status === "PENDING").length;

  return (
    <>
      <Navbar togglesidebar={togglesidebar} />

      <main className="relative min-h-screen pt-15 bg-gray-100">
        <Sidebar open={open} />

        <div className="py-8">
          <div
            className={`eventhub-page-content max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6 transition-all duration-300 ${
              open ? "md:ml-[168px]" : "md:ml-[68px]"
            }`}
          >
            {/* Sidebar Column */}
            <div className="w-full lg:w-80">
              {/* User Card */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Hello,</p>
                    <h2 className="font-semibold text-lg">{user.username}</h2>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="bg-white rounded-2xl shadow-sm mt-4 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-xs tracking-wider">
                    ACCOUNT SETTINGS
                  </h3>
                </div>

                {/* Personal Information Tab */}
                <div
                  className={`p-4 cursor-pointer transition flex items-center justify-between ${
                    activeTab === "personal"
                      ? "border-l-4 border-primary bg-primary/5 text-primary font-semibold"
                      : "hover:bg-gray-50 text-gray-700 font-medium"
                  }`}
                  onClick={() => switchTab("personal")}
                >
                  <p className="text-sm">Personal Information</p>
                </div>

                {/* My Bookings Tab */}
                <div
                  className={`p-4 cursor-pointer transition flex items-center justify-between ${
                    activeTab === "bookings"
                      ? "border-l-4 border-primary bg-primary/5 text-primary font-semibold"
                      : "hover:bg-gray-50 text-gray-700 font-medium"
                  }`}
                  onClick={() => switchTab("bookings")}
                >
                  <p className="text-sm">My Bookings</p>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      {pendingCount}
                    </span>
                  )}
                </div>

                {/* Saved Events */}
                <div
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/saved")}
                >
                  <p className="text-gray-600 hover:text-primary text-sm font-medium">
                    Saved Events
                  </p>
                </div>

                {/* Browsing History */}
                <div
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/history")}
                >
                  <p className="text-gray-600 hover:text-primary text-sm font-medium">
                    Browsing History
                  </p>
                </div>

                {/* Business Profile */}
                <div
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/organizer")}
                >
                  <p className="text-gray-600 hover:text-primary text-sm font-medium">
                    Business Profile
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "personal" && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Personal Information
                    </h1>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="mt-8">
                    <h2 className="text-base font-semibold text-gray-800 mb-3">
                      Login Information
                    </h2>
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-800 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-8">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* My Bookings View */}
              {activeTab === "bookings" && (
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        My Bookings
                      </h1>
                      <p className="text-xs text-gray-500 mt-1">
                        Track your event reservations and booking status with organizers.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                      {myBookings.length} {myBookings.length === 1 ? "Inquiry" : "Inquiries"}
                    </span>
                  </div>

                  {bookingsLoading ? (
                    <div className="py-16 text-center text-gray-500">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm font-medium">Loading your bookings...</p>
                    </div>
                  ) : myBookings.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        No Bookings Found
                      </h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                        You have not submitted any event inquiries yet. Explore our verified organizers to plan your special occasion.
                      </p>
                      <button
                        onClick={() => navigate("/explore")}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow hover:opacity-95 transition cursor-pointer"
                      >
                        Explore Event Organizers
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((b) => {
                        const isPending = b.status === "PENDING";
                        const isConfirmed = b.status === "CONFIRMED";
                        const isCancelled = b.status === "CANCELLED";

                        return (
                          <div
                            key={b.id}
                            className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-xs"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-base text-gray-900">
                                  {b.event_type || "Event"} — {b.service}
                                </span>
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    isConfirmed
                                      ? "bg-green-100 text-green-800"
                                      : isCancelled
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Building2 size={14} className="text-primary shrink-0" />
                                <span>Organizer:</span>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/organizer?id=${b.organizer}`)}
                                  className="font-semibold text-primary hover:underline cursor-pointer"
                                >
                                  {b.organizer_company || "Organizer"}
                                </button>
                                <span className="text-gray-400">• Ref #{b.id}</span>
                              </div>

                              <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar size={13} className="text-primary" />
                                  {b.event_date}
                                </span>
                                {b.event_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={13} className="text-primary" />
                                    {b.event_time}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <MapPin size={13} className="text-primary" />
                                  {b.location}
                                </span>
                                {b.budget && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={13} className="text-primary" />
                                    {b.budget}
                                  </span>
                                )}
                              </div>

                              {b.special_notes && (
                                <p className="text-xs text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100 mt-2">
                                  "{b.special_notes}"
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => navigate(`/organizer?id=${b.organizer}`)}
                                className="px-4 py-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                View Organizer
                              </button>

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(b.id)}
                                  disabled={cancelingId === b.id}
                                  className="inline-flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                >
                                  <XCircle size={14} />
                                  {cancelingId === b.id ? "Canceling..." : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
