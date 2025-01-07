import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCalendar,
  FiUser,
  FiHome,
  FiCircle,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import OrderCard from "../components/OrderCard";

// Components remain the same
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-primary text-white"
        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-8">
    <FiLoader className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
    <p>{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
    >
      Coba lagi
    </button>
  </div>
);

const MyOrder = () => {
  const { currentUser } = useSelector((state) => state.user); // Corrected use of useSelector
  const [activeTab, setActiveTab] = useState("ordered");
  const [orderedOrders, setOrderedOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(currentUser._id);

  useEffect(() => {
    if (!currentUser) {
      setError("User not found.");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === "ordered") {
          const data = await fetchMyOrders();
          setOrderedOrders(data);
        } else {
          const data = await fetchPendingOrders();
          setPendingOrders(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, currentUser?._id]); // Depend on currentUser ID

  const fetchMyOrders = async () => {
    const response = await fetch(`/api/orders/my-orders/${currentUser._id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    const data = await response.json();
    return data.orders;
  };

  const fetchPendingOrders = async () => {
    const response = await fetch(
      `/api/orders/my-pending-orders/${currentUser._id}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pending orders");
    }
    const data = await response.json();
    return data.orders;
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const currentOrders = activeTab === "ordered" ? orderedOrders : pendingOrders;
  console.log(currentOrders);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Pesanan Saya</h1>
        <div className="flex gap-2">
          <Tab
            active={activeTab === "ordered"}
            onClick={() => setActiveTab("ordered")}
          >
            Ordered
          </Tab>
          <Tab
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </Tab>
        </div>
      </div>

      <div className="space-y-4">
        {currentOrders?.length > 0 ? (
          currentOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tidak ada pesanan {activeTab}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrder;
