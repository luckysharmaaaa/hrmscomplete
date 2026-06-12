  import React, { useState } from "react";
  import login_bg from "../assets/images/Login_bg.png";
  import logo_img from "../assets/images/logo.svg";
  import google_icon from "../assets/images/google_icon_img.png";
  import { useNavigate } from "react-router-dom";

  import { FaFacebookF, FaApple } from "react-icons/fa";
  import { Mail, EyeOff, Eye, User } from "lucide-react";

  function SignUp() {
      const navigate = useNavigate();
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
      useState(false);

    // Handle input change
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

      // Name
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      // Email
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
          formData.email
        )
      ) {
        newErrors.email = "Invalid email address";
      }

      // Password
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password =
          "Password must be at least 6 characters";
      }

      // Confirm Password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Confirm password is required";
      } else if (
        formData.password !== formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match";
      }

      // Terms
      if (!formData.terms) {
        newErrors.terms =
          "Please accept Terms & Privacy";
      }

      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = (e) => {
      e.preventDefault();

      if (validateForm()) {
        console.log("Signup Data:", formData);

        alert("Signup Successful!");

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          terms: false,
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
                Sign Up
              </h1>

              <p className="text-gray-500 mt-1 text-xs">
                Please enter your details to sign up
              </p>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Name
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-orange-500">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 outline-none text-sm rounded-lg"
                />

                <div className="px-3 text-gray-400">
                  <User size={16} />
                </div>
              </div>

              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name}
                </p>
              )}
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

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Confirm Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-orange-500">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 outline-none text-sm rounded-lg"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="px-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />

                <span>
                  Agree to{" "}
                  <span className="text-orange-500 cursor-pointer hover:underline">
                    Terms & Privacy
                  </span>
                </span>
              </label>

              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <button className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition flex items-center justify-center">
              Sign Up
            </button>

            {/* Login Link */}
            <p className="text-center text-xs text-gray-600 mt-3">
              Already have an account?
              <span
                onClick={() => navigate("/login")}

              className="text-orange-500 ml-1 cursor-pointer hover:underline">
                Sign In
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

            {/* Social Buttons */}
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

            {/* Copyright */}
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

  export default SignUp;