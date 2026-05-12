import type {NextConfig} from 'next';
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['lucide-react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@opentelemetry/otlp-grpc-exporter-base': false,
        '@opentelemetry/otlp-proto-exporter-base': false,
        '@opentelemetry/otlp-transformer': false,
        '@opentelemetry/exporter-metrics-otlp-http': false,
        '@opentelemetry/exporter-trace-otlp-http': false,
      };
    }
    
    // Suppress protobufjs warnings that clutter the terminal during OTLP usage
    if (!config.ignoreWarnings) config.ignoreWarnings = [];
    config.ignoreWarnings.push(/@protobufjs\/inquire/);

    return config;
  },
};

export default withSerwist(nextConfig);
