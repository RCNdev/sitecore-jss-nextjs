"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEditingData = exports.EditingRenderMiddleware = void 0;
const constants_1 = require("next/constants");
const sitecore_jss_1 = require("@sitecore-jss/sitecore-jss");
const editing_data_service_1 = require("../services/editing-data-service");
const editing_data_service_2 = require("../services/editing-data-service");
const utils_1 = require("../utils");
/**
 * Middleware / handler for use in the editing render Next.js API route (e.g. '/api/editing/render')
 * which is required for Sitecore Experience Editor support.
 */
class EditingRenderMiddleware {
    /**
     * @param {EditingRenderMiddlewareConfig} [config] Editing render middleware config
     */
    constructor(config) {
        var _a, _b, _c, _d;
        this.handler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            const { method, query, body, headers } = req;
            sitecore_jss_1.debug.experienceEditor('editing render middleware start: %o', {
                method,
                query,
                headers,
                body,
            });
            if (method !== 'POST') {
                sitecore_jss_1.debug.experienceEditor('invalid method - sent %s expected POST', method);
                res.setHeader('Allow', 'POST');
                return res.status(405).json({
                    html: `<html><body>Invalid request method '${method}'</body></html>`,
                });
            }
            // Validate secret
            const secret = (_e = query[editing_data_service_2.QUERY_PARAM_EDITING_SECRET]) !== null && _e !== void 0 ? _e : body === null || body === void 0 ? void 0 : body.jssEditingSecret;
            if (secret !== utils_1.getJssEditingSecret()) {
                sitecore_jss_1.debug.experienceEditor('invalid editing secret - sent "%s" expected "%s"', secret, utils_1.getJssEditingSecret());
                return res.status(401).json({
                    html: '<html><body>Missing or invalid secret</body></html>',
                });
            }
            try {
                // Extract data from EE payload
                const editingData = extractEditingData(req);
                // Resolve server URL
                const serverUrl = this.resolveServerUrl(req);
                // Stash for use later on (i.e. within getStatic/ServerSideProps).
                // This ultimately gets stored on disk (using our EditingDataDiskCache) for compatibility with Vercel Serverless Functions.
                // Note we can't set this directly in setPreviewData since it's stored as a cookie (2KB limit)
                // https://nextjs.org/docs/advanced-features/preview-mode#previewdata-size-limits)
                const previewData = yield this.editingDataService.setEditingData(editingData, serverUrl);
                // Enable Next.js Preview Mode, passing our preview data (i.e. editingData cache key)
                res.setPreviewData(previewData);
                // Grab the Next.js preview cookies to send on to the render request
                const cookies = res.getHeader('Set-Cookie');
                // Make actual render request for page route, passing on preview cookies.
                // Note timestamp effectively disables caching the request in Axios (no amount of cache headers seemed to do it)
                const requestUrl = this.resolvePageUrl(serverUrl, editingData.path);
                sitecore_jss_1.debug.experienceEditor('fetching page route for %s', editingData.path);
                const pageRes = yield this.dataFetcher.get(`${requestUrl}?timestamp=${Date.now()}`, {
                    headers: {
                        Cookie: cookies.join(';'),
                    },
                });
                let html = pageRes.data;
                if (!html || html.length === 0) {
                    throw new Error(`Failed to render html for ${requestUrl}`);
                }
                // replace phkey attribute with key attribute so that newly added renderings
                // show correct placeholders, so save and refresh won't be needed after adding each rendering
                html = html.replace(new RegExp('phkey', 'g'), 'key');
                // When SSG, Next will attempt to perform a router.replace on the client-side to inject the query string parms
                // to the router state. See https://github.com/vercel/next.js/blob/v10.0.3/packages/next/client/index.tsx#L169.
                // However, this doesn't really work since at this point we're in the editor and the location.search has nothing
                // to do with the Next route/page we've rendered. Beyond the extraneous request, this can result in a 404 with
                // certain route configurations (e.g. multiple catch-all routes).
                // The following line will trick it into thinking we're SSR, thus avoiding any router.replace.
                html = html.replace(constants_1.STATIC_PROPS_ID, constants_1.SERVER_PROPS_ID);
                const body = { html };
                // Return expected JSON result
                sitecore_jss_1.debug.experienceEditor('editing render middleware end: %o', { status: 200, body });
                res.status(200).json(body);
            }
            catch (error) {
                console.error(error);
                if (error.response || error.request) {
                    // Axios error, which could mean the server or page URL isn't quite right, so provide a more helpful hint
                    console.info(
                    // eslint-disable-next-line quotes
                    "Hint: for non-standard server or Next.js route configurations, you may need to override the 'resolveServerUrl' or 'resolvePageUrl' available on the 'EditingRenderMiddleware' config.");
                }
                res.status(500).json({
                    html: `<html><body>${error}</body></html>`,
                });
            }
        });
        /**
         * Default page URL resolution.
         * @param {string} serverUrl
         * @param {string} itemPath
         */
        this.defaultResolvePageUrl = (serverUrl, itemPath) => {
            return `${serverUrl}${itemPath}`;
        };
        /**
         * Default server URL resolution.
         * Note we use https protocol on Vercel due to serverless function architecture.
         * In all other scenarios, including localhost (with or without a proxy e.g. ngrok)
         * and within a nodejs container, http protocol should be used.
         *
         * For information about the VERCEL environment variable, see
         * https://vercel.com/docs/environment-variables#system-environment-variables
         * @param {NextApiRequest} req
         */
        this.defaultResolveServerUrl = (req) => {
            return `${process.env.VERCEL ? 'https' : 'http'}://${req.headers.host}`;
        };
        this.editingDataService = (_a = config === null || config === void 0 ? void 0 : config.editingDataService) !== null && _a !== void 0 ? _a : editing_data_service_1.editingDataService;
        this.dataFetcher =
            (_b = config === null || config === void 0 ? void 0 : config.dataFetcher) !== null && _b !== void 0 ? _b : new sitecore_jss_1.AxiosDataFetcher({ debugger: sitecore_jss_1.debug.experienceEditor });
        this.resolvePageUrl = (_c = config === null || config === void 0 ? void 0 : config.resolvePageUrl) !== null && _c !== void 0 ? _c : this.defaultResolvePageUrl;
        this.resolveServerUrl = (_d = config === null || config === void 0 ? void 0 : config.resolveServerUrl) !== null && _d !== void 0 ? _d : this.defaultResolveServerUrl;
    }
    /**
     * Gets the Next.js API route handler
     * @returns route handler
     */
    getHandler() {
        return this.handler;
    }
}
exports.EditingRenderMiddleware = EditingRenderMiddleware;
/**
 * @param {NextApiRequest} req
 */
function extractEditingData(req) {
    // The Experience Editor will send the following body data structure,
    // though we're only concerned with the "args".
    // {
    //   id: 'JSS app name',
    //   args: ['path', 'serialized layout data object', 'serialized viewbag object'],
    //   functionName: 'renderView',
    //   moduleName: 'server.bundle'
    // }
    // The 'serialized viewbag object' structure:
    // {
    //   language: 'language',
    //   dictionary: 'key-value representation of tokens and their corresponding translations',
    //   httpContext: 'serialized request data'
    // }
    var _a;
    // Note req.body _should_ have already been parsed as JSON at this point (via Next.js `bodyParser` API middleware)
    const payload = req.body;
    if (!payload || !payload.args || !Array.isArray(payload.args) || payload.args.length < 3) {
        throw new Error('Unable to extract editing data from request. Ensure `bodyParser` middleware is enabled on your Next.js API route.');
    }
    const layoutData = JSON.parse(payload.args[1]);
    const viewBag = JSON.parse(payload.args[2]);
    // Keep backwards compatibility in case people use an older JSS version that doesn't send the path in the context
    const path = (_a = layoutData.sitecore.context.itemPath) !== null && _a !== void 0 ? _a : viewBag.httpContext.request.path;
    return {
        path,
        layoutData,
        language: viewBag.language,
        dictionary: viewBag.dictionary,
    };
}
exports.extractEditingData = extractEditingData;
