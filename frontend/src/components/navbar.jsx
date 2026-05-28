import { CircleUserRound, Link, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"


function Navbar({togglesidebar}){
    const navigate = useNavigate();

    return (
    <div className="bg-primary flex items-center p-4 gap-3 font-medium ">
        <Menu onClick={togglesidebar} size={25}/>
        <div to={"/"} className="md:text-3xl text-xl ">
          EventHub
        </div>
        <button onClick={() => navigate("/profile")}>
        <CircleUserRound size={30}/>
        </button>
    </div>
    )
}

export default Navbar