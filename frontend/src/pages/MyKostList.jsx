import React from "react";
import { useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import KostCard from "../components/KostCard";
import CustomButton from "../components/CustomButton";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { autoLogout } from "../redux/user/userSlice";
import { Link } from "react-router-dom";

const MyKostList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [userKost, setUserKost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const itemsPerPage = 9;
  const dispatch = useDispatch();

  useEffect(() => {
    fetchKost();
  }, []);

  const fetchKost = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/user/kost/${currentUser._id}`);
      const data = await res.json();

      if (data.success === false) {
        setError(true);
        return;
      }

      if (res.status === 401) {
        const errorData = await res.json(); // Parse JSON responsenya
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

      setUserKost(data);
    } catch (error) {
      console.log(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(userKost.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userKost.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Kost Saya</h1>
        <Link to={"/addKost"}>
          <CustomButton>
            <FaPlus className="mr-2 h-4 w-4" />
            Tambah Kost
          </CustomButton>
        </Link>
      </div>

      {/* Kost Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((kost, index) => (
          <KostCard key={index} item={kost} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-4">
        <CustomButton
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="outline"
        >
          <FaChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </CustomButton>
        <span className="flex items-center">
          Page {currentPage} of {totalPages}
        </span>
        <CustomButton
          onClick={nextPage}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
          <FaChevronRight className="ml-2 h-4 w-4" />
        </CustomButton>
      </div>
    </div>
  );
};

export default MyKostList;
