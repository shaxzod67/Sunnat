import './App.css'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { SignIn } from './Pages/SignIn'
import Dashboard from './Pages/Dashboard'
import { useContext, useState } from 'react'
import { ProtectRouteAdmin } from './Protect/ProtectRoutesAdmin'
import { AuthContext } from './context/AuthContext'
import Home from './Pages/home'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { CartProvider } from 'react-use-cart'
import Cart from './context/Cart'
import Zakazlar from './Pages/Zakazlar'
import Heart from './Pages/heart'
import { FaRegHeart } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { AiOutlineShoppingCart } from "react-icons/ai";
import HeaderMain from './companents/HeaderMain'
import Banner from './companents/Banner'
import Product from './companents/Product'
import { IoMdMenu } from "react-icons/io";
import { MdLogout } from "react-icons/md";

function App() {


  let user = JSON.parse(localStorage.getItem('user'))


  const LogOut = () => {
    localStorage.removeItem('user');
    <Navigate to={'/'}/>
  }
  // const [cartItemCount, setCartItemCount] = useState(0);

  // useEffect(() => {
  //     const storedCartItemCount = localStorage.getItem('cartItemCount');
  //     if (storedCartItemCount) {
  //         setCartItemCount(parseInt(storedCartItemCount));
  //     }
  // }, []);

  const { currentUser } = useContext(AuthContext)

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to='/signin' />
  }

  return (
    <BrowserRouter>
      <header>
        <nav> 
          
             <input type="checkbox" id='check' />
        <label htmlFor="check" className='checkboxbtn'>
        <IoMdMenu />
        </label>
          
         
        <div className="navigation">

          <div className="logo">
            <h1>Sunnat</h1>
          </div>

        
           
          <ul className='menu2'>
            <div className="nav1">
               <li className='home'><NavLink to="/">Home</NavLink></li>
            <li className='home'><NavLink to="/products">Products</NavLink></li>
             {user && <li><NavLink to="/dashboard">Mahsulot Qo'shish</NavLink></li>}
            {user && <li><NavLink to="/zakazlar">Zakazlar</NavLink></li>} 
            
            </div>
           
            <div className="nav2">
               <li><NavLink to="/heart"><FaRegHeart className="user" /></NavLink></li>
            <li><NavLink to="/cart"><AiOutlineShoppingCart className="user" /></NavLink></li>
            <li className='pt-2'><NavLink to="/signin"><FaRegUser className="user" /></NavLink></li>
            {user && <li onClick={LogOut}><MdLogout /></li>}
            </div>
            
           
          </ul>
        </div>
          
        
        </nav>
        
      </header>

        

      <CartProvider>
        <Routes>
          <Route element={<HeaderMain/>} path='/'/>
          <Route element={<Product/>} path='/products'/>
          
          
          <Route element={<SignIn />} path='/signin' />
          <Route element={<Cart />} path='/cart' />
          <Route element={<Heart />} path='/heart' />
          <Route element={<ProtectRouteAdmin><RequireAuth><Zakazlar /></RequireAuth></ProtectRouteAdmin>} path='/zakazlar' />

          <Route element={<ProtectRouteAdmin><RequireAuth><Dashboard /></RequireAuth></ProtectRouteAdmin>} path='/dashboard' />
        </Routes>
      </CartProvider>

    </BrowserRouter>
  )
}

export default App
