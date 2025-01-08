import React, { useEffect } from "react";
import { FaCreditCard, FaIdCard, FaRegCalendarCheck } from "react-icons/fa";
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
  FiFileText,
} from "react-icons/fi";
import {
  MdContacts,
  MdMoney,
  MdSecurity,
  MdVerified,
  MdWork,
} from "react-icons/md";

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
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
          <div className="text-sm text-gray-500">ID: {order._id}</div>
        </div>

        <div className="space-y-6">
          {/* Kost Information */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FiHome className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">{order.kostId.name}</h3>
            </div>
            <p className="mb-2 text-gray-600">{order.kostId.description}</p>
            <p className="mb-2 text-gray-600">
              {order.kostId.location}, {order.kostId.city}
            </p>
            <div className="mb-2 flex items-center gap-2">
              <MdSecurity className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Tipe: {order.kostId.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdMoney className="h-5 w-5 text-gray-400" />
              <span className="font-medium">
                Harga per Bulan: Rp {order.kostId.price.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="mt-3">
              <h4 className="mb-2 font-medium">Fasilitas:</h4>
              <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Tenant Information */}
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
              <div className="flex items-center gap-2">
                <FaIdCard className="h-5 w-5 text-gray-400" />
                <span>KTP: {order.tenant.identityNumber}</span>
              </div>
            </div>

            {/* KTP Image */}
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <FaIdCard className="h-5 w-5 text-gray-400" />
                Foto KTP
              </h4>
              <div className="overflow-hidden rounded-lg border">
                {order.tenant.identityImage ? (
                  <img
                    src={order.tenant.identityImage}
                    alt="KTP"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/200";
                      e.target.alt = "KTP image not available";
                    }}
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">
                    Foto KTP tidak tersedia
                  </div>
                )}
              </div>
            </div>
            {/* Emergency Contact */}
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-3 font-medium">Kontak Darurat:</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MdContacts className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.emergencyContact.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                  <span>{order.tenant.emergencyContact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUser className="h-5 w-5 text-gray-400" />
                  <span>
                    Hubungan: {order.tenant.emergencyContact.relationship}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
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
              <div className="flex items-center gap-2">
                <FiFileText className="h-5 w-5 text-gray-400" />
                <span>Status Order: {order.orderStatus}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900">
              Informasi Pembayaran
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MdMoney className="h-5 w-5 text-gray-400" />
                  <span className="capitalize">{order.payment.method}</span>
                </div>
                <div className="text-xl font-semibold">
                  Rp {order.payment.amount.toLocaleString("id-ID")}
                </div>
                {order.payment.cash.verifiedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MdVerified className="h-4 w-4" />
                    <span>
                      Terverifikasi pada:{" "}
                      {formatDate(order.payment.cash.verifiedAt)}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-4 py-2 ${getStatusColor(order.payment.status)}`}
              >
                {getStatusIcon(order.payment.status)}
                <span className="capitalize">{order.payment.status}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
            {/* {order.payment.status === "pending" && (
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Bayar Sekarang
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
