import { motion } from "framer-motion";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdOutlineWorkOutline } from "react-icons/md";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const socialIconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    hover: {
      scale: 1.2,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="footer-content">
        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3
            variants={itemVariants}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            KostHunt
          </motion.h3>
          <motion.p variants={itemVariants}>
            Temukan kost impianmu dengan mudah dan cepat bersama KostHunt.
          </motion.p>
          <motion.div className="social-links" variants={itemVariants}>
            {[
              {
                icon: <FaInstagram className="h-8 w-8" />,
                url: "https://www.instagram.com/rianfarhan/",
              },
              {
                icon: <FaFacebook className="h-8 w-8" />,
                url: "https://www.facebook.com/Rian.Mallanti/",
              },
              {
                icon: <FaGithub className="h-8 w-8" />,
                url: "https://github.com/RianFarhan07",
              },
              {
                icon: <FaLinkedin className="h-8 w-8" />,
                url: "https://www.linkedin.com/in/baso-rian-farhan-82bb73245",
              },
              {
                icon: <MdOutlineWorkOutline className="h-8 w-8" />,
                url: "https://rian-portofolio.xyz/",
              },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={socialIconVariants}
                whileHover="hover"
                custom={index}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3 variants={itemVariants}>Link Cepat</motion.h3>
          <motion.ul variants={itemVariants}>
            {["home", "about", "kost", "contact"].map((item) => (
              <motion.li
                key={item}
                variants={itemVariants}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <a href={`#${item}`}>
                  {item === "home"
                    ? "Home"
                    : item === "about"
                      ? "Tentang Kami"
                      : item === "kost"
                        ? "Kost"
                        : "Kontak"}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div className="footer-section" variants={itemVariants}>
          <motion.h3 variants={itemVariants}>Hubungi Kami</motion.h3>
          <motion.p variants={itemVariants} whileHover={{ x: 5 }}>
            <i data-feather="map-pin"></i> Siddo, Kec. Soppeng Riaja, Kabupaten
            Barru, Sulawesi Selatan
          </motion.p>
          <motion.p variants={itemVariants} whileHover={{ x: 5 }}>
            <i data-feather="phone"></i> +62 822 8037 2670
          </motion.p>
          <motion.p variants={itemVariants} whileHover={{ x: 5 }}>
            <i data-feather="mail"></i> rian.mallanti@gmail.com
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="footer-bottom"
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p>&copy; 2024 KostHunt. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
