// https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy#without-nonces
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src * blob: data:;
    font-src 'self';
    object-src 'none';
    frame-src 'none';
    base-uri 'self';
    connect-src 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

module.exports = {
  output: "standalone",
  assetPrefix: '/oci-browser',
  basePath: '/oci-browser',

  // No CSP on http:localhost
  
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: cspHeader.replace(/\n/g, ''),
  //         },
  //       ],
  //     },
  //   ]
  // },
}
/*
output: "standalone",
see
https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
RUN WITH:

cd .next/standalone
node server.js

*/