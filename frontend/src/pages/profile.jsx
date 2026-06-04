import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";


export default function Profile() {

  const [open, setOpen] = useState(false);

    const togglesidebar = () =>{
        setOpen(!open)
    }
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
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar togglesidebar = {togglesidebar}/>

      <main className="relative h-screen pt-15">
        <Sidebar open = {open} />
    
      <div className="min-h-screen bg-gray-100 py-13">

        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <div className={`w-full lg:w-80 transition-all duration-300 h-screen p-8 ${
    open ? "md:ml-[168px]" : "md:ml-[68px]"
  }`}>

            {/* User Card */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Hello,
                  </p>

                  <h2 className="font-semibold text-lg">
                    {user.username}
                  </h2>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-lg shadow-sm mt-4">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-700">
                  ACCOUNT SETTINGS
                </h3>
              </div>

              <div className="p-4">
                <p className="text-primary font-semibold cursor-pointer">
                  Personal Information
                </p>
              </div>

              <div className="px-4 pb-4">
                <p className="text-gray-500 cursor-pointer">
                  Address Book
                </p>
              </div>

              <div className="px-4 pb-4">
                <p className="text-gray-500 cursor-pointer">
                  Saved Events
                </p>
              </div>

              <div className="px-4 pb-4">
                <p className="text-gray-500 cursor-pointer">
                  Notifications
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">

              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold">
                  Personal Information
                </h1>
              </div>

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    City
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

              </div>

              {/* Email Section */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold mb-4">
                  Login Information
                </h2>

                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">
                    Email Address
                  </p>

                  <p className="font-medium">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-10">
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
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