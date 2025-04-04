// import { tree } from 'next/dist/build/templates/app-page';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",   
    images: {
        unoptimized: true,
    },
    reactStrictMode: false,
};

export default nextConfig;
