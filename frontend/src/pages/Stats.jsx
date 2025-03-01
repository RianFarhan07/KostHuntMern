import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import CountUp from "react-countup";
import {
  FiHome,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiRepeat,
  FiShoppingBag,
} from "react-icons/fi";
import { useInView } from "react-intersection-observer";
import { FaStar } from "react-icons/fa";
import { downloadCompleteExcel } from "../components/CreateExcelWordbook";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

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
    },
  },
};

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [isFacilitiesShowMore, setFacilitiesShowMore] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  console.log(stats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/stats`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, trend, className }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl p-6 shadow-lg transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-white/20 p-3">
          <Icon className="text-2xl" />
        </div>
        {trend && (
          <div
            className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-700">{title}</h3>
      <div className="mt-2 text-3xl font-bold">
        <CountUp end={value} duration={2} separator="," />
      </div>
    </motion.div>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  //dummy data
  const revenueChartData = {
    labels: [
      "Jan 2024",
      "Feb 2024",
      "Mar 2024",
      "Apr 2024",
      "May 2024",
      "Jun 2024",
      "Jul 2024",
      "Aug 2024",
      "Sep 2024",
      "Oct 2024",
      "Nov 2024",
      "Dec 2024",
      "Jan 2025",
    ],
    datasets: [
      {
        label: "Pendapatan Bulanan",
        data: [
          45000000, // Jan 2024
          48000000, // Feb 2024
          52000000, // Mar 2024
          49500000, // Apr 2024
          51000000, // May 2024
          54000000, // Jun 2024
          58000000, // Jul 2024
          56000000, // Aug 2024
          53000000, // Sep 2024
          55000000, // Oct 2024
          57000000, // Nov 2024
          59000000, // Dec 2024
          52600000, // Jan 2025 (matching your current data)
        ],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.4,
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.1)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const chartConfigs = [
    {
      title: "Status Pembayaran",
      data: {
        labels: ["Belum Dibayar", "Sudah Dibayar"],
        datasets: [
          {
            data: [
              stats.basicStats.pendingPayments,
              stats.basicStats.paidPayments,
            ],
            backgroundColor: ["#FFA500", "#4CAF50"],
          },
        ],
      },
    },
    {
      title: "Status Hunian",
      data: {
        labels: ["Terisi", "Segera Berakhir", "Tersedia"],
        datasets: [
          {
            data: [
              stats.occupancyMetrics.currentlyOccupied,
              stats.occupancyMetrics.endingSoon,
              stats.basicStats.totalKosts -
                stats.occupancyMetrics.currentlyOccupied,
            ],
            backgroundColor: ["#4CAF50", "#FFA500", "#2196F3"],
          },
        ],
      },
    },
    {
      title: "Metode Pembayaran",
      data: {
        labels: ["Tunai", "Transfer"],
        datasets: [
          {
            data: [
              stats.basicStats.revenueStats.cashRevenue,
              stats.basicStats.revenueStats.transferRevenue,
            ],
            backgroundColor: ["#9C27B0", "#3F51B5"],
          },
        ],
      },
    },
    {
      title: "Demografi Penyewa",
      data: {
        labels: stats.tenantDemographics.map((demo) => demo._id),
        datasets: [
          {
            data: stats.tenantDemographics.map((demo) => demo.count),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
    },
  ];

  const facilitiesChartData = {
    labels: stats.facilitiesStats
      .sort((a, b) => b.count - a.count)
      .map((facility) => facility._id),
    datasets: [
      {
        label: "Jumlah Kost",
        data: stats.facilitiesStats
          .sort((a, b) => b.count - a.count)
          .map((facility) => facility.count),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const facilitiesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Distribusi Fasilitas di Kost",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="flex items-center justify-between space-x-4">
        <motion.h1
          variants={itemVariants}
          className="mb-8 text-4xl font-bold text-gray-800"
        >
          Analisis Dashboard
        </motion.h1>
        <button
          onClick={() => downloadCompleteExcel(stats)}
          className="rounded-md bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Download Complete Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FiHome}
          title="Total Kost"
          value={stats.basicStats.totalKosts}
          trend={5.2}
          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Pendapatan"
          value={stats.basicStats.revenueStats.totalRevenue}
          trend={8.7}
          className="bg-gradient-to-br from-green-400 to-green-600 text-white"
        />
        <StatCard
          icon={FiUsers}
          title="Penyewa Aktif"
          value={stats.occupancyMetrics.currentlyOccupied}
          trend={-2.1}
          className="bg-gradient-to-br from-purple-400 to-purple-600 text-white"
        />
        <StatCard
          icon={FiRepeat}
          title="Tingkat Retensi"
          value={stats.tenantRetention}
          trend={-50}
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white"
        />
        <StatCard
          icon={FiShoppingBag}
          title="Total Order"
          value={stats.basicStats.totalOrders}
          trend={3.5}
          className="bg-gradient-to-br from-pink-400 to-pink-600 text-white"
        />
        <StatCard
          icon={FiClock}
          title="Pembayaran Tertunda"
          value={stats.basicStats.pendingPayments}
          trend={-1.8}
          className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
        />
      </div>
      <motion.div
        variants={itemVariants}
        className="mt-8 rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Tren Pendapatan
        </h2>
        <Line data={revenueChartData} options={chartOptions} />
      </motion.div>
      {/* Revenue Overview */}
      <motion.div
        variants={itemVariants}
        className="mt-8 grid gap-6 lg:grid-cols-4"
      >
        <div className="rounded-xl bg-white p-4 shadow-lg lg:col-span-4">
          <h2 className="mb-4 text-xl font-semibold">Ikhtisar Pendapatan</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded bg-gray-50 p-3 text-center">
              <p className="text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.basicStats.revenueStats.totalRevenue)}
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 text-center">
              <p className="text-gray-600">Rata-rata Pendapatan</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.basicStats.revenueStats.averageRevenue)}
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 text-center">
              <p className="text-gray-600">Pendapatan Tertunda</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.basicStats.revenueStats.pendingRevenue)}
              </p>
            </div>
            <div className="rounded bg-gray-50 p-3 text-center">
              <p className="text-gray-600">Pendapatan Terbayar</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.basicStats.revenueStats.paidRevenue)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        ref={ref}
        variants={itemVariants}
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {inView && (
          <>
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Kost Terpopular
              </h2>
              <div className="space-y-4">
                {stats.popularKosts.map((kost, index) => (
                  <motion.div
                    key={kost._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{kost.kostName}</h3>
                      <p className="text-sm text-gray-600">{kost.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(kost.totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {kost.bookingCount} pemesanan
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Statistik Penyewa Teratas
              </h2>
              <div className="max-h-[400px] space-y-4 overflow-y-auto">
                {stats.tenantStats.map((tenant, index) => (
                  <motion.div
                    key={tenant._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{tenant.tenantName}</h3>
                      <p className="text-sm text-gray-600">
                        {tenant.occupation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(tenant.totalSpent)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tenant.totalBookings} pemesanan
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Statistik Fasilitas
        </h2>
        <div className="h-[400px]">
          <Bar data={facilitiesChartData} options={facilitiesChartOptions} />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setFacilitiesShowMore(!isFacilitiesShowMore)}
            className="rounded-md bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isFacilitiesShowMore
              ? "Tampilkan Lebih Sedikit"
              : "Tampilkan Detail"}
          </button>
        </div>

        <AnimatePresence>
          {isFacilitiesShowMore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 grid grid-cols-1 gap-4 overflow-hidden md:grid-cols-2 lg:grid-cols-3"
            >
              {stats.facilitiesStats
                .sort((a, b) => b.count - a.count)
                .map((facility, index) => (
                  <motion.div
                    key={facility._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {facility._id}
                      </h3>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {facility.count} kost
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Available in:</p>
                      <ul className="mt-1 list-inside list-disc">
                        {facility.kosts.map((kost, idx) => (
                          <li key={idx} className="truncate">
                            {kost}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Statistik Ulasan
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {stats.reviewStats.map((kost) => (
            <motion.div
              key={kost._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {kost.kostName}
                </h3>
                <div className="flex items-center gap-2">
                  <StarRating rating={kost.averageRating} />
                  <span className="font-medium text-gray-700">
                    {kost.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="mb-2 text-sm text-gray-600">
                Total Ulasan: {kost.totalReviews}
              </p>
              <div className="mt-4 space-y-3">
                {kost.ratings.slice(0, 1).map((review, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-gray-200 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        ref={ref}
        variants={itemVariants}
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {inView &&
          chartConfigs.map((chart, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="mb-6 flex justify-center text-xl font-bold text-gray-800">
                {chart.title}
              </h2>
              <div className="flex h-[300px] justify-center">
                <Doughnut data={chart.data} options={chartOptions} />
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* Stay Duration Analysis */}
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Analisis Durasi Tinggal</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.durationStats.map((duration) => (
            <motion.div
              key={duration._id}
              variants={itemVariants}
              className="rounded-lg bg-gray-50 p-4 shadow-md"
            >
              <h3 className="mb-2 text-lg font-semibold">
                Durasi {duration._id} Bulan
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Jumlah Pemesanan:{" "}
                  <span className="font-bold">{duration.count}</span>
                </p>
                <p className="text-gray-600">
                  Rata-rata Pendapatan:{" "}
                  <span className="font-bold">
                    {formatCurrency(duration.averageRevenue)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Total Pendapatan:{" "}
                  <span className="font-bold">
                    {formatCurrency(duration.totalRevenue)}
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Stats;
