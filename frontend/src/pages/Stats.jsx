import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FaHome,
  FaMoneyBillWave,
  FaUserFriends,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const Stats = () => {
  const [stats, setStats] = useState(null);

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

  if (!stats) return <div>Memuat...</div>;

  const StatCard = ({ icon: Icon, title, value, className }) => (
    <div className={`rounded-lg p-4 shadow-md ${className}`}>
      <div className="flex items-center space-x-3">
        <Icon className="text-2xl" />
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

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

  // Assuming we have tenant demographics data
  const occupationData = {
    labels: stats.tenantDemographics.slice(0, 4).map((demo) => demo._id),
    datasets: [
      {
        data: stats.tenantDemographics.slice(0, 4).map((demo) => demo.count),
        backgroundColor: ["#E91E63", "#009688", "#FF5722", "#795548"],
        borderWidth: 0,
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-8 text-3xl font-bold">Statistik Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FaHome}
          title="Total Kost"
          value={stats.basicStats.totalKosts}
          className="bg-blue-50"
        />
        <StatCard
          icon={FaMoneyBillWave}
          title="Total Pesanan"
          value={stats.basicStats.totalOrders}
          className="bg-green-50"
        />
        <StatCard
          icon={FaUserFriends}
          title="Kost Terisi"
          value={`${stats.occupancyMetrics.currentlyOccupied} unit`}
          className="bg-purple-50"
        />
        <StatCard
          icon={FaClock}
          title="Segera Berakhir"
          value={stats.occupancyMetrics.endingSoon}
          className="bg-yellow-50"
        />
        <StatCard
          icon={FaExclamationCircle}
          title="Belum Dibayar"
          value={stats.basicStats.pendingPayments}
          className="bg-orange-50"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Sudah Dibayar"
          value={stats.basicStats.paidPayments}
          className="bg-green-50"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Status Pembayaran</h2>
          <Doughnut data={paymentStatusData} options={chartOptions} />
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Status Ketersediaan</h2>
          <Doughnut data={occupancyData} options={chartOptions} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Metode Pembayaran</h2>
          <Doughnut data={paymentMethodData} options={chartOptions} />
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Pekerjaan Penyewa</h2>
          <Doughnut data={occupationData} options={chartOptions} />
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow">
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

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Kost Populer</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Nama Kost
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Lokasi
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Tipe
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Pemesanan
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Pendapatan
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Rata-rata Durasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.popularKosts.map((kost) => (
                <tr key={kost._id}>
                  <td className="p-4">{kost.kostName}</td>
                  <td className="p-4">{`${kost.location}, ${kost.city}`}</td>
                  <td className="p-4">{kost.type}</td>
                  <td className="p-4">{kost.bookingCount}</td>
                  <td className="p-4">{formatCurrency(kost.totalRevenue)}</td>
                  <td className="p-4">{`${kost.averageStayDuration} bulan`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Statistik Penyewa</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Nama
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Telepon
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Pekerjaan
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Total Pengeluaran
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Jumlah Pemesanan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.tenantStats.map((tenant) => (
                <tr key={tenant._id}>
                  <td className="p-4">{tenant.tenantName}</td>
                  <td className="p-4">{tenant._id}</td>
                  <td className="p-4">{tenant.phone}</td>
                  <td className="p-4">{tenant.occupation}</td>
                  <td className="p-4">{formatCurrency(tenant.totalSpent)}</td>
                  <td className="p-4">{tenant.totalBookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Analisis Durasi Tinggal</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.durationStats.map((duration) => (
            <div key={duration._id} className="rounded bg-gray-50 p-4">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
