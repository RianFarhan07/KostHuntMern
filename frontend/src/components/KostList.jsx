import React, { useEffect, useState } from "react";
import KostCard from "./KostCard";
import "../styles/section.css";
import { FiLoader } from "react-icons/fi";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";

const KostList = () => {
  // Sample data - you can replace this with your actual data source
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [kost, setKost] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKost();
  }, []);

  const fetchKost = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/kost/getRandom");
      const data = await res.json();

      if (data.success === false) {
        setError(true);
        return;
      }

      setKost(data.kosts);
    } catch (error) {
      console.log(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMore = () => {
    navigate("/search");
  };

  if (loading) {
    return (
      <section id="kost" className="kost">
        <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-2">
            <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Memuat daftar kost...</p>
          </div>
        </div>
      </section>
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
    <section id="kost" className="kost">
      <div className="container mx-auto px-4">
        <div className="kost-header">
          <h2>
            Pilihan <span>Kost</span>
          </h2>
          <div className="header-line"></div>
        </div>
        <div className="flex justify-end">
          <CustomButton onClick={handleSeeMore} className="px-4 py-2 text-sm">
            Lihat Lebih Banyak
          </CustomButton>
        </div>
        <div className="grid grid-cols-1 gap-8 py-5 md:grid-cols-2 lg:grid-cols-3">
          {kost.map((item) => (
            <KostCard key={item._id} item={item} isMyKostList={false} />
          ))}
        </div>
        {/* Empty State */}
        {!loading && kost.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">Belum ada kost yang tersedia</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default KostList;
