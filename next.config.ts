import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.64"], // или ['*'] чтобы разрешить все
  // остальные твои настройки...
};

export default nextConfig;