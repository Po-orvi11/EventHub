import { useEffect, useState } from "react"
import api from '../api'

export default function Profile(){
    const [user, setUser] = useState(null)
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")

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
        setLocation(res.data.location)
       }
       catch(error){
        console.log(error)
       }
    }

    const updateProfile = async ()=> {
        try {
            const res = await api.patch("/api/profile/", {
                firstname,lastname,phone,location
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

    return <div className="flex h-screen">

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
            placeholder="Location"
            value={location || ""}
            onChange={(e)=> setLocation(e.target.value)}
            />

            <button onClick={updateProfile}>Save</button>

        </div>
    </div>
}