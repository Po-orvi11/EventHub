import { useState } from 'react'
import { BrowserRouter,Routes,Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Profile from './pages/profile'
import './App.css'
import Notfound from './pages/notFound'
import ProtectedRoute from './components/ProtectedRoute'


function Logout(){
  localStorage.clear()
  return <Navigate to = '/login'/>
}

function RegisterAndLogout(){
  localStorage.clear()
  return <Register/>
}


function App() {
    return <>
     <BrowserRouter>
      <Routes>
       
          <Route path="/" element={
             <ProtectedRoute>
            <Home/>
            </ProtectedRoute>
          }/>

          <Route path="/profile" element={
            <ProtectedRoute>
            <Profile/>
            </ProtectedRoute>
            }/>  

          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/register" element={<RegisterAndLogout/>}/>
          <Route path="*" element={<Notfound/>}/>

      </Routes>
    </BrowserRouter>
  </>
   
}

export default App
