# REFERENCE UI — INDONESIA PUNYA MASALAH

## Acuan visual aktif

Mulai 16 September 2026, gambar dashboard yang diberikan pengguna pada percakapan ini ditetapkan sebagai **master visual utama proyek** untuk seluruh permukaan publik.

Acuan tersebut adalah gambar dashboard `a3ddef09-c54f-4bac-8296-c84498e8af41.png` yang diberikan ulang oleh pengguna di percakapan.

## Implementasi v4

Revisi besar v4 menerapkan acuan tersebut langsung pada struktur halaman, bukan hanya melalui override CSS:

- Sidebar navigasi permanen di sebelah kiri.
- Header atas bersih dan ringan pada area konten.
- Pencarian, notifikasi, dan akses akun berada di header kanan.
- Konten utama dimulai di kanan sidebar dan di bawah header.
- Hero memakai kartu landscape besar dengan headline, pencarian, quick category, dan panel Suara Warga.
- Statistik dibuat sebagai kartu ringkas sejajar dengan kartu pelaporan.
- Area tengah memakai komposisi tiga kolom: Jelajahi Indonesia, Peta Indonesia, Masalah Terbaru.
- Area bawah memakai kartu analisis, monitoring, Intelligence, NOW/WHY/THEN/ACTION, Solusi, dan informasi proyek.
- Modul `/portal.html` menggunakan shell visual yang sama agar perpindahan halaman tidak terasa seperti aplikasi berbeda.
- Navigasi bertingkat tetap tersedia pada sidebar, tetapi tidak mengubah struktur visual utama menjadi navbar horizontal.
- Lapisan `public-enhance.js` lama tidak lagi menyuntik sistem UI kedua yang dapat menimpa master layout.

## Prinsip implementasi

Setiap revisi UI publik harus menggunakan gambar acuan ini sebagai **master visual**, lalu menyesuaikan responsif, interaksi, aksesibilitas, dan data produksi tanpa mengubah karakter dasar layout.

Angka atau isi contoh tidak boleh dipresentasikan sebagai data nasional produksi. Sumber produksi, provenance, confidence, dan status verifikasi harus tetap dibedakan secara jelas.
