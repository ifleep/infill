import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next.js sizes its static-generation worker pool off os.cpus().length,
    // which on shared/VPS hosting (Hostinger included) often reports the
    // host machine's full core count rather than what this container
    // actually gets — 47 here, in one observed build. Each worker is a
    // separate process running its own PrismaClient with its own MariaDB
    // connection pool (see src/lib/db.ts), so a large worker count times a
    // handful of connections per pool can blow straight through a shared
    // MySQL plan's connection limit mid-build, surfacing as a confusing
    // EPIPE from Prisma on whichever page happened to be rendering (e.g.
    // /sitemap.xml) rather than a clear "too many connections" error.
    // Capped here rather than left to auto-detection.
    cpus: 2,
  },
};

export default nextConfig;
