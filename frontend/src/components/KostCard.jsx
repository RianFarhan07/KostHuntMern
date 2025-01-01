/* eslint-disable react/prop-types */
import { FaEdit, FaHeart, FaMapMarkedAlt, FaTrash } from "react-icons/fa";
import gambarKost from "../assets/default/kostDefault.jpg";
import "../styles/section.css";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
  selectIsFavorite,
} from "../redux/favorite/favoriteSlice";
import { autoLogout } from "../redux/user/userSlice";
import Swal from "sweetalert2";
import ModernToggle from "./ModernToggle";
import { useState } from "react";
``;
const KostCard = ({ item: initialItem, isMyKostList }) => {
  const [item, setItem] = useState(initialItem);
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFavorite = useSelector((state) => selectIsFavorite(state, item._id));
  const currentUser = useSelector((state) => state.user.currentUser);

  const showToast = (icon, title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon,
      title,
    });
  };

  const handleAddToFavorite = (e) => {
    e.preventDefault();

    if (!currentUser) {
      dispatch(autoLogout());
      navigate("/sign-in");
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Your session has expired. Please sign in again.",
      });
      return;
    }

    try {
      if (isFavorite) {
        dispatch(removeFromFavorites(item._id));
        showToast("success", "Dihapus dari favorit");
      } else {
        dispatch(addToFavorites(item._id));
        showToast("success", "Ditambahkan ke favorit");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      showToast("error", "Gagal memperbarui favorit");
    }
  };

  const handleAvailabilityToggle = async (checked) => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/kost/update/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          availability: checked,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update availability");
      }

      setItem((prev) => ({
        ...prev,
        availability: checked,
      }));

      showToast(
        "success",
        `Kost telah ${checked ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (error) {
      console.error("Error updating availability:", error);

      showToast("error", "Gagal memperbarui status");

      setItem((prev) => ({
        ...prev,
        availability: !checked,
      }));

      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("session")
      ) {
        dispatch(autoLogout());
        navigate("/sign-in");
      }
    } finally {
      setIsUpdating(false);
      console.log(item.availability);
    }
  };

  const handleDelete = async (kostId) => {
    try {
      // First show confirmation dialog
      const result = await Swal.fire({
        title: "Apakah anda yakin?",
        text: "Data kost yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      // If user confirms deletion
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: "Menghapus...",
          text: "Mohon tunggu sebentar",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        // Make delete request
        const response = await fetch(`/api/kost/delete/${kostId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete kost");
        }

        // Show success message
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kost telah dihapus",
          timer: 2000,
          showConfirmButton: false,
        });

        // Optional: Refresh the page or update the UI
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting kost:", error);

      // Show error message
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus kost",
        text: error.message || "Terjadi kesalahan saat menghapus data kost",
      });

      // If error is due to unauthorized access, redirect to login
      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("session")
      ) {
        dispatch(autoLogout());
        navigate("/sign-in");
      }
    }
  };

  const buttonVariants = {
    favorite: {
      scale: [1, 1.3, 1],
      rotate: [0, -15, 15, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    unfavorite: {
      scale: [1, 0.8, 1],
      rotate: [0, 0, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const heartVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
    exit: { scale: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="kost-card flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-gray-100 shadow-md transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* Image Section with Availability Toggle */}
      <div className="relative">
        <Link
          to={`/kost/${item._id}`}
          className="block transition-colors duration-300"
        >
          <motion.div
            animate={{
              filter: !item.availability ? "grayscale(100%)" : "grayscale(0%)",
              opacity: !item.availability ? 0.8 : 1,
            }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={item?.imageUrls[0] || gambarKost}
              alt={item?.name || "Kost"}
              className="kost-card-image h-48 w-full object-cover"
            />
          </motion.div>
        </Link>
        {isMyKostList && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-2 top-2 flex items-center gap-2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm"
          >
            <ModernToggle
              checked={item.availability}
              onChange={handleAvailabilityToggle}
              label={item.availability ? "Tersedia" : "Tidak Tersedia"}
              size="small"
              disabled={isUpdating}
            />
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="kost-card-content flex flex-grow flex-col p-5">
        {/* Title */}
        <h3 className="kost-card-title mb-2 text-xl font-semibold text-gray-800">
          {item?.name || "Nama Kost"}
        </h3>

        {/* Location */}
        <div className="kost-card-location mb-3 flex items-center text-gray-600">
          <FaMapMarkedAlt className="mr-2 h-4 w-4 text-primary" />
          <span>
            {item?.location && item?.city
              ? `${item.location}, ${item.city}`
              : "Lokasi tidak tersedia"}
          </span>
        </div>

        {/* Price */}
        <div className="kost-card-price mb-4">
          {item?.originalPrice ? (
            <div>
              <span className="text-lg font-bold text-primary">
                Rp {(item?.price || 0).toLocaleString()} /bulan
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                Rp {(item?.originalPrice || 0).toLocaleString()} /bulan
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">
              Rp {(item?.price || 0).toLocaleString()} /bulan
            </span>
          )}
        </div>

        {/* Facilities */}
        <div className="kost-card-facilities mb-4 flex flex-wrap gap-2">
          {item.facilities?.slice(0, 6).map((facility, index) => (
            <span
              key={index}
              className="facility-tag rounded-full bg-primary px-3 py-1 text-xs text-white"
            >
              {facility}
            </span>
          ))}
          {item.facilities?.length > 6 && (
            <div className="flex items-center rounded-full bg-primary px-3 py-1.5">
              <span className="text-xs font-medium text-white">
                +{item.facilities.length - 6} fasilitas lainnya
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center">
          <Link to={`/kost/${item._id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded border-2 border-primary px-4 py-2 text-sm font-bold text-primary transition-colors duration-300 hover:bg-primary hover:text-white"
            >
              Lihat Detail
            </motion.button>
          </Link>

          {/* Conditional rendering for MyKostList buttons */}
          {isMyKostList ? (
            <div className="ml-auto flex gap-2">
              <Link to={`/update-kost/${item._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded bg-yellow-500 p-2 text-white transition-colors hover:bg-yellow-600"
                  title="Edit"
                >
                  <FaEdit className="h-5 w-5" />
                </motion.button>
              </Link>
              <motion.button
                onClick={() => {
                  handleDelete(item._id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                title="Delete"
              >
                <FaTrash className="h-5 w-5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleAddToFavorite}
              variants={buttonVariants}
              animate={isFavorite ? "favorite" : "unfavorite"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`group ml-auto rounded-full border p-2 transition-all duration-300 ${
                isFavorite
                  ? "border-primary bg-primary hover:border-white"
                  : "border-blue-200 hover:border-primary"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFavorite ? "favorite" : "unfavorite"}
                  variants={heartVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <FaHeart
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isFavorite
                        ? "text-white group-hover:border-white"
                        : "text-primary"
                    }`}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default KostCard;
