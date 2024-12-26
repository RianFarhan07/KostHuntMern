import React from "react";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdOutlineWorkOutline } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>KostHunt</h3>
          <p>Temukan kost impianmu dengan mudah dan cepat bersama KostHunt.</p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/rianfarhan/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="h-8 w-8" />
            </a>

            <a
              href="https://www.facebook.com/Rian.Mallanti/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="h-8 w-8" />
            </a>
            <a
              href="https://github.com/RianFarhan07"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className="h-8 w-8" />
            </a>
            <a
              href="https://www.linkedin.com/in/baso-rian-farhan-82bb73245"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="h-8 w-8" />
            </a>
            <a
              href="https://rian-portofolio.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdOutlineWorkOutline className="h-8 w-8" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Link Cepat</h3>
          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">Tentang Kami</a>
            </li>
            <li>
              <a href="#kost">Kost</a>
            </li>
            <li>
              <a href="#contact">Kontak</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Hubungi Kami</h3>
          <p>
            <i data-feather="map-pin"></i> Siddo, Kec. Soppeng Riaja, Kabupaten
            Barru, Sulawesi Selatan
          </p>
          <p>
            <i data-feather="phone"></i> +62 822 8037 2670
          </p>
          <p>
            <i data-feather="mail"></i> rian.mallanti@gmail.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 KostHunt. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
