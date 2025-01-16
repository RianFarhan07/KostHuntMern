import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Tab } from "@headlessui/react";
import {
  FaArrowAltCircleUp,
  FaStar,
  FaTrophy,
  FaBullseye,
  FaChartLine,
  FaUsers,
  FaMapMarkedAlt,
} from "react-icons/fa";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

const Features = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const controls = useAnimation();

  const statistics = [
    {
      value: 5000,
      label: "Kost Terdaftar",
      prefix: "+",
      icon: <FaMapMarkedAlt className="h-8 w-8 text-yellow-500" />,
      growth: "+15% bulan ini",
    },
    {
      value: 98,
      label: "Kepuasan Pengguna",
      suffix: "%",
      icon: <FaUsers className="h-8 w-8 text-yellow-500" />,
      growth: "+5% dari tahun lalu",
    },
    {
      value: 25,
      label: "Kota Tersedia",
      prefix: "",
      icon: <FaChartLine className="h-8 w-8 text-yellow-500" />,
      growth: "3 kota baru",
    },
  ];

  const features = [
    {
      title: "Fitur Unggulan",
      icon: <FaTrophy className="h-5 w-5" />,
      items: [
        {
          name: "Virtual Tour 360°",
          description: "Jelajahi kost secara virtual sebelum berkunjung",
          icon: "🏠",
          highlight: "Teknologi AR/VR",
        },
        {
          name: "Booking Instan",
          description: "Pesan kost langsung tanpa perlu menunggu",
          icon: "⚡",
          highlight: "Konfirmasi < 5 menit",
        },
        {
          name: "Pembayaran Aman",
          description: "Transaksi aman dengan midtrans dan cash",
          icon: "🔒",
          highlight: "100% Aman",
        },
      ],
    },
    {
      title: "Keuntungan",
      icon: <FaStar className="h-5 w-5" />,
      items: [
        {
          name: "Cashback",
          description: "Dapatkan cashback untuk setiap transaksi",
          icon: "💰",
          highlight: "Hingga 10%",
        },
        {
          name: "Diskon Bulanan",
          description: "Hemat lebih banyak dengan diskon khusus",
          icon: "🏷️",
          highlight: "Diskon 25%",
        },
        {
          name: "Program Referral",
          description: "Ajak teman dan dapatkan bonus",
          icon: "🤝",
          highlight: "Bonus 100rb",
        },
      ],
    },
    {
      title: "Layanan",
      icon: <FaBullseye className="h-5 w-5" />,
      items: [
        {
          name: "Bantuan 24/7",
          description: "Tim support siap membantu kapanpun",
          icon: "📞",
          highlight: "Response < 1 jam",
        },
        {
          name: "Jaminan Harga",
          description: "Dapatkan harga terbaik untuk kost pilihan",
          icon: "✨",
          highlight: "Best Price",
        },
        {
          name: "Maintenance",
          description: "Layanan perawatan kost berkala",
          icon: "🛠️",
          highlight: "Gratis",
        },
      ],
    },
  ];

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [inView, controls]);

  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div ref={ref} className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {statistics.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl"
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-yellow-50" />
              <div className="relative">
                {stat.icon}
                <div className="mt-4 flex items-center justify-center text-3xl font-bold text-gray-800">
                  {stat.prefix}
                  <CountUp end={stat.value} duration={2.5} separator="," />
                  {stat.suffix}
                </div>
                <div className="mt-2 text-center text-gray-600">
                  {stat.label}
                </div>
                <div className="mt-2 text-center text-sm text-yellow-500">
                  {stat.growth}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Tabs */}
        <Tab.Group onChange={setSelectedTab}>
          <Tab.List className="mb-8 flex space-x-4 rounded-xl bg-white p-2 shadow-lg">
            {features.map((category, idx) => (
              <Tab
                key={idx}
                className={({ selected }) =>
                  `flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-300 ${
                    selected
                      ? "scale-105 transform bg-yellow-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-600"
                  }`
                }
              >
                {category.icon}
                {category.title}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            <AnimatePresence mode="wait">
              {features.map((category, idx) => (
                <Tab.Panel key={idx} static>
                  {selectedTab === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 gap-6 md:grid-cols-3"
                    >
                      {category.items.map((item, itemIdx) => (
                        <motion.div
                          key={itemIdx}
                          variants={cardVariants}
                          whileHover="hover"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: itemIdx * 0.1 }}
                          onHoverStart={() => setHoveredCard(itemIdx)}
                          onHoverEnd={() => setHoveredCard(null)}
                          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg"
                        >
                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-50 opacity-50 transition-transform group-hover:scale-150" />
                          <div className="relative">
                            <div className="mb-4 text-4xl">{item.icon}</div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-800">
                              {item.name}
                            </h3>
                            <p className="text-gray-600">{item.description}</p>
                            <div className="mt-4">
                              <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                                {item.highlight}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </Tab.Panel>
              ))}
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500 to-yellow-600 p-12 text-center shadow-xl"
        >
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-yellow-400 opacity-20" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-yellow-400 opacity-20" />
          <div className="relative">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Siap Memulai Pencarian Kost Impianmu?
            </h2>
            <Link to={"/search"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-yellow-500 shadow-md transition-all hover:shadow-xl"
              >
                Mulai Sekarang
                <FaArrowAltCircleUp className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
