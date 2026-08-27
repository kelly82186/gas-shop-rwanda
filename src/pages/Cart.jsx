import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    totalPrice,
  } = useContext(CartContext);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCheckout = async () => {
    setNotice("");
    setNoticeError(false);

    if (user?.role === "admin") {
      setNotice("Admin accounts can review the website but cannot place orders.");
      setNoticeError(true);
      return;
    }

    if (!phoneNumber.trim()) {
      setNotice("Please enter your phone number before buying.");
      setNoticeError(true);
      return;
    }

    if (!window.confirm("Is your delivery location in Kigali? Click OK for Yes or Cancel for No.")) {
      setNotice("You are too far from Kigali. Your order cannot be received right now.");
      setNoticeError(true);
      return;
    }

    try {
      await api.post("/orders", { userId: user.id, phoneNumber: phoneNumber.trim(), totalPrice, items: cart });
      setNotice("Order placed successfully. We will call you in a few minutes.");
      setPhoneNumber("");
      clearCart();
    } catch {
      setNotice("Could not place the order.");
      setNoticeError(true);
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart 🛒</h1>
        <div className="h-1 w-32 bg-orange-500 rounded mb-8"></div>
        {notice && <p className={`mb-6 rounded border p-4 text-center font-bold ${noticeError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{notice}</p>}

        {user?.role === "admin" && <p className="mb-6 rounded border border-blue-200 bg-blue-50 p-4 text-center font-bold text-blue-700">Admin view only. You cannot add items or place orders.</p>}

        {cart.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button 
              onClick={() => navigate("/products")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-2xl font-bold text-orange-600 mb-4">
                          {item.price.toLocaleString()} RWF
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button 
                              onClick={() => decreaseQty(item.id)}
                              className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="px-4 font-bold text-gray-900">{item.qty}</span>
                            <button 
                              onClick={() => increaseQty(item.id)}
                              className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(item.price * item.qty).toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 border-b pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">{totalPrice.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-bold text-gray-900">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {totalPrice.toLocaleString()} RWF
                  </span>
                </div>

                <label className="mb-3 block text-sm font-bold text-gray-900">
                  Phone number
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1 w-full rounded-lg border-2 border-gray-300 px-3 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                {user?.role !== "admin" && <button onClick={handleCheckout} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition mb-2">
                  Buy Now
                </button>}

                <button 
                  onClick={() => navigate("/products")}
                  className="w-full border-2 border-gray-300 text-gray-900 hover:bg-gray-100 font-bold py-2 rounded-lg transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;