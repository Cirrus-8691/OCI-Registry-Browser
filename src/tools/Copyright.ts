/**
 * Change version in 
 *  - OCI-RegistryBrowser/package.json
 */
const version = process.env.NEXT_PUBLIC_VERSION; // see package.json for Deployed version PRDO/DEV

const Copyright = {
    logo: "📚",
    name: "OCI-Registry browser",
    title: "Registry browser",
    version,
    author: "Cirrus-8691",
    copyright: `©️ Cirrus-8691🐗 2025 v${version}`,
    github: "https://github.com/Cirrus-8691",
}
export default Copyright;