import { CircleUserRound, Flower2, Link, Menu, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"


function Navbar({togglesidebar}){
    const navigate = useNavigate();

    return (
    <div className="flex items-center py-3 px-6 font-medium shadow justify-between  ">
        <div className="flex gap-8">
        <Menu onClick={togglesidebar} size={25}/>
        <button onClick={() => navigate("/")} className="md:text-2xl text-xl text-primary flex">
         <Flower2/>
          EventHub
        </button>
        </div>
        <div className="flex gap-8">

        <div className="relative group  flex items-center">

        <Search size={20} className="absolute left-3 z-10 cursor-pointer  whitespace-nowrap text-gray-200" />{" "}        
         <input
          type="text"
          name="search"
          className=" transition-all duration-300

          w-0 opacity-0
          group-hover:w-52 group-hover:opacity-100 
          group-hover: pl-2 lg:group-hover:w-80

          sm:w-52 sm:opacity-100 sm:pl-10
          lg:w-80

          pl-2 pr-3 py-1.5 
          rounded-lg border border-primary
          outline-none
          focus:ring-2 focus:ring-primary

          overflow-hidden"
        />
      </div>
        <button onClick={() => navigate("/profile")}>
        <CircleUserRound size={28}/>
        </button>
        </div>
    </div>
    )
}

export default Navbar