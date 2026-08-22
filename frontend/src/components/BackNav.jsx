import { ArrowLeft, CircleUserRound, Flower2} from "lucide-react"
import { useNavigate } from "react-router-dom"


function BackNav({togglesidebar}){
    const navigate = useNavigate();

    return (
    <div className="flex items-center py-3 px-6 font-medium shadow justify-between fixed top-0 left-0 z-46 right-0 bg-white shadow text-primary   ">
        <div className="flex gap-6">
        <ArrowLeft size={27} strokeWidth={3}/>
        <button onClick={() => navigate("/")} className="md:text-2xl text-xl  flex">
         <Flower2/>
          EventHub
        </button>
        </div>
    </div>
    )
}

export default BackNav