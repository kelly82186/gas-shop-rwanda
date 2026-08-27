import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/heroImage.png.png";


function Home() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { products } = useProducts();
  const navigate = useNavigate();
  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    if (products.length < 2) return undefined;

    const interval = setInterval(() => {
      setActiveProduct((current) => (current + 1) % products.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [products.length]);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") return;
    await addToCart(product);
  };

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div 
        className="relative min-h-[60vh] overflow-hidden px-6 py-12 text-white sm:px-10"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Welcome to Gas Shop 🔥</h1>
            <p className="mb-4 max-w-lg text-lg">The best gas cylinders and cooking equipment in Rwanda</p>
            <button 
              onClick={() => navigate("/products")}
              className="rounded-lg bg-white px-6 py-2 font-bold text-orange-600 transition hover:bg-gray-100"
            >
              Shop Now →
            </button>
          </div>

          {products.length > 0 && (
            <div className="relative overflow-hidden rounded-xl border border-white/30 bg-black/35 shadow-xl backdrop-blur-sm">
              <div className="grid min-h-[360px] grid-cols-1 sm:grid-cols-2">
                <div className="h-56 bg-white/10 sm:h-full">
                <img
                  src={products[activeProduct].image}
                  alt={products[activeProduct].name}
                  className="h-full w-full object-contain p-5 transition duration-500"
                />
                </div>

                <div className="flex flex-col justify-center p-5">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-300">
                    Product {activeProduct + 1} of {products.length}
                  </p>
                  <h2 className="mb-3 text-2xl font-bold">
                    {products[activeProduct].name}
                  </h2>

                  <p className="mb-5 text-white/80">
                    {products[activeProduct].description}
                  </p>

                  <div className="mb-5 flex items-center gap-2">
                    <span className="text-sm text-yellow-300">⭐ {products[activeProduct].rating}</span>
                    <span className="text-sm text-white/70">({products[activeProduct].reviews})</span>
                  </div>

                  <p className="mb-6 text-2xl font-bold text-orange-300">
                    {products[activeProduct].price.toLocaleString()} RWF
                  </p>

                  <button
                    onClick={() => handleAddToCart(products[activeProduct])}
                    disabled={user?.role === "admin"}
                    className={`w-full rounded-lg py-2 font-bold transition ${user?.role === "admin" ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                  >
                    {user?.role === "admin" ? "Admin view only" : "Add to Cart"}
                  </button>
                </div>
              </div>

              {products.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous product"
                    onClick={() => setActiveProduct((current) => (current - 1 + products.length) % products.length)}
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-gray-800 shadow-md transition hover:bg-orange-500 hover:text-white"
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    aria-label="Next product"
                    onClick={() => setActiveProduct((current) => (current + 1) % products.length)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-gray-800 shadow-md transition hover:bg-orange-500 hover:text-white"
                  >
                    &#8594;
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                    {products.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        aria-label={`Show ${product.name}`}
                        aria-current={index === activeProduct}
                        onClick={() => setActiveProduct(index)}
                        className={`h-2 rounded-full transition-all ${index === activeProduct ? "w-6 bg-orange-500" : "w-2 bg-white/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Home;