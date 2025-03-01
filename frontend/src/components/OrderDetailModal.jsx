/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  FaCreditCard,
  FaIdCard,
  FaRegCalendarCheck,
  FaUpload,
} from "react-icons/fa";
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
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase/firebase.config";
import {
  MdContacts,
  MdMoney,
  MdSecurity,
  MdVerified,
  MdWork,
} from "react-icons/md";
import Swal from "sweetalert2";
import ktpPlaceholder from "../assets/default/ktpPlaceholder.png";
import { motion, AnimatePresence } from "framer-motion";

const OrderDetailModal = ({ isOpen, onClose, order, owner }) => {
  const [filePerc, setFilePerc] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const fileRef = useRef(null);

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
      },
    }),
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  useEffect(() => {
    if (order?.payment?.cash?.proofOfPayment) {
      setPaymentProofUrl(order?.payment?.cash?.proofOfPayment);
    }
  }, [order]);

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

  const uploadPaymentProofToServer = async () => {
    if (!paymentProofUrl) {
      Swal.fire({
        icon: "error",
        title: "Bukti Pembayaran Diperlukan",
        text: "Mohon unggah bukti pembayaran terlebih dahulu",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (paymentProofUrl === order?.payment?.cash?.proofOfPayment) {
      Swal.fire({
        icon: "error",
        title: "Bukti Pembayran tidak berubah",
        text: "Mohon unggah bukti pembayaran terlebih dahulu",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/upload-payment-proof/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proofOfPayment: paymentProofUrl,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload payment proof");
      }

      const data = await response.json();

      if (data.success) {
        Swal.fire(
          "Berhasil!",
          "Bukti pembayaran berhasil diunggah.",
          "success",
        );
        onClose();
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Gagal mengunggah bukti pembayaran",
        "error",
      );
    }
  };

  const handlePaymentProofUpload = (file) => {
    setIsUploading(true);
    const storage = getStorage(app);
    const fileName = `payment_proof_${order._id}_${new Date().getTime()}${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setIsUploading(false);
        Swal.fire({
          icon: "error",
          title: "Upload Gagal",
          text:
            "Gagal mengunggah bukti pembayaran. Silakan coba lagi." +
            "error" +
            error,
          confirmButtonColor: "#2563eb",
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setPaymentProofUrl(downloadURL);
          setIsUploading(false);
        });
      },
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file) {
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Ukuran File Terlalu Besar",
          text: "Maksimum ukuran file adalah 2MB",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipe File Tidak Didukung",
          text: "Hanya mendukung JPEG, PNG, dan GIF",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      handlePaymentProofUpload(file);
    }
  };

  const updatePaymentStatus = async () => {
    if (!paymentProofUrl) {
      Swal.fire({
        icon: "error",
        title: "Bukti Pembayaran Diperlukan",
        text: "Mohon unggah bukti pembayaran terlebih dahulu",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/verify-payment-status/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proofOfPayment: paymentProofUrl,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payment status");
      }

      const data = await response.json();

      if (data.success) {
        Swal.fire(
          "Pembayaran Dikonfirmasi!",
          "Status pembayaran telah diperbarui.",
          "success",
        );
        onClose();
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Gagal mengupdate status pembayaran",
        "error",
      );
    }
  };

  const handleConfirmPayment = () => {
    Swal.fire({
      title: "Konfirmasi Pembayaran",
      text: "Apakah Anda yakin ingin mengkonfirmasi pembayaran ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Konfirmasi",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        updatePaymentStatus();
      }
    });
  };

  const handlePayNow = () => {
    if (order?.payment?.midtrans?.paymentUrl) {
      window.open(order.payment.midtrans.paymentUrl, "_blank");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Payment URL tidak tersedia",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  // const checkPaymentStatus = async () => {
  //   try {
  //     // Check payment status after successful payment
  //     const statusResponse = await fetch(
  //       `/api/orders/check-status/${order._id}`,
  //     );
  //     const statusData = await statusResponse.json();
  //     if (statusData.success && statusData.order.payment.status === "paid") {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Pembayaran Berhasil",
  //         text: "Pesanan Anda telah dikonfirmasi",
  //         confirmButtonColor: "#2563eb",
  //       });
  //     } else {
  //       // If status is still pending, inform user to wait
  //       Swal.fire({
  //         icon: "info",
  //         title: "Memproses Pembayaran",
  //         text: "Pembayaran Anda sedang diproses. Silakan cek status pesanan secara berkala.",
  //         confirmButtonColor: "#2563eb",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error verifying payment:", error);
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Status Pembayaran",
  //       text: "Silakan cek status pesanan Anda di halaman pesanan",
  //       confirmButtonColor: "#2563eb",
  //     });
  //   }
  // };

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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        <motion.div
          className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 shadow-lg"
          variants={modalVariants}
        >
          <motion.button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX className="h-5 w-5" />
          </motion.button>

          <motion.div
            className="mb-6 flex items-center justify-between"
            variants={sectionVariants}
            custom={0}
          >
            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
            <div className="text-sm text-gray-500">ID: {order._id}</div>
          </motion.div>

          <div className="space-y-6">
            {/* Kost Information */}
            <motion.div
              className="space-y-4 rounded-lg border p-4"
              variants={sectionVariants}
              custom={2}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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
                  Harga per Bulan: Rp{" "}
                  {order.kostId.price.toLocaleString("id-ID")}
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
            </motion.div>

            {/* Tenant Information */}
            <motion.div
              className="space-y-4 rounded-lg border p-4"
              variants={sectionVariants}
              custom={3}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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
                <div className="overflow-hidden rounded-lg border bg-cover">
                  {order.tenant.identityImage ? (
                    <img
                      src={order.tenant.identityImage}
                      alt="KTP"
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.target.src = ktpPlaceholder;
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
            </motion.div>

            {/* Rental Details */}
            <motion.div
              className="space-y-4 rounded-lg border p-4"
              variants={sectionVariants}
              custom={3}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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
            </motion.div>

            {/* Payment Information */}
            <motion.div
              className="space-y-4 rounded-lg border p-4"
              variants={sectionVariants}
              custom={4}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="font-semibold text-gray-900">
                Informasi Pembayaran
              </h3>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {order.payment.method === "cash" ? (
                        <MdMoney className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiCreditCard className="h-5 w-5 text-gray-400" />
                      )}

                      <span className="capitalize">{order.payment.method}</span>
                    </div>
                    <div className="text-xl font-semibold">
                      Rp {order.payment.amount.toLocaleString("id-ID")}
                    </div>
                    {order?.payment?.cash?.verifiedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MdVerified className="h-4 w-4" />
                        <span>
                          {`
                        Terverifikasi pada: ${formatDate(order.payment.cash.verifiedAt)} oleh ${order.payment.cash.berifiedBy || order.ownerId.username}`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Transaction ID:{" "}
                        {order?.payment?.midtrans?.transactionId}
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 ${getStatusColor(
                      order.payment.status,
                    )}`}
                  >
                    {getStatusIcon(order.payment.status)}
                    <span className="capitalize">{order.payment.status}</span>
                  </div>
                </div>

                {/* Existing Payment Proof Display */}
                {order?.payment?.cash?.proofOfPayment && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-3 flex items-center gap-2 font-medium">
                      <FaCreditCard className="h-5 w-5 text-gray-400" />
                      Bukti Pembayaran
                    </h4>
                    <div className="overflow-hidden rounded-lg border">
                      <img
                        src={paymentProofUrl}
                        alt="Bukti Pembayaran"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/400/200";
                          e.target.alt = "Payment proof not available";
                        }}
                      />
                    </div>
                    {order?.payment?.cash?.uploadedAt && (
                      <div className="mt-2 text-sm text-gray-500">
                        Diunggah pada:{" "}
                        {formatDate(order.payment.cash.uploadedAt)}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Proof Upload Section */}
                {order.payment.status.toLowerCase() === "pending" && (
                  <>
                    {!owner && order.payment.method === "midtrans" ? (
                      <div className="mt-4 space-y-3 rounded-lg border p-4">
                        <h4 className="font-medium text-gray-900">
                          Selesaikan Pembayaran
                        </h4>
                        <button
                          onClick={handlePayNow}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          Bayar Sekarang
                        </button>
                        <p className="text-sm text-gray-500">
                          Anda akan diarahkan ke halaman pembayaran Midtrans
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 rounded-lg border p-4">
                        <h4 className="font-medium text-gray-900">
                          Upload Bukti Pembayaran
                        </h4>
                        <div className="flex flex-col items-center space-y-3">
                          <input
                            type="file"
                            ref={fileRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*"
                          />

                          {!order?.payment?.cash?.proofOfPayment &&
                            paymentProofUrl && (
                              <div className="w-full overflow-hidden rounded-lg border">
                                <img
                                  src={paymentProofUrl}
                                  alt="Preview bukti pembayaran"
                                  className="h-48 w-full object-cover"
                                />
                              </div>
                            )}

                          <button
                            onClick={() => fileRef.current.click()}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            disabled={isUploading}
                          >
                            <FaUpload className="h-5 w-5" />
                            {isUploading
                              ? `Mengunggah... ${filePerc}%`
                              : "Unggah Bukti Pembayaran"}
                          </button>
                          {paymentProofUrl && (
                            <div className="space-y-3">
                              {!owner && (
                                <button
                                  onClick={uploadPaymentProofToServer}
                                  className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                  Kirim Bukti Pembayaran ke Server
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-end gap-3 border-t pt-4"
              variants={sectionVariants}
              custom={5}
            >
              <motion.button
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tutup
              </motion.button>
              {owner && order.payment.status.toLowerCase() === "pending" && (
                <motion.button
                  onClick={handleConfirmPayment}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Konfirmasi Pembayaran
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;
