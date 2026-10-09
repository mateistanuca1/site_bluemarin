/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Pozele vechi pot fi folosite direct de pe bluemarin.ro pana le descarci local.
    remotePatterns: [
      { protocol: 'https', hostname: 'www.bluemarin.ro' },
      { protocol: 'https', hostname: 'bluemarin.ro' },
    ],
    formats: ['image/webp'],
  },

  async redirects() {
    // Pastreaza linkurile vechi din Google ca sa nu pierzi trafic.
    return [
      { source: '/cursuri-de-inot-2', destination: '/cursuri-de-inot', permanent: true },
      { source: '/cursuri-de-inot/cursuri-inot-copii', destination: '/cursuri-inot-copii', permanent: true },
      { source: '/cursuri-de-inot/cursuri-inot-adulti', destination: '/cursuri-de-inot', permanent: true },
      { source: '/echipa-de-antrenori', destination: '/echipa', permanent: true },
      { source: '/cursuri-inot-bazin-rapid', destination: '/locatii/bazin-cs-rapid', permanent: true },
      { source: '/cursuri-inot-militari-wellness', destination: '/locatii/militari-wellness', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/tarife-bazin-rapid', destination: '/tarife', permanent: true },
      { source: '/tarife-militari-wellness', destination: '/tarife', permanent: true },
      { source: '/formular-inscriere-rapid', destination: '/inscriere/bazin-cs-rapid', permanent: true },
      { source: '/formular-inscriere-militari-wellness', destination: '/inscriere/militari-wellness', permanent: true },
      { source: '/inscriere_copii', destination: '/inscriere/bazin-cs-rapid', permanent: true },
      { source: '/inscriere_adulti', destination: '/inscriere/bazin-cs-rapid', permanent: true },
      { source: '/wpautoterms/termeni-si-conditii', destination: '/termeni-si-conditii', permanent: true },
      { source: '/wpautoterms/politica-de-confidentialitate', destination: '/politica-de-confidentialitate', permanent: true },
      { source: '/wpautoterms/politica-de-cookie', destination: '/politica-de-cookies', permanent: true },
      { source: '/prima-pagina', destination: '/', permanent: true },
      { source: '/despre-noi', destination: '/', permanent: true },
      { source: '/locatii', destination: '/locatii/bazin-cs-rapid', permanent: true },
    ];
  },
};

export default nextConfig;
