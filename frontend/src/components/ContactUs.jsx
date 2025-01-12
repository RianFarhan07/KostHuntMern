import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/section.css";
import { FaMapPin, FaPaperPlane } from "react-icons/fa";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pesan: "",
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");

    const scriptURL =
      "https://script.google.com/macros/s/AKfycbypOC1sRDFEWih_lnYXa6TqhXyHH-vMsA1Zq6FJUxR3BfdBNfAWNn4NOG5YSMgUtDzYNg/exec";
    const form = new FormData();

    Object.keys(formData).forEach((key) => form.append(key, formData[key]));

    try {
      const response = await fetch(scriptURL, { method: "POST", body: form });
      if (response.ok) {
        setStatus("success");
        setFormData({ nama: "", email: "", pesan: "" });
      } else {
        throw new Error("Gagal mengirim pesan.");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="contact" className="contact">
      <motion.div
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Keeping original CSS header */}
        <div className="contact-header">
          <h2>
            Hubungi <span>Kami</span>
          </h2>
          <div className="header-line"></div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            variants={itemVariants}
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="form-group">
                <label
                  htmlFor="nama"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Nama
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  id="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="form-group">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="form-group">
                <label
                  htmlFor="pesan"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Pesan
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="pesan"
                  rows="5"
                  value={formData.pesan}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
                  required
                ></motion.textarea>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primaryVariant"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPaperPlane />
                <span>{isLoading ? "Mengirim..." : "Kirim Pesan"}</span>
              </motion.button>

              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-lg p-3 text-center ${
                      status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {status === "success"
                      ? "Pesan berhasil dikirim!"
                      : "Gagal mengirim pesan. Silakan coba lagi."}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center space-x-3">
                <FaMapPin className="text-xl text-primary" />
                <h3 className="text-xl font-semibold">Alamat</h3>
              </div>
              <p className="mb-6 text-gray-600">Desa Siddo Kab Barru</p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-lg"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3528.1744149577494!2d119.62279587497652!3d-4.2377171957361535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d95906ab81869db%3A0xbdb867d18d33b203!2sRezki%20Ayra!5e1!3m2!1sid!2sid!4v1731311675001!5m2!1sid!2sid"
                  width="100%"
                  height="450"
                  className="rounded-lg border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactUs;
