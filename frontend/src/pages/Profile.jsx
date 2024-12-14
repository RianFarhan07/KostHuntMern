import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { FaCamera, FaTrashAlt, FaSignOutAlt, FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: "",
  });

  const handleFileUpload = () => {
    fileRef.current.click();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement update logic
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-poppins">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-semibold text-onsurface">
          Profile
        </h1>

        <div className="relative mb-6 flex justify-center">
          <img
            src={currentUser.avatar}
            alt="profile"
            className="h-32 w-32 rounded-full border-4 border-primary object-cover"
          />
          <button
            onClick={handleFileUpload}
            className="absolute bottom-0 right-1/2 translate-x-1/2 rounded-full bg-secondary p-2 text-onPrimary shadow-lg transition hover:bg-primaryVariant"
          >
            <FaCamera size={20} />
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <FaEdit
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <MdOutlineEmail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <RiLockPasswordLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary p-3 font-semibold uppercase text-onPrimary transition hover:bg-primaryVariant"
          >
            Update Profile
          </button>
        </form>

        <div className="mt-6 flex justify-between">
          <button className="flex items-center text-red-600 transition hover:text-red-800">
            <FaTrashAlt size={20} className="mr-2" />
            Delete Account
          </button>
          <button className="flex items-center text-secondary transition hover:text-primaryVariant">
            <FaSignOutAlt size={20} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
