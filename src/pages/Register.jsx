import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Logo from "../components/Logo";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleFieldChange = (field, value) => {
    const setters = { username: setUsername, email: setEmail, password: setPassword, confirmPassword: setConfirmPassword };
    setters[field](value);
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setMessage("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const errors = {};
    const namePattern = /^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u;
    const gmailPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{4,28})@gmail\.com$/i;

    if (!namePattern.test(username.trim()) || username.includes("@")) {
      errors.username = "Enter a real name, not an email address or username.";
    }
    if (!gmailPattern.test(email.trim())) {
      errors.email = "Please enter a valid Gmail address.";
    }
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setMessage("Please correct the highlighted fields.");
      return;
    }

    const result = await register(username, email, password);
    if (!result.success) {
      setFieldErrors(result.field ? { [result.field]: result.error } : {});
      setMessage(result.error);
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-10">
        <Logo surface="light" className="mb-6 w-fit" />
        <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-600 mt-2 mb-8">Register to start shopping at Gas Shop.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div>
            <input required value={username} onChange={(event) => handleFieldChange("username", event.target.value)} placeholder="Full name" aria-label="Full name" aria-invalid={Boolean(fieldErrors.username)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
            {fieldErrors.username && <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>}
          </div>
          <div>
            <input required type="email" value={email} onChange={(event) => handleFieldChange("email", event.target.value)} placeholder="name@gmail.com" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => handleFieldChange("password", event.target.value)} placeholder="Password (8+ characters)" aria-invalid={Boolean(fieldErrors.password)} className="w-full px-4 py-3 pr-20 border-2 border-gray-300 rounded-lg" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-orange-600 hover:text-orange-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
          <div>
            <div className="relative">
              <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => handleFieldChange("confirmPassword", event.target.value)} placeholder="Confirm password" aria-invalid={Boolean(fieldErrors.confirmPassword)} className="w-full px-4 py-3 pr-20 border-2 border-gray-300 rounded-lg" />
              <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-orange-600 hover:text-orange-700" aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}>
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>

          {message && <p className="text-red-600 font-medium">{message}</p>}

          <button type="submit" className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg">
            Register
          </button>
        </form>

        <button onClick={() => navigate("/login")} className="w-full mt-5 text-orange-600 font-bold">
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

export default Register;