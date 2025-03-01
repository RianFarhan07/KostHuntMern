import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
import {
  selectFavoriteItems,
  clearFavorites,
} from "../redux/favorite/favoriteSlice";
import KostCard from "../components/KostCard";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Favorite = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [favoriteKosts, setFavoriteKosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKosts, setSelectedKosts] = useState([]);
  const favoriteIds = useSelector(selectFavoriteItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchFavoriteKosts = async () => {
      try {
        setLoading(true);
        const promises = favoriteIds.map((id) =>
          fetch(`${import.meta.env.VITE_API_URL}/api/kost/get/${id}`).then(
            (res) => res.json(),
          ),
        );
        const kostsData = await Promise.all(promises);
        setFavoriteKosts(kostsData);
        // Initially select all kosts that are available
        setSelectedKosts(
          kostsData.filter((kost) => kost.availability).map((kost) => kost._id),
        );
      } catch (error) {
        console.error("Error fetching favorite kosts:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load favorite kosts",
        });
      } finally {
        setLoading(false);
      }
    };

    if (favoriteIds.length > 0) {
      fetchFavoriteKosts();
    } else {
      setFavoriteKosts([]);
      setSelectedKosts([]);
      setLoading(false);
    }
  }, [favoriteIds]);

  const handleClearFavorites = () => {
    Swal.fire({
      title: "Apakah anda yakin?",
      text: "Semua favorit akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffc107",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus semua!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearFavorites());
        Swal.fire("Terhapus!", "Daftar favorit telah dikosongkan.", "success");
      }
    });
  };

  const showLoginAlert = () => {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Silakan login terlebih dahulu untuk melanjutkan",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/sign-in", { state: { from: `/favorit` } });
      }
    });
  };

  const handleBookSelected = () => {
    if (selectedKosts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada kost yang dipilih",
        text: "Pilih minimal satu kost untuk melanjutkan pemesanan",
      });
      return;
    }

    // Check if any selected kost is not available
    const unavailableKosts = favoriteKosts.filter(
      (kost) => selectedKosts.includes(kost._id) && !kost.availability,
    );

    if (unavailableKosts.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Kost Tidak Tersedia",
        text: "Beberapa kost yang dipilih sudah tidak tersedia. Silakan pilih kost lain.",
      });
      return;
    }

    if (!currentUser) {
      showLoginAlert();
      return;
    }

    // Navigate to checkout with selected kost IDs
    navigate(`/checkout/${selectedKosts.join(",")}`);
  };

  const handleToggleSelect = (kostId) => {
    setSelectedKosts((prev) =>
      prev.includes(kostId)
        ? prev.filter((id) => id !== kostId)
        : [...prev, kostId],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FaHeart className="text-2xl text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">
              Kost Favorit Saya
            </h1>
          </div>

          <div className="flex gap-4">
            {favoriteKosts.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookSelected}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primaryVariant"
                  disabled={selectedKosts.length === 0}
                >
                  <FaShoppingCart />
                  <span>Pesan Sekarang ({selectedKosts.length})</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFavorites}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                >
                  <FaTrash />
                  <span>Hapus Semua</span>
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : favoriteKosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl bg-white p-8 shadow-lg"
          >
            <FaHeart className="mb-4 text-6xl text-gray-300" />
            <h2 className="mb-2 text-xl font-semibold text-gray-700">
              Belum ada kost favorit
            </h2>
            <p className="text-gray-500">
              Anda belum menambahkan kost ke daftar favorit
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="mt-6 rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primaryVariant"
            >
              Cari Kost
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {favoriteKosts.map((kost) => (
              <div key={kost._id} className="relative">
                <KostCard
                  item={kost}
                  isMyFavorite={true}
                  isSelected={selectedKosts.includes(kost._id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorite;
