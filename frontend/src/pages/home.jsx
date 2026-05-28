import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import { useState } from 'react'
export default function Home(){
   
    const [open, setOpen] = useState(false);

    const togglesidebar = () =>{
        setOpen(!open)
    }

    return <div className='bg-gray-100 h-screen'>
    <Navbar togglesidebar = {togglesidebar}/>
    <main className='relative h-screen'>
    <Sidebar open = {open} />
    
    </main>
    </div>
}
