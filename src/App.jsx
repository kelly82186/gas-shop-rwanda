import { useContext } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Contact from "./pages/Conatct";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthContext } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/login" replace />;
}

function ContactAccess() {
  const { user } = useContext(AuthContext);

  if (user) return <Contact />;

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg rounded-lg border border-orange-200 bg-orange-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Please log in first</h1>
        <p className="mt-3 text-gray-700">In order to write us a message on the Contact page, please log in first to become our new customer.</p>
        <button onClick={() => window.location.assign("/login")} className="mt-6 rounded bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          Log in
        </button>
      </div>
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin } = useContext(AuthContext);

  return isAdmin ? children : <Navigate to="/login" replace />;
}

function App(){
   return(
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
           <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/"  element={<MainLayout />} >
              <Route index     element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="contact"  element={<ContactAccess />} />
              <Route path="cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            </Route>
           </Routes>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
   );
}

export default App;