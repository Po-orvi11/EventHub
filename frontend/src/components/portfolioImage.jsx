import { useNavigate } from "react-router-dom"
import api from "../api"

export default function PortfolioImage({post}){
    const navigate = useNavigate()

    return (
        <>
        <div 
        className="
        bg-gray-200 2xl:h-60
        xl:h-65 lg:h-55 md:h-40 sm:h-35 h-25
        flex justify-center items-center text-gray-400"

        onClick= {()=> navigate(`/post/${post.id}`)}
        >
            <img src={post.image} alt={`post-${post.id}`} className="w-full h-full object-cover" />
        </div>
        </>
    )
}