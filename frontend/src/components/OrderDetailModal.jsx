import React, { useEffect } from "react";
import { FaRegCalendarCheck } from "react-icons/fa";
import {
  FiX,
  FiHome,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { MdMoney, MdWork } from "react-icons/md";

const OrderDetailModal = ({ isOpen, onClose, order, myOrder }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        return <FiCheckCircle className="h-5 w-5" />;
      case "pending":
        return <FiAlertCircle className="h-5 w-5" />;
      case "cancelled":
        return <FiXCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100"
        >
          <FiX className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Detail Pesanan
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FiHome className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{order.kostId.name}</h3>
            </div>
            <p className="text-gray-600">
              {order.kostId.location}, {order.kostId.city}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {order.kostId.facilities.map((facility, index) => (
                <span
                  key={index}
                  className="rounded-full bg-white px-3 py-1 text-sm text-gray-600"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>

          {myOrder ? (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900">Informasi Penyewa</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdWork className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.occupation}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900">Informasi Pemilik</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-gray-400" />
                  <span>{order.ownerId.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="h-5 w-5 text-gray-400" />
                  <span>{order.ownerId.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900">Detail Sewa</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <span>Mulai: {formatDate(order.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaRegCalendarCheck className="h-5 w-5 text-gray-400" />
                <span>Selesai: {formatDate(order.endDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="h-5 w-5 text-gray-400" />
                <span>Durasi: {order.duration} bulan</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900">
              Informasi Pembayaran
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {order.payment.method === "cash" ? (
                    <MdMoney className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaCreditCard className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="capitalize">{order.payment.method}</span>
                </div>
                <div className="text-xl font-semibold">
                  Rp {order.payment.amount.toLocaleString("id-ID")}
                </div>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-4 py-2 ${getStatusColor(order.payment.status)}`}
              >
                {getStatusIcon(order.payment.status)}
                <span className="capitalize">{order.payment.status}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
            {order.payment.status === "pending" && (
              <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primaryVariant">
                Bayar Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
