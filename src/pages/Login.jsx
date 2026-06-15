import React, { useState } from "react";
import login_bg from "../assets/images/Login_bg.png";
import logo_img from "../assets/images/logo.svg";
import google_icon from "../assets/images/google_icon_img.png";
import { useNavigate } from "react-router-dom";

import { FaFacebookF, FaApple } from "react-icons/fa";
import { Mail, EyeOff, Eye } from "lucide-react";

function Login() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      newErrors.email = "Invalid email address";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Login Data:", formData);

      alert("Login Successful!");

      // Reset Form
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      setErrors({});
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* LEFT SIDE IMAGE */}
      <div className="w-[43%] hidden lg:block">
        <img
          src={login_bg}
          alt="login background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[57%] flex justify-center items-center bg-white px-3">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col py-3"
        >
          {/* Logo */}
          <div className="text-center mb-3">
            <img
              src={logo_img}
              alt="logo"
              className="w-24 mx-auto"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-3">
            <h1 className="text-[22px] font-bold text-[#1b2559]">
              Sign In
            </h1>

            <p className="text-gray-500 mt-1 text-xs">
              Please enter your details to sign in
            </p>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email Address
            </label>

            <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-orange-500">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-3 py-2 outline-none text-sm rounded-lg"
              />

              <div className="px-3 text-gray-400">
                <Mail size={16} />
              </div>
            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>

            <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-orange-500">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-3 py-2 outline-none text-sm rounded-lg"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="px-3 text-gray-400"
              >
                {showPassword ? (
                  <Eye size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center mb-3 text-xs">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember Me
            </label>

            <button
              type="button"
              className="text-red-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition flex items-center justify-center" onClick={()=>navigate("profile")}>
            Sign In
          </button>

          {/* Create Account */}
          <p className="text-center text-xs text-gray-600 mt-3">
            Don’t have an account?
            <span
              onClick={() => navigate("/signup")}
              className="text-orange-500 ml-1 cursor-pointer hover:underline"
            >
              Create Account
            </span>
          </p>

          {/* Divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-gray-300"></div>

            <span className="mx-3 text-gray-400 text-xs">
              Or
            </span>

            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-2">
            <button className="w-15 h-9 bg-[#1877F2] rounded-lg flex items-center justify-center hover:opacity-90 transition">
              <FaFacebookF className="text-white text-sm" />
            </button>

            <button className="w-15 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
              <img
                src={google_icon}
                alt="Google"
                className="w-4 h-4"
              />
            </button>

            <button className="w-15 h-9 bg-black rounded-lg flex items-center justify-center hover:opacity-90 transition">
              <FaApple className="text-white text-sm" />
            </button>
          </div>

          {/* COPYRIGHT */}
          <div className="text-center pt-3">
            <p className="text-xs text-gray-500">
              Copyright © 2026 - SmartHR
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;