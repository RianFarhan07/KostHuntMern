/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Oauth from "../components/Oauth";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../redux/user/userSlice.js";

const Signin = () => {
  const { loading, error } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Add this line to back to where you klik the login
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    console.log(JSON.stringify(data));
    dispatch(signInStart());
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        },
      );

      const responseData = await res.json();
      console.log(responseData);

      if (!res.ok) {
        dispatch(signInFailure(responseData.message));
        return;
      }
      dispatch(signInSuccess(responseData));
      console.log("Redirecting to:", from);
      navigate(from);
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.log(error.message);
    }
  };

  const togglePasswordVisibility = (type) => {
    if (type == "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center bg-gray-100 p-4">
      <div className="mx-auto mb-4 w-full max-w-sm rounded-lg bg-white px-8 pb-8 pt-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Sign in to Your Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              autoComplete="email"
              className={`w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                className={`w-full appearance-none rounded border px-3 py-2 pr-10 leading-tight shadow focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 focus:outline-none"
                type="button"
                onClick={() => togglePasswordVisibility("password")}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs italic text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4">
              <p className="rounded bg-red-50 p-2 text-center text-sm text-red-500">
                {error}
              </p>
            </div>
          )}
          <div className="mb-4">
            <button
              type="submit"
              className="focus:shadow-outline w-full rounded bg-primary px-8 py-2 font-bold text-white hover:bg-primaryVariant focus:outline-none"
            >
              Login
            </button>
          </div>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Oauth />
        <p className="mt-6 text-center text-xs text-gray-500">
          Don't have an account yet?{" "}
          <Link to={"/sign-up"} className="text-blue-500 hover:text-blue-800">
            Sign up here
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} KostHunt by Rian. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Signin;
