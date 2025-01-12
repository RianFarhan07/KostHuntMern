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

  if (!stats) return <div>Loading...</div>;

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
    labels: ["Pending", "Paid"],
    datasets: [
      {
        data: [stats.basicStats.pendingPayments, stats.basicStats.paidPayments],
        backgroundColor: ["#FFA500", "#4CAF50"],
        borderWidth: 0,
      },
    ],
  };

  const occupancyData = {
    labels: ["Currently Occupied", "Ending Soon", "Available"],
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
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-8 text-3xl font-bold">Dashboard Statistics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FaHome}
          title="Total Kosts"
          value={stats.basicStats.totalKosts}
          className="bg-blue-50"
        />
        <StatCard
          icon={FaMoneyBillWave}
          title="Total Orders"
          value={stats.basicStats.totalOrders}
          className="bg-green-50"
        />
        <StatCard
          icon={FaUserFriends}
          title="Current Occupancy"
          value={`${stats.occupancyMetrics.currentlyOccupied} units`}
          className="bg-purple-50"
        />
        <StatCard
          icon={FaClock}
          title="Ending Soon"
          value={stats.occupancyMetrics.endingSoon}
          className="bg-yellow-50"
        />
        <StatCard
          icon={FaExclamationCircle}
          title="Pending Payments"
          value={stats.basicStats.pendingPayments}
          className="bg-orange-50"
        />
        <StatCard
          icon={FaCheckCircle}
          title="Paid Payments"
          value={stats.basicStats.paidPayments}
          className="bg-green-50"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Payment Status</h2>
          <Doughnut data={paymentStatusData} options={chartOptions} />
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Occupancy Status</h2>
          <Doughnut data={occupancyData} options={chartOptions} />
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Revenue Overview</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded bg-gray-50 p-3 text-center">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.basicStats.revenueStats.totalRevenue)}
            </p>
          </div>
          <div className="rounded bg-gray-50 p-3 text-center">
            <p className="text-gray-600">Average Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.basicStats.revenueStats.averageRevenue)}
            </p>
          </div>
          <div className="rounded bg-gray-50 p-3 text-center">
            <p className="text-gray-600">Pending Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.basicStats.revenueStats.pendingRevenue)}
            </p>
          </div>
          <div className="rounded bg-gray-50 p-3 text-center">
            <p className="text-gray-600">Paid Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.basicStats.revenueStats.paidRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Popular Kosts Section */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Popular Kosts</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Kost Name
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Location
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Type
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Bookings
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Revenue
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Avg. Stay
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
                  <td className="p-4">{`${kost.averageStayDuration} months`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Statistics Section */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Tenant Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Phone
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Occupation
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Total Spent
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">
                  Bookings
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

      {/* Duration Statistics Section */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Stay Duration Analysis</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.durationStats.map((duration) => (
            <div key={duration._id} className="rounded bg-gray-50 p-4">
              <h3 className="mb-2 text-lg font-semibold">
                {duration._id} Month Stay
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Number of Bookings:{" "}
                  <span className="font-bold">{duration.count}</span>
                </p>
                <p className="text-gray-600">
                  Average Revenue:{" "}
                  <span className="font-bold">
                    {formatCurrency(duration.averageRevenue)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Total Revenue:{" "}
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
