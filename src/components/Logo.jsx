import { useState } from "react";
import logoImage from "../assets/logo1.png.png";

function Logo({ className = "", surface = "dark" }) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div
      className={`flex items-center rounded-lg ${surface === "light" ? "bg-orange-500" : "bg-black"} ${className}`}
      style={{ padding: "12px" }}
    >
      {imageAvailable ? (
        <img
          src={logoImage}
          alt="Gas Shop"
          onError={() => setImageAvailable(false)}
          className="h-14 w-[180px] object-cover object-center sm:h-16 sm:w-[220px]"
        />
      ) : (
        <span className="text-2xl font-bold text-orange-500">Gas Shop</span>
      )}
    </div>
  );
}

export default Logo;