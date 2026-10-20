# PANDUAN DEPLOY KE VERCEL (vercel.app)
## SPARTA RUJENTO - Rutan Kelas IIB Jeneponto

Aplikasi ini telah dikonfigurasi secara lengkap untuk dapat langsung di-deploy ke **Vercel** (`https://nama-aplikasi.vercel.app`) sebagai **Single Page Application (SPA)** berbasis **Vite + React**.

---

### Berkas Konfigurasi yang Tersedia
1. **`vercel.json`**
   - Framework: `vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Rewrites: Meneruskan seluruh URL rute ke `/index.html` (mencegah error 404 saat refresh halaman)
   - Headers: Caching optimal untuk file statis dan aset gambar
2. **`.vercelignore`**
   - Menghindari pengunggahan direktori temporary/cache yang tidak diperlukan saat proses build

---

### Cara 1: Deploy Gratis Lewat Vercel Dashboard & GitHub (Sangat Disarankan)

1. **Upload / Push Kode ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misalnya: `sparta-rujento-edc`).
   - Push seluruh file proyek ini ke repositori tersebut.

2. **Buka Vercel**:
   - Kunjungi [https://vercel.com](https://vercel.com) dan login (disarankan menggunakan akun GitHub yang sama).

3. **Impor Proyek**:
   - Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
   - Pilih repositori GitHub Anda tadi lalu klik **"Import"**.

4. **Konfigurasi Project**:
   - **Framework Preset**: Vercel akan otomatis mendeteksi **Vite**.
   - **Root Directory**: Biarkan `./` (default).
   - **Build and Output Settings**:
     - *Build Command*: `npm run build`
     - *Output Directory*: `dist`
     - *Install Command*: `npm install`
   *(Pengaturan ini sudah otomatis terisi sesuai `vercel.json`).*

5. **Klik Deploy**:
   - Tekan tombol **"Deploy"**.
   - Tunggu sekitar 1 - 2 menit hingga build selesai.
   - Selesai! Aplikasi Anda akan aktif dengan alamat web resmi gratis seperti:
     `https://sparta-rujento.vercel.app`

---

### Cara 2: Deploy Cepat Menggunakan Vercel CLI

Jika Anda menggunakan terminal / command prompt di komputer lokal:

1. Install Vercel CLI (jika belum):
   ```bash
   npm install -g vercel
   ```

2. Login ke akun Vercel:
   ```bash
   vercel login
   ```

3. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel
   ```
   *(Ikuti petunjuk di terminal, tekan Enter untuk menyetujui konfigurasi default).*

4. Untuk deploy langsung ke production:
   ```bash
   vercel --prod
   ```

---

### Catatan Penting
- **Penyimpanan Data**: Aplikasi ini menyimpan konfigurasi lokal di browser (`localStorage`) dan mendukung integrasi real-time dengan **Google Sheets & Google Apps Script**.
- **Domain Kustom**: Di dashboard Vercel, Anda juga dapat menghubungkan domain resmi UPT Anda (misalnya: `edc.rutanjeneponto.id` atau domain kemenkumham) melalui menu *Settings > Domains*.
