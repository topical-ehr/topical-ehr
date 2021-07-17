const withPreact = require('next-plugin-preact');
module.exports = withPreact({
    async rewrites() {
        return [
            // proxy /fhir/ to the FHIR server
            {
                source: '/fhir/:path*',
                destination: 'http://localhost:8080/fhir/:path*',
            },
        ];
    },
});