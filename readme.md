# ☁️ Weather Dashboard - Tugas Akhir Web

Aplikasi pemantau cuaca interaktif yang menyajikan data cuaca *real-time*, prakiraan 5 hari ke depan, dan deteksi lokasi otomatis menggunakan integrasi **Open-Meteo API** dan **OpenStreetMap**.

Proyek ini dibuat untuk memenuhi **Tugas Akhir Praktikum Pemrograman Web Judul 6**.

[**Lihat Live Demo**](https://weatherdash.exyluminate.my.id/)

## ✨ Fitur Utama

Aplikasi ini dirancang dengan pendekatan *Mobile-First* dan kaya akan fitur interaktif:

* **🌍 Smart Geolocation ("Locate Me")** — Mendeteksi lokasi pengguna secara otomatis dan menampilkan nama daerah yang akurat (menggunakan Reverse Geocoding).
* **⭐ Save Favorite Cities** — Menyimpan daftar kota favorit pengguna agar tidak hilang saat halaman di-*refresh* (menggunakan Backend PHP Session).
* **📅 5-Day Forecast** — Menampilkan ramalan cuaca harian lengkap dengan suhu Min/Max dan ikon visual.
* **🔍 Auto-complete Search** — Fitur pencarian cerdas yang memberikan saran nama kota saat pengguna mengetik.
* **🌓 Dark Mode Support** — Tampilan yang nyaman di mata dengan mode Gelap/Terang.
* **🌡️ Unit Conversion** — *Toggle* instan untuk mengubah satuan suhu antara Celsius (°C) dan Fahrenheit (°F).
* **⚡ Real-time Updates** — Data cuaca diperbarui otomatis setiap 5 menit.

---

## 🛠️ Teknologi yang Digunakan

Proyek ini menggabungkan teknologi Frontend modern dengan Backend ringan:

| Teknologi | Penggunaan Utama |
| :--- | :--- |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Struktur semantik halaman. |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Styling responsif dan manajemen tema (*Dark Mode*). |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Logika *Fetch API*, manipulasi DOM, Geolocation, dan interaktivitas. |
| ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white) | *Backend Service* (`api.php`) untuk menangani penyimpanan sesi (*Session*) kota favorit. |
| ![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-orange?style=flat-square) | Penyedia data cuaca gratis dan akurat. |

---

## 🚀 Instalasi & Cara Menjalankan

Karena aplikasi ini menggunakan **PHP Session** untuk fitur "Simpan Favorit", aplikasi **WAJIB** dijalankan menggunakan Web Server Lokal (seperti Laragon atau XAMPP). Aplikasi **tidak bisa** berjalan maksimal jika hanya menggunakan VS Code Live Server.

### Langkah-langkah:

1.  **Siapkan Web Server**
    Pastikan **Laragon** atau **XAMPP** sudah terinstall dan aktif (Apache Started).

2.  **Clone / Copy Project**
    Pindahkan folder proyek `weather-dashboard` ke dalam folder *root* server:
    * **Laragon:** `C:\laragon\www\weather-dashboard`
    * **XAMPP:** `C:\xampp\htdocs\weather-dashboard`

3.  **Jalankan di Browser**
    Buka browser dan akses alamat berikut:
    
    http://localhost/weather-dashboard
    

> **⚠️ Catatan Penting:**
> * Pastikan komputer terhubung ke **Internet** agar *Tailwind CSS* dan *API Cuaca* dapat dimuat.
> * Izinkan akses **Lokasi** pada browser saat diminta untuk menggunakan fitur *"Locate Me"*.

---

## 📦 Struktur File

📂 weather-dashboard
 ┣ 📜 index.html    # Antarmuka Utama (Frontend)
 ┣ 📜 script.js     # Logika Fetch API, Geolocation, & DOM
 ┣ 📜 api.php       # Backend PHP untuk Session Management
 ┣ 📜 style.css     # CSS Tambahan (Scrollbar & Animations)
 ┗ 📜 README.md     # Dokumentasi Proyek