import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.mux.com"
            },
            {
                protocol: "https",
                hostname: "utfs.io"
            },
            {
                protocol: "https",
                hostname: "mc7hhfe90b.ufs.sh"
            }
        ]
    }
};

export default nextConfig;