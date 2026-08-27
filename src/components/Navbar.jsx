import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="flex flex-wrap items-center gap-3 bg-black px-3 py-2 text-white shadow-lg sticky top-0 z-50 sm:flex-nowrap sm:justify-between sm:px-6 sm:py-3"
      style={{ paddingRight: "24px" }}
    >
      {/* Logo */}
      <div onClick={() => navigate("/")} className="cursor-pointer shrink-0" aria-label="Go to Gas Shop home">
        <Logo />
      </div>

      {/* Navigation Links */}
      <div className="order-3 flex w-full items-center justify-center gap-3 border-t border-gray-800 pt-2 text-xs sm:order-none sm:w-auto sm:gap-8 sm:border-0 sm:pt-0 sm:text-base">
        <button 
          onClick={() => navigate("/")} 
          className="text-orange-500 hover:text-orange-300 transition font-medium"
        >
          Home
        </button>
        <button 
          onClick={() => navigate("/products")} 
          className="text-orange-500 hover:text-orange-300 transition font-medium"
        >
          Our Products
        </button>
        <button 
          onClick={() => navigate("/contact")} 
          className="text-orange-500 hover:text-orange-300 transition font-medium"
        >
          Contact Us
        </button>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {user && (
          <div
            className="relative cursor-pointer hover:text-orange-400 transition"
            onClick={() => navigate("/cart")}
            title="Shopping cart"
          >
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-2 py-1 rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </div>
        )}

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-300 md:inline">{user.username || user.email}</span>
            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-bold transition"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded bg-orange-500 font-bold transition hover:bg-orange-600"
            style={{ padding: "8px 16px" }}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;