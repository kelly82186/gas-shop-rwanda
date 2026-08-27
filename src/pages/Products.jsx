import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { AuthContext } from "../context/AuthContext";

function Products() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { products } = useProducts();
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") return;
    await addToCart(product);
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <div className="h-1 w-40 bg-orange-500 rounded mb-4"></div>
          <p className="text-gray-600">Showing {products.length} products</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4">
          <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-bold hover:bg-orange-200">
            All
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">
            In Stock
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">
            Price: Low to High
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-500 text-xs">⭐ {product.rating}</span>
                  <span className="text-gray-500 text-xs">({product.reviews})</span>
                </div>

                {/* Price */}
                <p className="text-lg font-bold text-orange-600 mb-3">
                  {product.price.toLocaleString()} RWF
                </p>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock || user?.role === "admin"}
                  className={`w-full font-bold py-2 rounded-lg transition ${
                    product.inStock && user?.role !== "admin"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {user?.role === "admin" ? "Admin view only" : product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;