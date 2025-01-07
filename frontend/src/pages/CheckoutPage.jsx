import React, { useEffect, useState } from "react";
import {
  BsCreditCard2Front,
  BsCash,
  BsCheckCircleFill,
  BsPerson,
  BsHouseDoor,
} from "react-icons/bs";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [duration, setDuration] = useState(1);
  const [kost, setKost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();

  const [tenantForm, setTenantForm] = useState({
    name: "",
    email: "",
    phone: "",
    identityNumber: "",
    occupation: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const validateForm = () => {
    // Check required tenant information
    if (!tenantForm.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nama lengkap Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.email.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi alamat email Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tenantForm.email)) {
      Swal.fire({
        icon: "error",
        title: "Format Email Salah",
        text: "Mohon masukkan alamat email yang valid",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.phone.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nomor telepon Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.identityNumber.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nomor identitas (KTP) Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    // Check payment method
    if (!paymentMethod) {
      Swal.fire({
        icon: "error",
        title: "Metode Pembayaran",
        text: "Mohon pilih metode pembayaran",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    // Show loading state
    const loadingAlert = Swal.fire({
      title: "Memproses Pembayaran",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      loadingAlert.close();

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Anda akan diarahkan ke halaman pembayaran",
        confirmButtonColor: "#2563eb",
      });

      console.log("Lanjut ke pembayaran");
      // Add your payment processing logic here
    } catch (error) {
      loadingAlert.close();

      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Mohon coba lagi nanti",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil data kost terlebih dahulu
        const kostRes = await fetch(`/api/kost/get/${params.id}`);
        if (!kostRes.ok) {
          throw new Error(`HTTP error! status: ${kostRes.status}`);
        }
        const kostData = await kostRes.json();
        setKost(kostData);

        // Setelah data kost berhasil didapatkan, panggil data owner
        if (kostData.userRef) {
          const ownerRes = await fetch(`/api/user/${kostData.userRef}`);
          if (ownerRes.ok) {
            const ownerData = await ownerRes.json();
            setOwner(ownerData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) return <p className="my-7 text-center text-2xl">Memuat...</p>;
  if (error)
    return <p className="my-7 text-center text-2xl">Terjadi kesalahan!</p>;
  if (!kost) return null;

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-onsurface">Checkout</h1>

        {/* Informasi Kost dan Pemilik */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <BsHouseDoor className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">{kost.name}</h2>
            </div>
            <p className="mt-2 text-gray-600">{kost.location}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">Harga per Bulan</p>
                <p className="text-lg font-semibold text-primary">
                  Rp {kost.price.toLocaleString("id-ID")}
                </p>
              </div>
              {kost.originalPrice > kost.price && (
                <div>
                  <p className="text-sm text-gray-500">Harga Normal</p>
                  <p className="text-lg text-gray-400 line-through">
                    Rp {kost.originalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {owner && (
            <div className="flex items-start gap-4">
              <img
                src={owner.avatar}
                alt={owner.username}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <BsPerson className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Pemilik Kost</h3>
                </div>
                <p className="mt-1">{owner.username}</p>
                <p className="text-sm text-gray-500">{owner.email}</p>
                {kost.contact && (
                  <p className="text-sm text-gray-500">
                    Telepon: {kost.contact.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Penyewa */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Informasi Pribadi</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.email}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.phone}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Identitas (KTP)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.identityNumber}
                  onChange={(e) =>
                    setTenantForm({
                      ...tenantForm,
                      identityNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pilihan Durasi */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Durasi Penyewaan</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 3, 6, 12].map((months) => (
              <button
                key={months}
                onClick={() => setDuration(months)}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  duration === months
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="font-medium">
                  {months} Bulan{months > 1 ? "" : ""}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Rp {(kost.price * months).toLocaleString("id-ID")}
                </div>
                {duration === months && (
                  <BsCheckCircleFill className="mx-auto mt-2 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Metode Pembayaran</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod("midtrans")}
              className={`flex items-center rounded-lg border-2 p-4 transition-all ${
                paymentMethod === "midtrans"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <BsCreditCard2Front className="mr-3 h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-medium">Pembayaran Midtrans</div>
                <div className="text-sm text-gray-500">
                  Bayar dengan berbagai metode
                </div>
              </div>
              {paymentMethod === "midtrans" && (
                <BsCheckCircleFill className="ml-auto text-primary" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex items-center rounded-lg border-2 p-4 transition-all ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <BsCash className="mr-3 h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-medium">Pembayaran Tunai</div>
                <div className="text-sm text-gray-500">
                  Bayar langsung ke pemilik
                </div>
              </div>
              {paymentMethod === "cash" && (
                <BsCheckCircleFill className="ml-auto text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Ringkasan dan Tombol Checkout */}
        <div className="flex flex-col items-center justify-between rounded-xl bg-background p-6 shadow-lg sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium">Total Pembayaran</h3>
            <p className="mt-1 text-sm text-gray-500">
              Rp {kost.price.toLocaleString("id-ID")} × {duration} bulan
            </p>
            <p className="text-2xl font-bold text-primary">
              Rp {(kost.price * duration).toLocaleString("id-ID")}
            </p>
          </div>
          <button
            className="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-onPrimary transition-colors hover:bg-primaryVariant sm:w-auto"
            onClick={handleCheckout}
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
