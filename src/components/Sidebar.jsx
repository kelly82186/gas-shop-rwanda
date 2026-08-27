import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Sidebar(){
    const { user } = useContext(AuthContext);

    return(
        <div
            className="hidden lg:block w-64 shrink-0 bg-gray-800 h-screen overflow-y-auto"
            style={{ padding: "20px 28px" }}
        >
            <h2 className="text-white text-lg font-bold mb-6">Navigation</h2>
            <nav className="space-y-3" style={{ paddingRight: "12px" }}>
                <Link to="/" className="block text-gray-300 hover:text-orange-400 font-medium">🏠 Home</Link>
                <Link to="/products" className="block text-gray-300 hover:text-orange-400 font-medium">📦 Products</Link>
                {user && <Link to="/cart" className="block text-gray-300 hover:text-orange-400 font-medium">🛒 Cart</Link>}
                <Link to="/contact" className="block text-gray-300 hover:text-orange-400 font-medium">📞 Contact</Link>
                {!user && <Link to="/login" className="block text-gray-300 hover:text-orange-400 font-medium">🔐 Login</Link>}
            </nav>
        </div>
    );
}

export default Sidebar;