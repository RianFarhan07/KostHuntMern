import ibuKostKuning from "../assets/ibukostkuning.jpg";
import "../styles/section.css";

import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";
import { FiSearch, FiUsers } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: <FaHome className="h-8 w-8" />,
      title: "Temukan Kost Impian",
      description: "Berbagai pilihan kost yang sesuai dengan kebutuhan Anda",
    },
    {
      icon: <FiSearch className="h-8 w-8" />,
      title: "Pencarian Mudah",
      description: "Fitur pencarian lengkap dengan filter lokasi dan harga",
    },
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: "Komunitas Terpercaya",
      description: "Review dan ulasan dari penghuni kost sebelumnya",
    },
  ];

  return (
    <section
      id="about"
      className="about bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="about-header"
        >
          <h2 className="text-4xl font-bold text-gray-800">
            Tentang <span className="text-yellow-500">KostHunt</span>
          </h2>
          <div className="header-line mt-4 bg-yellow-500"></div>
        </motion.div>

        <div className="about-info mt-16 flex flex-col gap-12 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={ibuKostKuning}
                alt="ibukost"
                className="h-[400px] w-full transform object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:w-1/2"
          >
            <div className="content-wrapper">
              <h3 className="mb-4 text-3xl font-bold text-gray-800">
                Apa itu KostHunt?
              </h3>
              <p className="mb-8 leading-relaxed text-gray-600">
                KostHunt adalah platform inovatif yang menghubungkan pencari
                kost dengan pemilik kost di seluruh Indonesia. Dengan teknologi
                modern dan antarmuka yang mudah digunakan, kami memastikan
                pengalaman mencari kost menjadi lebih efisien dan menyenangkan.
              </p>

              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.2 }}
                    className="flex items-start gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="text-yellow-500">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link to={"/features"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-white transition-colors hover:bg-yellow-600"
                >
                  Pelajari Lebih Lanjut
                  <BsArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
