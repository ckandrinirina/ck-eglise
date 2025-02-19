/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: undefined, // Disable built-in i18n routing as we're using middleware
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
