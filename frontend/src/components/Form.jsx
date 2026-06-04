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
            console.log(error.response?.data);
            alert(JSON.stringify(error.response?.data));
            alert(error)
        }
        finally{
            setLoading(false)
        }
    };

    return (<>
    <div className=" h-screen w-full flex justify-center items-center">
    <div className="border border-secondary rounded-2xl border-2 flex h-[80%] w-[70%] flex-row justify-center items-center overflow-hidden bg-primary shadow-xl">
        

        <div className="w-[50%] flex flex-col justify-center items-center text-white md:text-lg ">

            <Heart size={40} className=""/>
             <div className="md:text-3xl mb-3">EventHub</div>
             <div className="">Plan your perfect day with elegence.</div><div> Manage guests, vendors, budgets and inspiration -</div> <div> all in one place.</div>
            </div>

<div className="flex flex-col gap-10 py-15 items-center h-full bg-white md:w-[50%]">
    

    <div className="flex gap-15 w-[70%] text-xl font-semibold">
        <button className={` border-primary p-1 ${name === 'Login' ? "border-b-0" : "border-b-4" }`} onClick={()=> navigate("/register")}>Register</button>

        <button className={` border-primary p-1 ${name === 'Login' ? "border-b-4 " : "border-b-0" }`} onClick={()=> navigate("/login")}>Login</button>
    </div>

    {(method==="login") && <div className="text-xl mt-5 font-semibold text-primary">
       Welcome Back to EventHub ♡

    </div>}


    <form onSubmit={handleSubmit} className="flex flex-col gap-2 justify-center w-[70%]">

    <label className="font-medium">Username :</label>  
    <input
    type="text"
    placeholder="Username"
    className="border rounded border-gray-200 p-2 mb-2 shadow-xs"
    value={username}
    onChange = {(e) => setUsername(e.target.value)
    }
    />

    {!(method==="login") && <div ><label className="font-medium">Email :</label><br/>
    <input 
    type="email"
    placeholder="Email ID"
    className="border rounded border-gray-200 p-2 my-2 w-full shadow-xs"
    value={email}
    onChange = {(e) => setEmail(e.target.value)}
    /></div>}

    <label className="font-medium">Password :</label>
    <input
    type="password"
    placeholder="Password"
    className="border rounded border-gray-200 p-2 mb-2 shadow-xs"
    value={password}
    onChange = {(e) => setPassword(e.target.value)}
    />

    {!(method==="login") && <div>
        <label className="font-medium">Confirm Password :</label><br/>
        <input 
    type="password"
    placeholder="Confirm Password"
    value={confirm_password}
    className="border rounded border-gray-200 p-2 my-2 w-full shadow-xs"
    onChange = {(e) => setConfirm_password(e.target.value)}
    />
    </div>}

    <button type="submit" className="bg-primary p-2 border border-primary text-white font-semibold mt-7 rounded shadow">{name}</button>

    </form>

    {(method==="login") && <div className="text-base">
       Don't have any account? <a href="/register" className="font-semibold">Register here</a>
    </div>}

    </div>
    </div>
    </div>
    </>
    )
}

export default Form