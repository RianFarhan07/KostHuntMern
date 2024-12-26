import React, { useState } from "react";
import "../styles/section.css";
import { FaMapPin } from "react-icons/fa";

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
    setStatus(""); // Reset status saat proses dimulai

    const scriptURL =
      "https://script.google.com/macros/s/AKfycbypOC1sRDFEWih_lnYXa6TqhXyHH-vMsA1Zq6FJUxR3BfdBNfAWNn4NOG5YSMgUtDzYNg/exec";
    const form = new FormData();

    Object.keys(formData).forEach((key) => form.append(key, formData[key]));

    try {
      const response = await fetch(scriptURL, { method: "POST", body: form });
      if (response.ok) {
        setStatus("Pesan berhasil dikirim!");
        setFormData({ nama: "", email: "", pesan: "" });
      } else {
        throw new Error("Gagal mengirim pesan.");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-header">
          <h2>
            Hubungi <span>Kami</span>
          </h2>
          <div className="header-line"></div>
        </div>

        <div className="contact-wrapper">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nama">Nama</label>
              <input
                type="text"
                id="nama"
                value={formData.nama}
                onChange={handleChange}
                aria-label="Nama"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pesan">Pesan</label>
              <textarea
                id="pesan"
                rows="5"
                value={formData.pesan}
                onChange={handleChange}
                aria-label="Pesan"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Mengirim..." : "Kirim Pesan"}
            </button>
            {status && <p className="form-status">{status}</p>}
          </form>

          <div className="contact-info">
            <div className="info-item">
              <FaMapPin />
              <h3>Alamat</h3>
              <p>Desa Siddo Kab Barru</p>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3528.1744149577494!2d119.62279587497652!3d-4.2377171957361535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d95906ab81869db%3A0xbdb867d18d33b203!2sRezki%20Ayra!5e1!3m2!1sid!2sid!4v1731311675001!5m2!1sid!2sid"
                width="100%"
                height="450"
                className="map-iframe"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

// AKfycbypOC1sRDFEWih_lnYXa6TqhXyHH-vMsA1Zq6FJUxR3BfdBNfAWNn4NOG5YSMgUtDzYNg
// https://script.google.com/macros/s/AKfycbypOC1sRDFEWih_lnYXa6TqhXyHH-vMsA1Zq6FJUxR3BfdBNfAWNn4NOG5YSMgUtDzYNg/exec
