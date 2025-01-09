import React, { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { autoLogout } from "../redux/user/userSlice";
import Swal from "sweetalert2";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModal";

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

const Tenant = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("paid");
  const [paidOrders, setPaidOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const refreshOrders = () => {
    setRefreshTrigger((prev) => prev + 1); // Increment trigger to force refresh
  };

  useEffect(() => {
    if (!currentUser) {
      setError("User not found");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both types of orders simultaneously
        const [paidOrder, unPaidOrder] = await Promise.all([
          fetchPaidOrders(),
          fetchUnpaidOrders(),
        ]);

        if (paidOrder) setPaidOrders(paidOrder);
        if (unPaidOrder) setUnpaidOrders(unPaidOrder);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("unauthorized")) {
          dispatch(autoLogout());
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser?._id, dispatch, refreshTrigger]);

  const fetchPaidOrders = async () => {
    const response = await fetch(
      `/api/orders/tenant-paid-orders/${currentUser._id}`,
    );

    if (response.status === 401) {
      const errorData = await response.json();
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text:
          errorData.message || "Your session has expired. Please log in again.",
      });
      dispatch(autoLogout());
      return [];
    }

    if (!response.ok) {
      throw new Error("Failed to fetch paid orders");
    }
    const data = await response.json();
    return data.orders;
  };

  const fetchUnpaidOrders = async () => {
    const response = await fetch(
      `/api/orders/tenant-unpaid-orders/${currentUser._id}`,
    );

    if (response.status === 401) {
      const errorData = await response.json();
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text:
          errorData.message || "Your session has expired. Please log in again.",
      });
      dispatch(autoLogout());
      return [];
    }

    if (!response.ok) {
      throw new Error("Failed to fetch unpaid orders");
    }
    const data = await response.json();
    return data.orders;
  };

  const handleModalClose = () => {
    setSelectedOrder(null);
    refreshOrders(); // Refresh orders when modal closes
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const currentOrders = activeTab === "paid" ? paidOrders : unpaidOrders;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Pesanan Tenant
        </h1>
        <div className="flex gap-2">
          <Tab
            active={activeTab === "paid"}
            onClick={() => setActiveTab("paid")}
          >
            Paid
          </Tab>
          <Tab
            active={activeTab === "unpaid"}
            onClick={() => setActiveTab("unpaid")}
          >
            Unpaid
          </Tab>
        </div>
      </div>

      <div className="space-y-4">
        {currentOrders?.length > 0 ? (
          currentOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetail={() => setSelectedOrder(order)}
              isMyOrder={false}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tidak ada pesanan {activeTab}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={handleModalClose}
          order={selectedOrder}
          owner={true}
        />
      )}
    </div>
  );
};
export default Tenant;
