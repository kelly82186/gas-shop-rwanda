import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Logo from "../components/Logo";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        navigate(loggedInUser.role === "admin" ? "/admin" : "/");
      }, 1000);
    } else {
      setMessage("Invalid credentials! ❌");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5 sm:p-8">
      <div className="flex min-h-[460px] w-full max-w-3xl flex-col justify-start rounded-2xl border border-gray-200 bg-white p-8 shadow-xl sm:min-h-[500px] sm:p-12 lg:min-h-[540px] lg:p-16">
          {/* Logo */}
          <div className="mb-10 flex justify-start sm:mb-12">
            <Logo surface="light" className="w-fit" />
          </div>

          <div className="flex flex-1 flex-col justify-center">
          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-8">
            
            {/* Username or email input */}
            <div>
              <label className="mb-3 block text-base font-bold leading-6 text-gray-900">
                Username or email
              </label>
              <input
                required
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-gray-900 font-medium transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-3 block text-base font-bold leading-6 text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 pr-20 text-gray-900 font-medium transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-orange-600 hover:text-orange-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2" style={{ marginTop: "20px" }}>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-lg"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center font-bold text-base transition-all ${
              message.includes("successful") 
                ? "bg-green-100 text-green-800 border border-green-300" 
                : "bg-red-100 text-red-800 border border-red-300"
            }`}>
              {message}
            </div>
          )}

          {/* Links */}
          <div className="mt-8 space-y-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="block w-full text-orange-600 hover:text-orange-700 font-bold text-base"
            >
              Continue as Guest
            </button>
            <p className="text-gray-600 text-sm">
              Need an account? <button type="button" onClick={() => navigate("/register")} className="text-orange-600 hover:text-orange-700 font-bold">Register</button>
            </p>
          </div>

          {/* Footer Text */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-xs text-gray-600 space-y-2">
            <p>By signing up, you agree to our <a href="#" className="text-orange-600 hover:text-orange-700">Terms of Service</a> and <a href="#" className="text-orange-600 hover:text-orange-700">Privacy Policy</a></p>
          </div>
          </div>
      </div>
    </div>
  );
}

export default Login;

