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
  FiAlertCircle,
  FiCheckCircle,
  FiRepeat,
  FiShoppingBag,
} from "react-icons/fi";
import { format } from "date-fns";
import { useInView } from "react-intersection-observer";

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
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
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

  // Chart configurations and data setup...
  const revenueChartData = {
    labels: stats.monthlyStats.map((stat) =>
      format(new Date(stat._id.year, stat._id.month - 1), "MMM yyyy"),
    ),
    datasets: [
      {
        label: "Monthly Revenue",
        data: stats.monthlyStats.map((stat) => stat.revenue),
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

  const paymentStatusData = {
    labels: ["Belum Dibayar", "Sudah Dibayar"],
    datasets: [
      {
        data: [stats.basicStats.pendingPayments, stats.basicStats.paidPayments],
        backgroundColor: ["#FFA500", "#4CAF50"],
        borderWidth: 0,
      },
    ],
  };

  const occupancyData = {
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
        borderWidth: 0,
      },
    ],
  };

  const paymentMethodData = {
    labels: ["Tunai", "Transfer"],
    datasets: [
      {
        data: [
          stats.basicStats.revenueStats.cashRevenue,
          stats.basicStats.revenueStats.transferRevenue,
        ],
        backgroundColor: ["#9C27B0", "#3F51B5"],
        borderWidth: 0,
      },
    ],
  };

  const chartConfigs = [
    {
      title: "Payment Status",
      data: {
        labels: ["Unpaid", "Paid"],
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
      title: "Occupancy Status",
      data: {
        labels: ["Occupied", "Ending Soon", "Available"],
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
      title: "Payment Methods",
      data: {
        labels: ["Cash", "Transfer"],
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
      title: "Tenant Demographics",
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 p-6"
    >
      <motion.h1
        variants={itemVariants}
        className="mb-8 text-4xl font-bold text-gray-800"
      >
        Dashboard Analytics
      </motion.h1>

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
          title="Total Revenue"
          value={stats.basicStats.revenueStats.totalRevenue}
          trend={8.7}
          className="bg-gradient-to-br from-green-400 to-green-600 text-white"
        />
        <StatCard
          icon={FiUsers}
          title="Active Tenants"
          value={stats.occupancyMetrics.currentlyOccupied}
          trend={-2.1}
          className="bg-gradient-to-br from-purple-400 to-purple-600 text-white"
        />
        <StatCard
          icon={FiRepeat}
          title="Retention Rate"
          value={stats.tenantRetention}
          trend={-50}
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white"
        />
        <StatCard
          icon={FiShoppingBag}
          title="Total Orders"
          value={stats.basicStats.totalOrders}
          trend={3.5}
          className="bg-gradient-to-br from-pink-400 to-pink-600 text-white"
        />
        <StatCard
          icon={FiClock}
          title="Pending Payments"
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
          Revenue Trends
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
                Popular Kosts
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
                        {kost.bookingCount} bookings
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
                        {tenant.totalBookings} bookings
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
              <h2 className="mb-6 text-xl font-bold text-gray-800">
                {chart.title}
              </h2>
              <div className="h-[300px]">
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
