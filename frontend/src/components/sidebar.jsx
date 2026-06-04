import {Home, Compass, Bookmark, Power, Users, Plus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ open }) {
  const navigate = useNavigate()
  return (
    <div>
      <div
        className={`
          fixed
          h-screen w-42  font-bold text-xl
          bg-gray-800 text-white
          bg-primary flex flex-col
           gap-8 pt-10 pl-4
          transition-transform duration-300 ease-in-out
          z-50
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button className='flex gap-3' onClick={() => navigate("/")}>
         <Home size={28} strokeWidth={2.5}/> Home
         </button>
      
        <button className='flex gap-3' onClick={() => navigate("/explore")}>
        <Compass size={28} strokeWidth={2.5}/>Explore
        </button>
      
        <button className='flex gap-3' onClick={() => navigate("/saved")}>
        <Bookmark size={28} strokeWidth={2.5}/> Saved
        </button>
      
      <button className='flex gap-3' onClick={() => navigate("/aboutus")}>
        <Users size={28} strokeWidth={2.5}/> About Us
        </button>
      
        <button className='flex gap-3' onClick={() => navigate("/logout")}>
        <Power size={28} strokeWidth={2.5} />Log Out
        </button>

        <button className='flex gap-3' onClick={() => navigate("/organizer")}>
        <Plus size={28} strokeWidth={2.5} />Business
        </button>
      
      </div>
      
      <div
        className={`
          hidden md:flex
          fixed
          h-screen w-17
          bg-primary
          text-white
          gap-8 pt-10
          items-center flex-col
          transition-all duration-300
          ${open ? "opacity-0" : "opacity-100"}
        `}
      >
        <button onClick={() => navigate("/")}>
        <Home size={28} strokeWidth={2.5}/>
        </button>
        <button onClick={() => navigate("/explore")}>
        <Compass size={28} strokeWidth={2.5}/>
        </button>
        <button onClick={() => navigate("/saved")}>
        <Bookmark size={28} strokeWidth={2.5}/>
        </button>
        <button onClick={() => navigate("/aboutus")}>
        <Users size={28} strokeWidth={2.5}/>
        </button>
        <button onClick={() => navigate("/logout")}>
        <Power size={28} strokeWidth={2.5} />
        </button>
         <button onClick={() => navigate("/organizer")}>
        <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}