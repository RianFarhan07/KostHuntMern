import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCamera, FaTrashAlt, FaSignOutAlt, FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Swal from "sweetalert2";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { app } from "../firebase/firebase.config";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  // Effect untuk sync formData dengan currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        username: currentUser.username || "",
        email: currentUser.email || "",
        avatar: currentUser.avatar || "",
      }));
    }
  }, [currentUser]);

  console.log(formData);

  // Add effect to fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${currentUser._id}`);
        const data = await response.json();
        if (data.success !== false) {
          dispatch(updateUserSuccess(data));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (!currentUser) {
      fetchUserData();
    }
  }, []);

  const isUsernameValid = (username) => {
    const usernameRegex = /^[^\s]{3,20}$/;
    return usernameRegex.test(username);
  };

  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return password === "" || passwordRegex.test(password);
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Ukuran File Terlalu Besar",
          text: "Maksimum ukuran file adalah 2MB",
        });
        return;
      }

      if (!allowedTypes.includes(selectedFile.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipe File Tidak Didukung",
          text: "Hanya mendukung JPEG, PNG, dan GIF",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        console.log(error.message);
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL }),
        );
      },
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.username || !formData.email) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Username dan Email tidak boleh kosong",
      });
      setIsLoading(false);
      return;
    }

    if (!isUsernameValid(formData.username)) {
      Swal.fire({
        icon: "error",
        title: "Username Tidak Valid",
        text: "Username harus memiliki 3-20 karakter dan tidak boleh hanya berisi spasi",
      });
      setIsLoading(false);
      return;
    }

    if (!isEmailValid(formData.email)) {
      Swal.fire({
        icon: "error",
        title: "Email Tidak Valid",
        text: "Silakan masukkan email yang benar",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password && !isPasswordValid(formData.password)) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Valid",
        text: "Password minimal 8 karakter, memiliki huruf besar, angka, dan karakter khusus",
      });
      setIsLoading(false);
      return;
    }

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (data.success === false) {
        Swal.fire({
          icon: "error",
          title: "Pembaruan Gagal",
          text: data.message,
        });
        dispatch(updateUserFailure(data.message));
        setIsLoading(false);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Profil berhasil diperbarui",
      });

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteUserStart());
          const res = await fetch(`/api/user/delete/${currentUser._id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();

          if (data.success === false) {
            dispatch(deleteUserFailure(data.message));
            Swal.fire({
              title: "Error!",
              text: data.message || "Failed to delete account",
              icon: "error",
              confirmButtonText: "Ok",
            });
            return;
          }

          dispatch(deleteUserSuccess());
          Swal.fire({
            title: "Deleted!",
            text: "Your account has been deleted.",
            icon: "success",
            confirmButtonText: "Ok",
          });
        } catch (error) {
          dispatch(deleteUserFailure(error.message));
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to delete account",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      }
    });
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-poppins">
      {!currentUser ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              onChange={handleFileSelect}
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
            />
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt="profile"
              className="mt-2 h-24 w-24 cursor-pointer self-center rounded-full object-cover"
            />
            <p className="self-center text-sm">
              {fileUploadError ? (
                <span className="text-red-700">
                  Error Image upload (image must be less than 2 mb)
                </span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className="text-green-700">
                  Image successfully uploaded!
                </span>
              ) : (
                ""
              )}
            </p>
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
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full rounded-lg p-3 font-semibold uppercase text-onPrimary transition ${
                isLoading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-primary hover:bg-primaryVariant"
              }`}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center text-red-600 transition hover:text-red-800"
            >
              <FaTrashAlt size={20} className="mr-2" />
              Delete Account
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center text-secondary transition hover:text-primaryVariant"
            >
              <FaSignOutAlt size={20} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
