import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

export default function Profile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const togglesidebar = () => {
    setOpen(!open);
  };

  const [user, setUser] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

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

  return (
    <>
      <Navbar togglesidebar={togglesidebar} />

      <main className="relative min-h-screen pt-15 bg-gray-100">
        <Sidebar open={open} />

        <div className="py-8">
          <div
            className={`max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6 transition-all duration-300 ${
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
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-700 text-xs tracking-wider">
                    ACCOUNT SETTINGS
                  </h3>
                </div>

                <div className="p-4 border-l-4 border-primary bg-primary/5">
                  <p className="text-primary font-semibold cursor-pointer text-sm">
                    Personal Information
                  </p>
                </div>

                <div
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/saved")}
                >
                  <p className="text-gray-600 hover:text-primary text-sm font-medium">
                    Saved Events
                  </p>
                </div>

                <div
                  className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate("/history")}
                >
                  <p className="text-gray-600 hover:text-primary text-sm font-medium">
                    Browsing History
                  </p>
                </div>

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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}