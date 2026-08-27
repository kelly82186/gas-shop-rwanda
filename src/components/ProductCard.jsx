import { useContext } from "react";
import { CartContext} from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role === "admin") return;

        await addToCart(product);
    };

    return(
        <div className="bg-gray-800 rounded-xl shadow-lg w-[260px] overflow-hidden hover:scale-105 transition duration-300">
            <img
            src={product.image}
            alt={product.name}
            className="w-full h-[200px] object-cover"
            />
            <div className="p-4">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-400 text-sm">
                    {product.description}
                </p>
                <p className="text-orange-400 font-bold mt-2">
                    {product.price} RWF
                </p>
                <button
                onClick={handleAddToCart}
                disabled={user?.role === "admin"}
                className="mt-3 w-full rounded bg-orange-500 py-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                    {user?.role === "admin" ? "Admin view only" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
}
export default ProductCard;