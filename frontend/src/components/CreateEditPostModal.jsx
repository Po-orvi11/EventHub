import React, { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import api from "../api";
import { getImageUrl } from "./PostCard";

const EVENT_CATEGORIES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Reception",
  "Anniversary",
  "Engagement",
  "Other",
];

const SERVICE_CATEGORIES = [
  "Decoration",
  "Catering",
  "Photography",
  "Music & Sound",
  "Venue",
  "Makeup & Styling",
  "Full Planning",
  "Other",
];

export default function CreateEditPostModal({ post = null, isOpen, onClose, onSaved }) {
  const isEditing = Boolean(post?.id);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [eventCategory, setEventCategory] = useState("Wedding");
  const [serviceCategory, setServiceCategory] = useState("Decoration");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [packages, setPackages] = useState([]);
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setCaption(post.caption || "");
      setDescription(post.description || "");
      setEventCategory(post.event_category || "Wedding");
      setServiceCategory(post.service || "Decoration");
      setCity(post.city || "");
      setLocality(post.locality || "");
      setServiceAreas(post.service_areas || "");
      setPackages(Array.isArray(post.packages) ? post.packages : []);
      setPrice(post.price || "");
      setAvailability(post.availability || "Available");
      setMainImagePreview(post.image ? getImageUrl(post.image) : "");
      setMainImage(null);
      setAdditionalImages([]);
      setAdditionalPreviews([]);
    } else {
      resetForm();
    }
  }, [post, isOpen]);

  const resetForm = () => {
    setTitle("");
    setCaption("");
    setDescription("");
    setEventCategory("Wedding");
    setServiceCategory("Decoration");
    setCity("");
    setLocality("");
    setServiceAreas("");
    setPackages([]);
    setPrice("");
    setAvailability("Available");
    setMainImage(null);
    setMainImagePreview("");
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setErrorMessage("");
  };

  if (!isOpen) return null;

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("The cover photo must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Cover photo must be under 5MB.");
      return;
    }

    setErrorMessage("");
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (additionalImages.length + files.length > 10) {
      setErrorMessage("You can upload a maximum of 10 additional gallery photos.");
      return;
    }

    for (let f of files) {
      if (!f.type.startsWith("image/")) {
        setErrorMessage("All gallery files must be valid images.");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMessage("Each gallery photo must be under 5MB.");
        return;
      }
    }

    setErrorMessage("");
    const updatedFiles = [...additionalImages, ...files];
    setAdditionalImages(updatedFiles);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePackage = (index, field, value) => {
    setPackages((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addPackage = () => setPackages((current) => [...current, { name: "", price: "", inclusions: "" }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!caption && !title) {
      setErrorMessage("Please provide a title or caption for the post.");
      return;
    }

    if (!isEditing && !mainImage) {
      setErrorMessage("Please upload a cover image for the post.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("description", description);
      formData.append("event_category", eventCategory);
      formData.append("service", serviceCategory);
      formData.append("city", city);
      formData.append("locality", locality);
      formData.append("service_areas", serviceAreas);
      formData.append("packages", JSON.stringify(packages.filter((item) => item.name.trim() || item.price.trim() || item.inclusions.trim())));
      formData.append("price", price);
      formData.append("availability", availability);

      if (mainImage) {
        formData.append("image", mainImage);
      }

      for (let file of additionalImages) {
        formData.append("additional_images", file);
      }

      if (isEditing) {
        await api.patch(`/api/post/${post.id}/manage/`, formData);
      } else {
        await api.post("/api/post/create/", formData);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Save post error:", err);
      const serverErr =
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        "Failed to save post. Please check the inputs.";
      setErrorMessage(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Work Showcase" : "Add New Event Work"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? "Update your event details, pricing, and showcase photos."
                : "Publish photos and event details to your business portfolio."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Main Cover Photo (Required, Max 5MB)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {mainImagePreview ? (
                <div className="relative w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={mainImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute bottom-2 right-2 bg-white/90 text-primary p-1.5 rounded-lg shadow-sm hover:bg-white text-xs font-medium cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-2xl h-36 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                  <Upload size={28} className="text-primary mb-1" />
                  <span className="text-xs text-gray-500 font-medium">
                    Upload cover photo (PNG, JPG, WebP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Multiple Gallery Photos Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Additional Gallery Photos (Optional, up to 10 images)
            </label>
            <div className="flex flex-wrap gap-3">
              {additionalPreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                >
                  <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {additionalPreviews.length < 10 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition text-gray-400 hover:text-primary">
                  <Plus size={22} />
                  <span className="text-[10px] font-medium">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Title / Theme Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Pastel Mandap Setup"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Headline / Short Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Grand floral wedding stage in Kanpur"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Category & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Category
              </label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Service Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {SERVICE_CATEGORIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City / Coverage Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kanpur, Lucknow"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Locality / Venue Area
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Civil Lines, Gomti Nagar"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Price or Starting Range
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹35,000 onwards"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service Areas</label>
              <input type="text" value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder="e.g. Kanpur, Lucknow, Unnao" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-xs font-semibold text-gray-700">Packages / Services</span><button type="button" onClick={addPackage} className="text-primary text-xs font-semibold">Add package</button></div>
              {packages.map((item, index) => <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl border border-gray-200 p-3">
                <input value={item.name || ""} onChange={(e) => updatePackage(index, "name", e.target.value)} placeholder="Package name" className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" />
                <input value={item.price || ""} onChange={(e) => updatePackage(index, "price", e.target.value)} placeholder="Price" className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" />
                <input value={item.inclusions || ""} onChange={(e) => updatePackage(index, "inclusions", e.target.value)} placeholder="Inclusions / services" className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" />
                <button type="button" onClick={() => setPackages((current) => current.filter((_, i) => i !== index))} className="text-red-600 text-xs text-left sm:col-span-3">Remove package</button>
              </div>)}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Availability Status
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Available, Booking for Winter 2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Showcase Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the themes, floral choices, catering cuisine, or setup nuances for this event..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
              {loading ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
