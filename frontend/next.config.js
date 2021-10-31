module.exports = {
    webpack(config, options) {
        const { isServer } = options;
        config.module.rules.push({
            test: /\.(ogg|mp3|wav|mpe?g)$/i,
            exclude: config.exclude,
            use: [
                {
                    loader: require.resolve("url-loader"),
                    options: {
                        limit: config.inlineImageLimit,
                        fallback: require.resolve("file-loader"),
                        publicPath: `${config.assetPrefix}/_next/static/images/`,
                        outputPath: `${isServer ? "../" : ""}static/images/`,
                        name: "[name]-[hash].[ext]",
                        esModule: config.esModule || false,
                    },
                },
            ],
        });

        return config;
    },
    publicRuntimeConfig: {
        // If DOMAIN starts with http, use it directly, otherwise add https
        SITE_ORIGIN: process.env.DOMAIN
            ? process.env.DOMAIN.startsWith('http')
                ? process.env.DOMAIN
                : `https://${process.env.DOMAIN}`
            : `http://localhost:${process.env.PORT || 3000}`
    },
};
