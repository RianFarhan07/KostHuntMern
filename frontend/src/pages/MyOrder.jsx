import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModal";
import Swal from "sweetalert2";
import { autoLogout } from "../redux/user/userSlice";
import ReviewKostModal from "../components/ReviewKostModal";
import PropTypes from "prop-types";

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

const MyOrder = () => {
  const { currentUser } = useSelector((state) => state.user); // Corrected use of useSelector
  const [activeTab, setActiveTab] = useState("ordered");
  const [orderedOrders, setOrderedOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedKostId, setSelectedKostId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  const dispatch = useDispatch();
  console.log(currentUser._id);

  const refreshOrders = () => {
    setRefreshTrigger((prev) => prev + 1); // Increment trigger to force refresh
  };

  useEffect(() => {
    if (!currentUser) {
      setError("User not found.");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both types of orders simultaneously
        const [orderedData, pendingData] = await Promise.all([
          fetchMyOrders(),
          fetchPendingOrders(),
        ]);

        if (orderedData) setOrderedOrders(orderedData);
        if (pendingData) setPendingOrders(pendingData);
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
  }, [currentUser?._id, dispatch, refreshTrigger]); // Add refreshTrigger to dependencies

  // Tambahkan dispatch ke dependencies

  const fetchMyOrders = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/orders/my-orders/${currentUser._id}`,
      {
        credentials: "include",
      },
    );

    // Tambahkan pengecekan 401 yang sama
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
      throw new Error("Failed to fetch orders");
    }
    const data = await response.json();
    return data.orders;
  };
  console.log(orderedOrders);

  const fetchPendingOrders = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/orders/my-pending-orders/${currentUser._id}`,
      {
        credentials: "include",
      },
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
      throw new Error("Failed to fetch pending orders");
    }

    const data = await response.json();
    return data.orders;
  };

  const handleModalClose = () => {
    setSelectedOrder(null);
    refreshOrders(); // Refresh orders when modal closes
  };

  const handleReviewClick = (kostId) => {
    // Find order with matching kostId
    const order = orderedOrders.find((order) => order.kostId._id === kostId);

    // Find existing review for current user
    const existingReview = order?.kostId.reviews.find(
      (review) => review.user === currentUser._id,
    );

    setSelectedKostId(kostId);
    setSelectedReview(existingReview);
    setIsReviewModalOpen(true);
  };

  const handleReviewClose = () => {
    setSelectedKostId(null);
    setIsReviewModalOpen(false);
    refreshOrders();
  };

  const handleReviewSubmitted = () => {
    refreshOrders();
    setIsReviewModalOpen(false);
    setSelectedKostId(null);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <FiLoader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (error)
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
        >
          Coba lagi
        </button>
      </div>
    );

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
            <OrderCard
              key={order._id}
              order={order}
              onViewDetail={() => setSelectedOrder(order)}
              owner={false}
              currentUser={currentUser}
              onReview={handleReviewClick}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tidak ada pesanan {activeTab}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={handleModalClose}
          order={selectedOrder}
          owner={false}
        />
      )}

      {/* Review Modal */}
      {selectedKostId && (
        <ReviewKostModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewClose}
          kostId={selectedKostId}
          onReviewSubmitted={handleReviewSubmitted}
          existingReview={selectedReview}
        />
      )}
    </div>
  );
};
Tab.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default MyOrder;
