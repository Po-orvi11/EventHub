import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";

export default function BookingModal({
  organizer,
  post = null,
  isOpen,
  onClose,
  onSuccess,
}) {
  const navigate = useNavigate();

  const [service, setService] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("Evening (6:00 PM onwards)");
  const [location, setLocation] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [budget, setBudget] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmedBooking(null);
      setErrorMessage("");

      // Prefill service from post or organizer
      if (post?.service) {
        setService(post.service);
      } else if (organizer?.services && organizer.services.length > 0) {
        setService(
          Array.isArray(organizer.services)
            ? organizer.services[0]
            : String(organizer.services).split(",")[0]
        );
      } else {
        setService("Full Event Planning");
      }

      // Prefill event type if post has event category
      if (post?.event_category) {
        setEventType(post.event_category);
      }

      // Prefill location from post city or organizer location
      if (post?.city) {
        setLocation(post.city);
      } else if (organizer?.location) {
        setLocation(organizer.location);
      }

      // Prefill contact from user profile
      loadUserProfile();
    }
  }, [isOpen, organizer, post]);

  const loadUserProfile = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return;
    try {
      const res = await api.get("/api/profile/");
      if (res.data?.phone && !contactPhone) setContactPhone(res.data.phone);
      if (res.data?.email && !contactEmail) setContactEmail(res.data.email);
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      navigate("/login");
      return;
    }

    if (!organizer?.id) {
      setErrorMessage("Organizer information is missing.");
      return;
    }

    if (!eventDate) {
      setErrorMessage("Please select a date for your event.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage("Please specify the event location or city.");
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMessage("Please provide a contact phone number.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        organizer: organizer.id,
        post: post?.id || null,
        service: service || "Event Planning",
        event_type: eventType || "Wedding",
        event_date: eventDate,
        event_time: eventTime,
        location: location.trim(),
        guests_count: guestsCount ? parseInt(guestsCount, 10) : null,
        budget: budget.trim(),
        special_notes: specialNotes.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
      };

      const res = await api.post("/api/bookings/", payload);
      setConfirmedBooking(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.error("Booking error:", err);
      const data = err.response?.data;
      let msg = "Failed to submit booking inquiry. Please check the details.";

      if (data?.non_field_errors && data.non_field_errors.length > 0) {
        msg = data.non_field_errors[0];
      } else if (data?.detail) {
        msg = data.detail;
      } else if (typeof data === "string") {
        msg = data;
      } else if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]);
        }
      }

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto no-scrollbar border border-gray-100 animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Book With {organizer?.company || "Organizer"}
              </h2>
              <p className="text-xs text-gray-500">
                Submit an inquiry and reserve your event date.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {confirmedBooking ? (
          /* Confirmed Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Booking Inquiry Submitted!
            </h3>

            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Your inquiry for <strong>{confirmedBooking.event_type} ({confirmedBooking.service})</strong> on{" "}
              <strong>{confirmedBooking.event_date}</strong> has been transmitted to{" "}
              <strong>{confirmedBooking.organizer_company}</strong>.
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference:</span>
                <span className="font-semibold text-gray-800">#{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                  {confirmedBooking.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold text-gray-800">{confirmedBooking.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold text-gray-800">{confirmedBooking.event_date}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              The organizer will review your inquiry and follow up directly via phone or email. No upfront payment required.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow hover:opacity-95 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Service & Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Service / Package *
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Wedding Decoration, Catering, Photography"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Wedding">Wedding Celebration</option>
                  <option value="Birthday">Birthday Party</option>
                  <option value="Reception">Reception</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Corporate">Corporate Gala</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Other">Other Event</option>
                </select>
              </div>
            </div>

            {/* Date and Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preferred Time / Slot
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g. Evening 6:00 PM onwards"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Location & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grand Palace Hall, Kanpur"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Guest Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Estimated Budget (Optional)
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₹50,000 - ₹75,000"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Requirements & Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Specific Theme, Style, or Catering Requirements
              </label>
              <textarea
                rows={3}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Share any special floral preferences, buffet requests, or questions..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow hover:opacity-95 transition disabled:opacity-50"
              >
                {loading ? "Submitting Inquiry..." : "Confirm & Send Inquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
