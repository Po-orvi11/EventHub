import { ArrowLeft, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BackNav() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center py-3 px-6 font-medium shadow justify-between fixed top-0 left-0 z-46 right-0 bg-white text-primary">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer hover:opacity-80 transition p-1 rounded-full hover:bg-gray-100"
          title="Go back"
        >
          <ArrowLeft size={27} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => navigate("/")}
          className="md:text-2xl text-xl flex items-center gap-1 cursor-pointer"
        >
          <Flower2 />
          EventHub
        </button>
      </div>
    </div>
  );
}

export default BackNav;