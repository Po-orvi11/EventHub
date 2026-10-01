import { CircleUserRound, Flower2, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar({ togglesidebar }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate("/search");
      }
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <div className="flex items-center py-3 px-6 font-medium shadow justify-between fixed top-0 left-0 z-46 right-0 bg-white">
      <div className="flex gap-8">
        <Menu onClick={togglesidebar} size={25} className="cursor-pointer" />
        <button
          onClick={() => navigate("/")}
          className="md:text-2xl text-xl text-primary flex items-center gap-1 cursor-pointer"
        >
          <Flower2 />
          EventHub
        </button>
      </div>

      <div className="flex gap-8 items-center">
        <div className="relative group flex items-center">
          <Search
            size={20}
            onClick={handleSearchClick}
            className="absolute left-3 z-10 cursor-pointer whitespace-nowrap text-gray-400 group-hover:text-primary transition"
          />{" "}
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search events, decor, food..."
            className="transition-all duration-300
              w-0 opacity-0
              group-hover:w-52 group-hover:opacity-100 
              group-hover:pl-10 lg:group-hover:w-80
              sm:w-52 sm:opacity-100 sm:pl-10
              lg:w-80
              pl-10 pr-3 py-1.5 
              rounded-lg border border-primary
              outline-none
              focus:ring-2 focus:ring-primary
              overflow-hidden text-sm cursor-text"
          />
        </div>

        <button onClick={() => navigate("/profile")} className="cursor-pointer">
          <CircleUserRound size={28} className="text-gray-700 hover:text-primary transition" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;