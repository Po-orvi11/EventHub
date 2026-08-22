import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import PortfolioImage from "../components/portfolioImage";
import { useEffect, useState } from "react";
import {Building2, MapPin, Phone, Mail, Briefcase, Pencil, Star, CirclePlus, Upload} from "lucide-react";
import api from "../api";

export default function Organizer() {
  const [open, setOpen] = useState(false);

  const [company, setCompany] = useState("");
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState("");
  const [rating, setRating] = useState(0);

  const [caption, setCaption] = useState("")
  const [service, setService] = useState("")
  const [city, setCity] = useState("")
  const [image, setImage] = useState(null)

  const [isOrganizer, setIsOrganizer] = useState(false);
  const [editing, setEditing] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const res = await api.get("/api/organizer/update/");

      setUser(res.data);
      setCompany(res.data.company || "");
      setBio(res.data.bio || "");
      setAddress(res.data.address || "");
      setLocation(res.data.location || "");
      setPhone(res.data.phone || "");
      setEmail(res.data.email || "");
      setServices(res.data.services || "");
      setRating(res.data.rating || 0);

      setIsOrganizer(true);
      setEditing(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setIsOrganizer(false);
      } else {
        console.log(error);
      }
    }
  };

  const updateProfile = async () => {
    const fields = {company,bio,address,location,phone,email, services,rating};

    try {
      if (!isOrganizer) {
        await api.post("/api/organizer/create/", fields);
        alert("Business Profile Created");
      } else {
        await api.patch("/api/organizer/update/", fields);
        alert("Business Profile Updated");
      }

      setIsOrganizer(true);
      setEditing(false);
      getProfile();
    } catch (error) {
      console.log(error);
    }
  };

  const createPost = async () => {
    
    const formData = new FormData();

    formData.append("caption",caption)
    formData.append("service",service)
    formData.append("city",city)

    if(image){
      formData.append("image",image)
    }

    try{
      await api.post("/api/post/create/",formData)
      alert("Post Created")
      setEditing(false)
    } catch(error){
      console.log(error.response?.data)
    }
  }


  return (
    <div className="h-screen">
      <Navbar togglesidebar={toggleSidebar} />

      <main className="relative md:pt-15 pt-7">
        <Sidebar open={open} />

        <div
  className={`transition-all duration-300 h-screen md:p-6 ${
    open ? "md:ml-[168px]" : "md:ml-[68px]"
  }`}
>
          {/* No Profile */}
          {!isOrganizer && !editing && (
  <div className="flex justify-center items-center h-[80vh]">
    <div className="bg-white shadow-xl rounded-3xl p-12 max-w-2xl text-center border border-gray-100">

      <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Building2 size={45} className="text-primary" />
      </div>

      <h1 className="text-4xl font-bold mt-6">
        Start Your Business
      </h1>

      <p className="text-gray-500 mt-3 text-lg">
        Showcase your services, attract clients and manage your
        event business professionally through EventHub.
      </p>

      <button
        onClick={() => setEditing(true)}
        className="mt-8 px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
      >
        Create Business Profile
      </button>
    </div>
  </div>
)}

          {/* Form */}
         {editing && (
  <div className="bg-white shadow-xl rounded-3xl p-10">

    <div className="flex flex-col md:flex-row gap-6 items-center border-b pb-8">

      <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
        {company ? company.charAt(0).toUpperCase() : "B"}
      </div>

      <div className="flex-1">
        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="text-3xl font-bold outline-none w-full"
        />

        <p className="text-gray-500 mt-2">
          @{user?.username}
        </p>
      </div>

      <button
        onClick={updateProfile}
        className="bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
      >
        {isOrganizer ? "Update Profile" : "Create Profile"}
      </button>
    </div>

    <div className="grid md:grid-cols-2 gap-4 mt-8">

      <textarea
        rows={5}
        placeholder="Tell clients about your business..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="md:col-span-2 border rounded-xl p-4 bg-gray-50 focus:outline-none resize-none"
      />

      <input
        type="text"
        placeholder="Services"
        value={services}
        onChange={(e) => setServices(e.target.value)}
        className="border rounded-xl p-3 bg-gray-50"
      />

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border rounded-xl p-3 bg-gray-50"
      />

      <input
        type="text"
        placeholder="Cities Covered"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border rounded-xl p-3 bg-gray-50"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border rounded-xl p-3 bg-gray-50"
      />

      <input
        type="email"
        placeholder="Business Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-xl p-3 bg-gray-50"
      />
    </div>

     <div className="md:w-[50%] w-full mt-5">
          <div className="bg-white rounded-2xl shadow-lg p-6 border">
            <h2 className="text-2xl font-bold mb-6">
              Add New Work
            </h2>

            {/* Upload */}
            <label className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer hover:border-primary">
              <Upload size={36} />
              <span className="mt-2 text-gray-500">
                Upload Event Image
              </span>

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e)=>setImage(e.target.files[0])
                }
              />
            </label>

            {/* Inputs */}
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Service"
                className="w-full border rounded-xl p-2"
                onChange={(e)=> setService(e.target.value)}
              />

              <input
                type="text"
                placeholder="City"
                className="w-full border rounded-xl p-2"
                onChange={(e)=> setCity(e.target.value)}
              />

              <textarea
                placeholder="Work Description"
                rows={4}
                className="w-full border rounded-xl p-2 resize-none"
                onChange={(e)=> setCaption(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2 border rounded-xl"
              >
                Cancel
              </button>

              <button className="px-5 py-2 bg-primary text-white rounded-xl " onClick={createPost}>
                Save Post
              </button>
            </div>
          </div>
        </div>
    
  </div>
)}

          {/* Profile Page */}
          {isOrganizer && !editing && (
  <div className="bg-white shadow-xl rounded-3xl overflow-hidden">

    {/* Cover */}
    <div className="md:h-48 h-35 bg-gradient-to-r from-primary to-purple-600"></div>

    <div className="md:px-10 px-7 pb-10">

      <div className="flex flex-col sm:flex-row sm:items-end md:gap-6 gap-4 -mt-16">
<div>
        <div className="sm:w-32 sm:h-32 h-25 w-25 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl font-bold text-primary">
          {company.charAt(0).toUpperCase()}
        </div>
        </div>
        <div className="flex items-end justify-between w-full md:mt-10 ">
        <div className="flex-1 ">
          <h1 className="md:text-3xl text-2xl font-bold">
            {company}
          </h1>

          <p className="text-gray-500">
            @{user?.username}
          </p>
        </div>

        
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 bg-primary text-white md:px-6 md:py-3 rounded-xl md:w-40 w-10 px-3 py-3 font-semibold"
        >
          <Pencil size={18} />
         <div className="hidden md:block"> Edit Profile</div>
        </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-7">

        <div className="bg-gray-50 rounded-2xl px-5 sm:py-5 py-3">
          <div className="text-gray-500">
            Services
          </div>
          <div className="font-semibold text-lg">
            {services || "Not Added"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl  px-5 sm:py-5 py-3">
          <div className="text-gray-500">
            Cities Covered
          </div>
          <div className="font-semibold text-lg">
            {location || "Not Added"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl px-5 sm:py-5 py-3">
          <div className="text-gray-500">
            Rating
          </div>
          <div className="font-semibold text-lg flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            {rating || "New"}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          About Business
        </h2>

        <p className="text-gray-600 leading-relaxed">
          {bio}
        </p>
      </div>

      {/* Contact */}
      <div className="mt-7 grid md:grid-cols-2 sm:gap-5 gap-3">

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
          <MapPin />
          {address}
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
          <Phone />
          {phone}
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl md:col-span-2">
          <Mail />
          {email}
        </div>

      </div>

      <div className="mt-4 -mx-3">
        <div className="text-2xl font-semibold mb-4 p-3">Works</div>
        <div className="bg-gray-100  w-full rounded-lg p-3 lg:gap-3 gap-2 grid 2xl:grid-cols-6 lg:grid-cols-5 sm:grid-cols-4 grid-cols-3">
           {
            user?.portfolio_images?.map((post)=>{
              return (
              <PortfolioImage key={post.id} post={post}
              />
              )
            })
           }
           <div className="bg-gray-200 2xl:h-60 xl:h-55 lg:h-50 md:h-40 sm:h-35 h-25 flex justify-center items-center text-gray-400" onClick={() => setEditing(true)} >
            <CirclePlus size={60}/>
           </div>
           
        </div>
      </div>

    </div>
  </div>
)}
        </div>
      </main>
    </div>
  );
}