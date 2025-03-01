import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrashAlt, FaSignOutAlt, FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Swal from "sweetalert2";
import {
  autoLogout,
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
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Effect untuk sync formData dengan currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        username: currentUser.username || "",
        email: currentUser.email || "",
        avatar: currentUser.avatar || "",
        password: "",
      }));
    }
  }, [currentUser]);

  const hasChanges = () => {
    return (
      formData.username !== currentUser.username ||
      formData.avatar !== currentUser.avatar ||
      (formData.password &&
        formData.password.trim() !== "" &&
        !isPasswordDisabled())
    );
  };

  const isPasswordDisabled = () => {
    return currentUser?.loginSource === "firebase";
  };

  // Add effect to fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/${currentUser._id}`,
        );
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
    const usernameRegex = /^[^\s]{3,25}$/;
    return usernameRegex.test(username);
  };

  const isPasswordValid = (password) => {
    const passwordRegex = /^[A-Za-z\d]{6,}$/;
    return password === "" || passwordRegex.test(password);
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
    // Prevent email from being changed
    if (e.target.id === "email") return;
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Tidak ada data yang diubah",
      });
      return;
    }

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
        text: "Username harus memiliki 3-25 karakter dan tidak boleh hanya berisi spasi",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password && !isPasswordValid(formData.password)) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Valid",
        text: "Password minimal 8 karakter",
      });
      setIsLoading(false);
      return;
    }

    const updateData = {
      username: formData.username,
      avatar: formData.avatar,
      ...(!isPasswordDisabled() &&
        formData.password && { password: formData.password }),
    };

    try {
      dispatch(updateUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          dispatch(autoLogout());
          navigate("/sign-in");
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Your session has expired. Please sign in again.",
          });
          return;
        }

        throw new Error(data.message || "Update failed");
      }

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message,
        });
        return;
      }

      dispatch(updateUserSuccess(data));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully",
      });
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred while updating profile",
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
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/user/delete/${currentUser._id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
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
      const res = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/signout",
      );
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
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 p-3 pl-10 text-gray-600"
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
                disabled={isPasswordDisabled()}
                className={`w-full rounded-lg border border-gray-300 p-3 pl-10 transition ${
                  isPasswordDisabled()
                    ? "cursor-not-allowed bg-gray-100 text-gray-600"
                    : "focus:border-primary focus:ring-2 focus:ring-primary/50"
                }`}
              />
              <RiLockPasswordLine
                className={`absolute left-3 text-gray-400 ${
                  isPasswordDisabled()
                    ? "top-4 text-gray-500"
                    : "top-1/2 -translate-y-1/2 transform"
                }`}
                size={20}
              />
              {isPasswordDisabled() && (
                <p className="mt-2 text-xs text-gray-500">
                  Password cannot be changed for Google accounts
                </p>
              )}
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
