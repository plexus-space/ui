/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@plexusui/earth',
    '@plexusui/mars',
    '@plexusui/mercury',
    '@plexusui/venus',
    '@plexusui/moon',
    '@plexusui/jupiter',
    '@plexusui/saturn',
    '@plexusui/uranus',
    '@plexusui/neptune',
  ],
}

export default nextConfig
