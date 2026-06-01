import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import { useState } from 'react'
export default function AboutUs(){
   
    const [open, setOpen] = useState(false);

    const togglesidebar = () =>{
        setOpen(!open)
    }

    return <div className='h-screen'>
    <Navbar togglesidebar = {togglesidebar}/>
    <main className='relative h-screen'>
    <Sidebar open = {open} />
    </main>
    </div>
}
