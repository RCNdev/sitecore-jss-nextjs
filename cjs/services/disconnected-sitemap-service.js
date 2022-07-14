"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectedSitemapService = void 0;
class DisconnectedSitemapService {
    /**
     * Provides ability to generate sitemap using manifest.
     * Sitemap can be used for `next export`
     * You can use `sitecore/manifest/sitecore-import.json` as manifest
     * @param {ManifestInstance} manifest manifest instance
     */
    constructor(manifest) {
        this.manifest = manifest;
    }
    /**
     * Generates sitemap which could be used for generation of static pages during `next export` in disconnected mode.
     * Since i18n is not supported, the output paths will not include a `locale` property.
     */
    fetchExportSitemap() {
        const sitemap = [];
        // Path is empty when we start from the root route
        const processRoutes = (routes, path) => {
            routes.forEach((route) => {
                var _a;
                const renderings = (_a = route.layout) === null || _a === void 0 ? void 0 : _a.renderings;
                const routePath = path ? path.concat(route.name) : [''];
                if (renderings && renderings.length) {
                    sitemap.push({
                        params: {
                            path: routePath,
                        },
                    });
                }
                if (route.children) {
                    // If we are in the root route, so next child should not contain paths in array
                    processRoutes(route.children, path ? routePath : []);
                }
            });
        };
        processRoutes(this.manifest.items.routes);
        return sitemap;
    }
}
exports.DisconnectedSitemapService = DisconnectedSitemapService;
