import Sidebar from '../components/sidebar'
import Navbar from '../components/navbar'
import { useState } from 'react'
export default function Home(){
   
    const [open, setOpen] = useState(false);

    const togglesidebar = () =>{
        setOpen(!open)
    }

    return <div className='h-screen'>
    <Navbar togglesidebar = {togglesidebar}/>
    <main className='relative h-screen pt-15'>
    <Sidebar open = {open} />
    </main>
    </div>
}
