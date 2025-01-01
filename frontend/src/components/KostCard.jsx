/* eslint-disable react/prop-types */
import { FaHeart, FaMapMarkedAlt } from "react-icons/fa";
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

const KostCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFavorite = useSelector((state) => selectIsFavorite(state, item._id));
  const currentUser = useSelector((state) => state.user.currentUser);

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

    if (isFavorite) {
      dispatch(removeFromFavorites(item._id));
    } else {
      dispatch(addToFavorites(item._id));
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
      {/* Image Section */}
      <Link to={`/kost/${item._id}`} className="block">
        <img
          src={item?.imageUrls[0] || gambarKost}
          alt={item?.name || "Kost"}
          className="kost-card-image h-48 w-full object-cover"
        />
      </Link>

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
        </div>
      </div>
    </motion.div>
  );
};

export default KostCard;
