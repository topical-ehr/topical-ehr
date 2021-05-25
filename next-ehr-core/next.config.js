module.exports = {
    async rewrites() {
        return [
            // proxy /fhir/ to the FHIR server
            {
                source: '/fhir/:path*',
                destination: 'http://localhost:8080/fhir/:path*',
            },
        ];
    },
}