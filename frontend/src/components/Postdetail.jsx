import { useParams } from "react-router-dom"
import api from "../api";
import { useEffect, useState } from "react";
import BackNav from "./BackNav";

export default function PostDetail(){
    const { id } = useParams();
    const [post, setPost] = useState(null)

    useEffect(() => {
        getPost()
    },[])

    const getPost = async() =>{
        const res = await api.get(`/api/post/${id}/`)
        setPost(res.data)
        if(!post){
            return <p>Loading...</p>
        }
    }

    return (<>
        <div>
            <BackNav/>
            <div className="flex justify-center items-center h-screen w-full">
                <div className="h-[65%] w-[40%] bg-red-300">

                </div>
            </div>
        </div>
    </>)
}