import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { clearToken, getAccessToken } from '../utils/auth.js';

function Navbar() {
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const isLoggedIn = !!getAccessToken()
    const handleLogout = () => {
        clearToken();
        navigate("/login");
    }

    return (
        <nav className='bg-white shadow-md px-6 py-6 flex justify-between items-center fixed w-full top-0 z-50'>
            <Link to='/' className='text-2xl font-bold text-gray-800'>
                🛍️ ShopNest
            </Link>

            <div className='flex items-center gap-6'>
                {/* Login/SignUp or Logout - right side */}
                {!isLoggedIn ? (
                    <>
                        <Link to='/login' className='text-gray-800 hover:text-gray-600 font-medium transition'>
                            Login
                        </Link>
                        <Link to='/signup' className='text-gray-800 hover:text-gray-600 font-medium transition'>
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <button onClick={handleLogout} className='text-gray-800 hover:text-gray-600 font-medium transition'>
                        Logout
                    </button>
                )}

                <Link to='/cart' className='relative text-gray-800 hover:text-gray-600 font-medium transition'>
                    🛒 Cart
                    {cartCount > 0 && (
                        <span className='absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1'>
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    )
}

export default Navbar;