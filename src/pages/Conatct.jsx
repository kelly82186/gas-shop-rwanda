import { useContext, useState } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Contact() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ phone: "", subject: "", message: "" });
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    setNoticeError(false);
    setIsSending(true);
    try {
      await api.post("/messages", { ...formData, name: user.name, email: user.email });
      setNotice("Message sent successfully.");
      setFormData({ phone: "", subject: "", message: "" });
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not save your message. Please try again.");
      setNoticeError(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <div className="h-1 w-32 bg-orange-500 rounded mb-4"></div>
          <p className="text-gray-600 text-lg">We'd love to hear from you. Get in touch with us today!</p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Phone */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 mb-4">Call us during business hours</p>
            <p className="text-xl font-bold text-orange-600">+250 783 875 956</p>
          </div>

          {/* Location */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">🚏</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600 mb-4">Visit us in person</p>
            <p className="text-lg font-bold text-orange-600">Kigali, Rwanda</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          
          <p className="mb-6 text-sm text-gray-600">You are signed in as {user.name}. Your message will be sent to the admin inbox.</p>
          {notice && <p className={`mb-6 rounded border p-4 text-center font-bold ${noticeError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{notice}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logged-in name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+250 ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this about?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us more..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Business Hours */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700"><span className="font-bold">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
              <p className="text-gray-700"><span className="font-bold">Saturday:</span> 9:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="text-gray-700"><span className="font-bold">Sunday:</span> 10:00 AM - 2:00 PM</p>
              <p className="text-gray-700"><span className="font-bold">Holidays:</span> By appointment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;