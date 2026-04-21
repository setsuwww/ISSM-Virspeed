/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./_components/**/*.{js,jsx,ts,tsx}",
    "./_constants/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
};

export default config;
/**
Bukankah saya sudah meminta untuk memunculkan sebuah modal agar memunculkan notif saat user memencet tombol checkout
kalau sebelum jam kerja dan shiftnya belum selesai itu tidak bisa, dan demi UX juga, tampilkan modal yang ada text
"Shift anda belum berakhir, ingin pulang awal dan urgent? ajukan Pulang awal", jadi di konfirmasi dulu, dia early checkout / iseng, kalo iseng kan ada modal bisa cancel, kalo serius pulang awal ada modal tinggal ajukan dan acc, simpel,
lalu mana CheckoutTimer UI di employee, ko tidak di UInya, padahal saya sudah checkin
*/
