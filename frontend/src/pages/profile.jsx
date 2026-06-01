import { useEffect, useState } from "react"
import api from '../api'
import Navbar from "../components/navbar"

export default function Profile(){
    const [user, setUser] = useState(null)
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [phone, setPhone] = useState("")
    const [city, setCity] = useState("")

    useEffect(()=> {
        getProfile()
    },[]);

    const getProfile = async () => {
       try{
        const res = await api.get("/api/profile/")
        setUser(res.data)
        setFirstname(res.data.firstname)
        setLastname(res.data.lastname)
        setPhone(res.data.phone)
        setCity(res.data.city)
       }
       catch(error){
        console.log(error)
       }
    }

    const updateProfile = async ()=> {
        try {
            const res = await api.patch("/api/profile/", {
                firstname,lastname,phone,city
            })
            alert("Profile Update")
        }
        catch(error){
        console.log(error)
       }
    }
    if (!user) {
        return <p>Loading...</p>
    }

    return (<>
    <Navbar/>
    <div className="flex h-screen">

        <div className="bg-blue-200 w-50">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
        </div>

        <div className="bg-gray-500 w-100">
            <h1>Personal Information</h1>

            <input
            type="text"
            placeholder="Firstname"
            value={firstname || ""}
            onChange={(e)=> setFirstname(e.target.value)}
            />

             <input
            type="text"
            placeholder="Lastname"
            value={lastname || ""}
            onChange={(e)=> setLastname(e.target.value)}
            />

             <input
            type="text"
            placeholder="Phone No."
            value={phone || ""}
            onChange={(e)=> setPhone(e.target.value)}
            />

             <input
            type="text"
            placeholder="City"
            value={city || ""}
            onChange={(e)=> setLocation(e.target.value)}
            />

            <button onClick={updateProfile}>Save</button>

        </div>
    </div>
    </>)
}