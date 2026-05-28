import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import { Heart } from 'lucide-react';

function Form({route, method}){
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm_password, setConfirm_password] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const name = method === "login" ? "Login" : "Register"

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try{
            const fields = method=== "login" ? {username, password} : {username,email, password, confirm_password}
            const res =await api.post(route, fields);

            if(method==="login"){
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN,res.data.refresh)
                navigate('/')
            }
            else{
                navigate('/login')
            }
        }
        catch(error){
            alert(error)
        }
        finally{
            setLoading(false)
        }
    };

    return <div className="bg-bgs h-screen w-full flex justify-center items-center">
    <div className="border border-secondary rounded-2xl border-2 flex h-[80%] w-[80%] flex-row  justify-center items-center overflow-hidden bg-primary">

        <div className="w-[50%] flex flex-col justify-center items-center text-black md:text-lg ">

            <Heart size={40} className=""/>
             <div className="md:text-3xl mb-3">EventHub</div>
             <div className="">Plan your perfect day with elegence.</div><div> Manage guests, vendors, budgets and inspiration -</div> <div> all in one place.</div>
            </div>

   <div className=" flex flex-col md:w-[50%] text-center  items-center justify-center border border-gray-400 shadow-xl bg-component md:py-10 xl:px-20  sm:px-12 p-7 min-h-screen">
    <form onSubmit={handleSubmit} className="flex flex-col bg-white">
    <div>{name}</div>
    <input
    type="text"
    placeholder="Username"
    value={username}
    onChange = {(e) => setUsername(e.target.value)}
    />

    {!(method==="login") && <input 
    type="email"
    placeholder="Email ID"
    value={email}
    onChange = {(e) => setEmail(e.target.value)}
    />}

    <input
    type="password"
    placeholder="Password"
    value={password}
    onChange = {(e) => setPassword(e.target.value)}
    />

    {!(method==="login") && <input 
    type="password"
    placeholder="Confirm Password"
    value={confirm_password}
    onChange = {(e) => setConfirm_password(e.target.value)}
    />}

    <button type="submit">{name}</button>

    </form>
    </div>
    </div>
    </div>
}

export default Form