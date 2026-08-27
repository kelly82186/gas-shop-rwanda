
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import api from "../api";
import { assetNames } from "../assets/assetImages";

const emptyProduct = { name: "", price: "", description: "", image: "", inStock: true };

function Admin() {
  const { user, customers, logout, deleteCustomer } = useContext(AuthContext);
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newOrderNotice, setNewOrderNotice] = useState(null);
  const [newMessageNotice, setNewMessageNotice] = useState(null);
  const [ordersError, setOrdersError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const latestOrderId = useRef(null);
  const latestMessageId = useRef(null);
  const navigate = useNavigate();
  const activeCustomers = customers.filter((customer) => customer.active);

  useEffect(() => {
    let ordersInitialLoad = true;
    let messagesInitialLoad = true;

    const loadOrders = async () => {
      try {
        const response = await api.get("/orders");
        const latestOrders = response.data;
        setOrders(latestOrders);
        setOrdersError("");

        if (!ordersInitialLoad && latestOrders[0]?.id !== latestOrderId.current) {
          const latestOrder = latestOrders[0];
          setNewOrderNotice(latestOrder);
        }
        latestOrderId.current = latestOrders[0]?.id ?? null;
        ordersInitialLoad = false;
      } catch {
        if (ordersInitialLoad) {
          setOrders([]);
          setOrdersError("Orders could not be loaded. Please restart the backend server.");
        }
      }
    };

    const loadMessages = async () => {
      try {
        const response = await api.get("/messages");
        const latestMessages = response.data;
        setMessages(latestMessages);
        setMessagesError("");
        if (!messagesInitialLoad && latestMessages[0]?.id !== latestMessageId.current) {
          setNewMessageNotice(latestMessages[0]);
        }
        latestMessageId.current = latestMessages[0]?.id ?? null;
        messagesInitialLoad = false;
      } catch {
        if (messagesInitialLoad) {
          setMessages([]);
          setMessagesError("Messages could not be loaded. Please restart the backend server.");
        }
      }
    };

    loadOrders();
    loadMessages();
    const intervalId = window.setInterval(loadOrders, 10000);
    const messagesIntervalId = window.setInterval(loadMessages, 10000);
    return () => {
      window.clearInterval(intervalId);
      window.clearInterval(messagesIntervalId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const product = { ...form, price: Number(form.price) };

    try {
      if (editingId) {
        await updateProduct({ ...product, id: editingId });
        setNotice("Product updated successfully.");
      } else {
        await addProduct(product);
        setNotice("Product added successfully.");
      }
    } catch {
      setNotice("Could not save the product.");
    }

    setForm(emptyProduct);
    setEditingId(null);
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price, description: product.description, image: product.image, inStock: product.inStock });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProduct = async (id) => {
    if (window.confirm("Delete this product from the storefront?")) {
      try {
        await deleteProduct(id);
        setNotice("Product deleted.");
      } catch {
        setNotice("Could not delete the product.");
      }
    }
  };

  const markOrderReceived = async (id) => {
    if (!window.confirm("Mark this order as received and remove it?")) return;
    try {
      await api.post(`/orders/${id}/receive`);
      setOrders((currentOrders) => currentOrders.filter((order) => order.id !== id));
      setNotice("Order received and removed.");
    } catch {
      setNotice("Could not receive the order.");
    }
  };

  const removeMessage = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages((currentMessages) => currentMessages.filter((contactMessage) => contactMessage.id !== id));
      setNotice("Message deleted.");
    } catch {
      setNotice("Could not delete the message.");
    }
  };

  const removeCustomer = async (customer) => {
    if (!window.confirm(`Delete customer ${customer.username} and all related orders?`)) return;
    try {
      await deleteCustomer(customer.id);
      setOrders((currentOrders) => currentOrders.filter((order) => order.userId !== customer.id));
      setNotice("Customer deleted.");
    } catch {
      setNotice("Could not delete the customer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 px-4 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Gas Shop Control</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Admin workspace</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-300 sm:inline">{user?.email}</span>
            <button onClick={() => navigate("/")} className="rounded border border-slate-600 px-3 py-2 text-sm font-bold hover:border-orange-400 hover:text-orange-400">Storefront</button>
            <button onClick={handleLogout} className="rounded bg-red-500 px-3 py-2 text-sm font-bold hover:bg-red-600">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
        {newOrderNotice && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-orange-300 bg-orange-50 p-4 shadow-sm" role="alert">
            <div>
              <p className="font-bold text-orange-800">New customer order received</p>
              <p className="mt-1 text-sm text-orange-700">{newOrderNotice.username} ordered an item. Phone: {newOrderNotice.phoneNumber}</p>
            </div>
            <button onClick={() => setNewOrderNotice(null)} className="text-sm font-bold text-orange-700 hover:text-orange-900">Dismiss</button>
          </div>
        )}
        {newMessageNotice && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-blue-300 bg-blue-50 p-4 shadow-sm" role="alert">
            <div>
              <p className="font-bold text-blue-800">New contact message received</p>
              <p className="mt-1 text-sm text-blue-700">From {newMessageNotice.name} ({newMessageNotice.email})</p>
            </div>
            <button onClick={() => setNewMessageNotice(null)} className="text-sm font-bold text-blue-700 hover:text-blue-900">Dismiss</button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Catalog products" value={products.length} tone="orange" />
          <StatCard label="Registered customers" value={customers.length} tone="blue" />
          <StatCard label="Active customers" value={activeCustomers.length} tone="green" />
          <StatCard label="Items in stock" value={products.filter((product) => product.inStock).length} tone="purple" />
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-xl font-bold">Orders awaiting receipt</h2><p className="mt-1 text-sm text-slate-500">Orders remain here until the admin marks them as received.</p></div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">{orders.length} orders</span>
          </div>
          {ordersError && <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{ordersError}</p>}
          {orders.length === 0 ? <p className="rounded bg-slate-50 p-6 text-center text-slate-500">No customer orders yet.</p> : <div className="space-y-6">
            {orders.filter((order) => order.status !== "received").map((order) => (
              <div key={order.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-bold">Order #{order.id}</h3><p className="text-sm text-slate-600">{order.username} · {order.email}</p><p className="text-sm font-bold text-orange-600">Phone: {order.phoneNumber}</p></div>
                  <div className="text-right"><p className="font-bold">{order.totalPrice.toLocaleString()} RWF</p><span className="text-sm font-bold capitalize text-orange-600">{order.status}</span><button onClick={() => markOrderReceived(order.id)} className="mt-2 block text-sm font-bold text-green-600 hover:text-green-800">Received and remove</button></div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
              </div>
            ))}
          </div>}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-xl font-bold">Contact inbox</h2><p className="mt-1 text-sm text-slate-500">Messages sent by visitors through Contact Us.</p></div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">{messages.length} messages</span>
          </div>
          {messagesError && <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{messagesError}</p>}
          {messages.length === 0 ? <p className="rounded bg-slate-50 p-6 text-center text-slate-500">No messages yet.</p> : <div className="space-y-3">
            {messages.map((contactMessage) => (
              <article key={contactMessage.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-bold">{contactMessage.subject}</h3><p className="text-sm text-slate-600">{contactMessage.name} · {contactMessage.email}</p>{contactMessage.phone && <p className="text-sm font-bold text-blue-600">Phone: {contactMessage.phone}</p>}</div>
                  <div className="text-right"><time className="block text-sm text-slate-500">{new Date(contactMessage.createdAt).toLocaleString()}</time><button onClick={() => removeMessage(contactMessage.id)} className="mt-2 text-sm font-bold text-red-600 hover:text-red-800">Delete message</button></div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{contactMessage.message}</p>
              </article>
            ))}
          </div>}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl font-bold">Product catalog</h2><p className="mt-1 text-sm text-slate-500">Changes here appear on the customer storefront immediately.</p></div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">{products.length} products</span>
            </div>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                  <img src={product.image} alt={product.name} className="h-20 w-20 rounded object-cover" />
                  <div className="min-w-0 flex-1"><h3 className="truncate font-bold">{product.name}</h3><p className="text-sm text-slate-500">{product.price.toLocaleString()} RWF</p><span className={`text-xs font-bold ${product.inStock ? "text-green-600" : "text-red-600"}`}>{product.inStock ? "In stock" : "Out of stock"}</span></div>
                  <div className="flex gap-2"><button onClick={() => startEditing(product)} className="rounded border border-slate-300 px-3 py-2 text-sm font-bold hover:border-orange-500 hover:text-orange-600">Edit</button><button onClick={() => removeProduct(product.id)} className="rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Delete</button></div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold">{editingId ? "Edit product" : "Add product"}</h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">Create a product customers can buy.</p>
            <div className="space-y-4">
              <Field label="Product name" name="name" value={form.name} onChange={handleChange} required />
              <Field label="Price (RWF)" name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
              <label className="block text-sm font-bold">Product image
                <select name="image" value={form.image} onChange={handleChange} required className="mt-1 w-full rounded border border-slate-300 bg-white p-3 font-normal outline-none focus:border-orange-500">
                  <option value="">Choose an image from assets</option>
                  {form.image && !assetNames.includes(form.image) && <option value={form.image}>{form.image}</option>}
                  {assetNames.map((assetName) => <option key={assetName} value={assetName}>{assetName}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold">Description<textarea name="description" value={form.description} onChange={handleChange} required rows="3" className="mt-1 w-full rounded border border-slate-300 p-3 font-normal outline-none focus:border-orange-500" /></label>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="h-4 w-4 accent-orange-500" /> Available in stock</label>
              {notice && <p className="rounded bg-green-50 p-3 text-sm font-bold text-green-700">{notice}</p>}
              <div className="flex gap-2"><button type="submit" className="flex-1 rounded bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600">{editingId ? "Save changes" : "Add product"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyProduct); }} className="rounded border border-slate-300 px-4 py-3 font-bold">Cancel</button>}</div>
            </div>
          </form>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Customer activity</h2><p className="mt-1 text-sm text-slate-500">Registered accounts and their current session status.</p></div><span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">{activeCustomers.length} active now</span></div>
          {customers.length === 0 ? <p className="rounded bg-slate-50 p-6 text-center text-slate-500">No customers have registered yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.email} className="border-b border-slate-100"><td className="px-3 py-4 font-bold">{customer.username}</td><td className="px-3 py-4 text-slate-600">{customer.email}</td><td className="px-3 py-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${customer.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{customer.active ? "Active" : "Offline"}</span></td><td className="px-3 py-4"><button onClick={() => removeCustomer(customer)} className="font-bold text-red-600 hover:text-red-800">Delete customer</button></td></tr>)}</tbody></table></div>}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const colors = { orange: "text-orange-600", blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600" };
  return <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className={`mt-2 text-3xl font-bold ${colors[tone]}`}>{value}</p></div>;
}

function Field({ label, name, value, onChange, ...props }) {
  return <label className="block text-sm font-bold">{label}<input name={name} value={value} onChange={onChange} {...props} className="mt-1 w-full rounded border border-slate-300 p-3 font-normal outline-none focus:border-orange-500" /></label>;
}

export default Admin;


