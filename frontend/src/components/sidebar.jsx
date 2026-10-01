import { Home, Compass, Bookmark, Power, Users, Plus, History, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ open }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Expanded Drawer Sidebar */}
      <div
        className={`
          fixed
          h-screen w-48 font-bold text-lg
          bg-primary text-white flex flex-col
          gap-6 pt-8 pl-5
          transition-transform duration-300 ease-in-out
          z-50 shadow-2xl
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/")}>
          <Home size={24} strokeWidth={2.5} /> Home
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/explore")}>
          <Compass size={24} strokeWidth={2.5} /> Explore
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/search")}>
          <Search size={24} strokeWidth={2.5} /> Search
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/saved")}>
          <Bookmark size={24} strokeWidth={2.5} /> Saved
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/history")}>
          <History size={24} strokeWidth={2.5} /> History
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/aboutus")}>
          <Users size={24} strokeWidth={2.5} /> About Us
        </button>

        <button className="flex items-center gap-3 hover:opacity-85 transition cursor-pointer" onClick={() => navigate("/organizer")}>
          <Plus size={24} strokeWidth={2.5} /> Business
        </button>

        <div className="pt-4 border-t border-white/20 mt-auto pb-8">
          <button className="flex items-center gap-3 text-red-100 hover:text-white transition cursor-pointer" onClick={() => navigate("/logout")}>
            <Power size={24} strokeWidth={2.5} /> Log Out
          </button>
        </div>
      </div>

      {/* Collapsed Desktop Rail */}
      <div
        className={`
          hidden md:flex
          fixed
          h-screen w-17
          bg-primary
          text-white
          gap-7 pt-8
          items-center flex-col
          transition-all duration-300
          z-40 shadow-sm
          ${open ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        <button title="Home" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/")}>
          <Home size={26} strokeWidth={2.5} />
        </button>
        <button title="Explore" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/explore")}>
          <Compass size={26} strokeWidth={2.5} />
        </button>
        <button title="Search" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/search")}>
          <Search size={26} strokeWidth={2.5} />
        </button>
        <button title="Saved Events" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/saved")}>
          <Bookmark size={26} strokeWidth={2.5} />
        </button>
        <button title="View History" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/history")}>
          <History size={26} strokeWidth={2.5} />
        </button>
        <button title="About Us" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/aboutus")}>
          <Users size={26} strokeWidth={2.5} />
        </button>
        <button title="Business Profile" className="hover:scale-110 transition cursor-pointer" onClick={() => navigate("/organizer")}>
          <Plus size={26} strokeWidth={2.5} />
        </button>
        <div className="mt-auto pb-8">
          <button title="Log Out" className="hover:scale-110 text-red-100 hover:text-white transition cursor-pointer" onClick={() => navigate("/logout")}>
            <Power size={26} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}