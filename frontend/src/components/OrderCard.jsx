/* eslint-disable react/prop-types */
import { FaCreditCard, FaStar, FaWhatsapp } from "react-icons/fa";
import {
  FiClock,
  FiCalendar,
  FiUser,
  FiHome,
  FiCircle,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { MdMoney } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const OrderCard = ({ order, onViewDetail, onReview, currentUser, owner }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <FiCheckCircle className="h-4 w-4" />;
      case "pending":
        return <FiAlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiCircle className="h-4 w-4" />;
    }
  };

  const getDurationStatus = () => {
    const currentDate = new Date();
    const startDate = new Date(order.startDate);
    const endDate = new Date(order.endDate);

    if (currentDate < startDate) {
      return {
        text: "Belum Mulai",
        color: "bg-blue-50 text-blue-700",
      };
    } else if (currentDate > endDate) {
      return {
        text: "Sudah Berakhir",
        color: "bg-gray-50 text-gray-700",
      };
    } else {
      return {
        text: "Sedang Berlangsung",
        color: "bg-green-50 text-green-700",
      };
    }
  };

  const existingReview = order.kostId.reviews.find(
    (review) => review.user === currentUser?._id,
  );

  const handleReviewClick = () => {
    onReview(order.kostId._id, existingReview);
  };
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+")) {
      return `+62${phoneNumber.substring(1)}`;
    }
    return phoneNumber;
  };

  const handleWhatsAppChatForMyOrder = () => {
    const message = `Halo, saya ${order.tenant.name}. Saya sudah melakukan pemesanan kost "${order.kostId.name}" dengan ID pesanan ${order._id} untuk durasi ${order.duration} bulan mulai ${new Date(
      order.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}. Mohon konfirmasi untuk acc pemesanan saya. Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formatPhoneNumber(order.kostId?.contact.whatsapp)}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleWhatsAppChatForOwner = () => {
    const message = `Halo, saya ${order.ownerId.username} pemilik kost ${order.kostId.name}. Saya ingin mengkonfirmasi pesanan kost Anda dengan ID ${order._id} untuk durasi ${order.duration} bulan yang akan dimulai pada ${new Date(
      order.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}. Silakan balas pesan ini untuk kelanjutan proses pemesanan. Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formatPhoneNumber(order.tenant.phone)}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const durationStatus = getDurationStatus();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mb-2 flex items-center gap-2"
              >
                <FiHome className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">
                  {order.kostId.name}
                </h3>
              </motion.div>

              <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-row items-center gap-1.5 rounded-lg bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="h-4 w-4" />
                    <span>Mulai:</span>
                  </div>
                  <span className="font-medium">
                    {new Date(order.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-row items-center gap-1.5 rounded-lg bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="h-4 w-4" />
                    <span>Berakhir:</span>
                  </div>
                  <span className="font-medium">
                    {new Date(order.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-2">
                    <FiClock className="h-4 w-4" />
                    <span>{order.duration} bulan</span>
                  </div>
                  {order.orderStatus === "ordered" && (
                    <div
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${durationStatus.color}`}
                    >
                      {durationStatus.text}
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                {/* Owner Information */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg bg-blue-50 p-4"
                >
                  <h4 className="mb-2 font-medium text-gray-900">
                    Informasi Pemilik
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {order.ownerId.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {order.ownerId.email}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Tenant Information */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  <h4 className="mb-2 font-medium text-gray-900">
                    Informasi Penyewa
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{order.tenant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {order.tenant.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {order.tenant.email}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(order.payment.status)}`}
            >
              {getStatusIcon(order.payment.status)}
              <span className="capitalize">{order.payment.status}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4"
          >
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-sm text-gray-600">
                {order.payment.method === "cash" ? (
                  <MdMoney className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaCreditCard className="h-5 w-5 text-gray-400" />
                )}
                <span className="capitalize">{order.payment.method}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Rp {order.payment.amount.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onViewDetail}
                className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Detail
              </motion.button>

              {order.payment.status.toLowerCase() === "paid" && !owner && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReviewClick}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <FaStar className="text-lg" />
                  <span>{existingReview ? "Edit Ulasan" : "Beri Ulasan"}</span>
                </motion.button>
              )}

              {order.payment.status === "pending" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={
                    owner
                      ? handleWhatsAppChatForOwner
                      : handleWhatsAppChatForMyOrder
                  }
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>Konfirmasi Pesanan</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderCard;
