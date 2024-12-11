import React from "react";
import ibuKostKuning from "../assets/ibukostkuning.jpg";
import homesvg from "../assets/house-with-money-symbol-svgrepo-com.svg";
import "../styles/section.css";

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-header">
          <h2>
            Tentang <span>KostHunt</span>
          </h2>
          <div className="header-line"></div>
        </div>

        <div className="about-info">
          <div className="about-img">
            <img src={ibuKostKuning} alt="ibukost" />
            <div className="img-overlay"></div>
          </div>

          <div className="about-content">
            <div className="content-wrapper">
              <h3>Apa itu KostHunt?</h3>
              <p>
                KostHunt adalah sebuah aplikasi yang dikembangkan untuk
                memudahkan orang-orang yang ingin mencari kost di Indonesia.
                Aplikasi ini bisa digunakan oleh semua orang, baik yang ingin
                mencari kost atau yang ingin menemukan kost, serta orang yang
                sedang menjual kost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
