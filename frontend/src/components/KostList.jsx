import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KostCard from "./KostCard";
import "../styles/section.css";
import { FiLoader } from "react-icons/fi";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";

const KostList = () => {
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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/kost/getRandom`,
      );
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <section id="kost" className="kost">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto flex min-h-[400px] items-center justify-center px-4"
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Memuat daftar kost...</p>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-screen items-center justify-center"
      >
        <div className="text-center">
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-red-600"
          >
            Terjadi kesalahan saat memuat data.
          </motion.p>
          <CustomButton onClick={fetchKost} className="mt-4">
            Coba Lagi
          </CustomButton>
        </div>
      </motion.div>
    );
  }

  return (
    <section id="kost" className="kost">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kost-header"
        >
          <h2>
            Pilihan <span>Kost</span>
          </h2>
          <div className="header-line"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <CustomButton onClick={handleSeeMore} className="px-4 py-2 text-sm">
            Lihat Lebih Banyak
          </CustomButton>
        </motion.div>

        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 py-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {kost.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <KostCard item={item} isMyKostList={false} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {!loading && kost.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
          >
            <p className="text-gray-600">Belum ada kost yang tersedia</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default KostList;
