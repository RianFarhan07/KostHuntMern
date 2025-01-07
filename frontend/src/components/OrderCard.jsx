import React from "react";
import { FaCreditCard } from "react-icons/fa";
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
} from "react-icons/fi";
import { MdMoney } from "react-icons/md";

const OrderCard = ({ order, onViewDetail }) => {
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <div className="mb-2 flex items-center gap-2">
              <FiHome className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">
                {order.kostId.name}
              </h3>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="h-4 w-4" />
                <span>
                  {new Date(order.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiClock className="h-4 w-4" />
                <span>{order.duration} bulan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiUser className="h-4 w-4" />
                <span>{order.tenant.name}</span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(order.payment.status)}`}
          >
            {getStatusIcon(order.payment.status)}
            <span className="capitalize">{order.payment.status}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
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
            <button
              onClick={onViewDetail}
              className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Detail
            </button>
            {order.payment.status === "pending" && (
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primaryVariant">
                Bayar Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
