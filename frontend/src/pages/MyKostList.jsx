import { useState, useEffect } from "react";
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import KostCard from "../components/KostCard";
import CustomButton from "../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { autoLogout } from "../redux/user/userSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MyKostList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [userKost, setUserKost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 9;
  const dispatch = useDispatch();

  useEffect(() => {
    fetchKost();
  }, [currentPage]);

  const fetchKost = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/kost/${currentUser._id}?page=${currentPage}&limit=${itemsPerPage}${
          searchTerm ? `&searchTerm=${searchTerm}` : ""
        }`,
      );

      if (res.status === 401) {
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text:
            errorData.message ||
            "Your session has expired. Please log in again.",
        });
        dispatch(autoLogout());
        return;
      }

      const data = await res.json();
      if (data.success === false) {
        setError(true);
        return;
      }

      setUserKost(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching kost data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchKost();
    setIsSearchOpen(false);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <FiLoader className="h-8 w-8 animate-spin text-black" />
          <p className="text-gray-600">Memuat daftar kost...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Terjadi kesalahan saat memuat data.</p>
          <CustomButton onClick={fetchKost} className="mt-4">
            Coba Lagi
          </CustomButton>
        </div>
      </div>
    );
  }

  const showPagination = userKost.length > 0 && totalPages > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Kost Saya</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5 text-gray-600" />
            </button>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 z-50 w-72 rounded-lg bg-white p-4 shadow-lg"
                >
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari kost..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900"
                      >
                        <FaSearch className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/addKost">
            <CustomButton>
              <FaPlus className="mr-2 h-4 w-4" />
              Tambah Kost
            </CustomButton>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userKost.length > 0 ? (
          userKost.map((kost) => (
            <KostCard key={kost._id} item={kost} isMyKostList={true} />
          ))
        ) : (
          <p className="col-span-3 text-center">Tidak ada kost yang tersedia</p>
        )}
      </div>

      {showPagination && (
        <div className="mt-8 flex justify-center gap-4">
          <CustomButton
            onClick={prevPage}
            disabled={currentPage === 1 || userKost.length === 0}
            variant="outline"
            className={`${
              currentPage === 1 || userKost.length === 0
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <FaChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </CustomButton>
          <span className="flex items-center">
            Page {currentPage} of {totalPages}
          </span>
          <CustomButton
            onClick={nextPage}
            disabled={currentPage === totalPages || userKost.length === 0}
            variant="outline"
            className={`${
              currentPage === totalPages || userKost.length === 0
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            Next
            <FaChevronRight className="ml-2 h-4 w-4" />
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default MyKostList;
