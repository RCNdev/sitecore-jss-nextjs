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
exports.editingDataService = exports.EditingDataService = exports.QUERY_PARAM_EDITING_SECRET = void 0;
const sitecore_jss_1 = require("@sitecore-jss/sitecore-jss");
const utils_1 = require("../utils");
exports.QUERY_PARAM_EDITING_SECRET = 'secret';
/**
 * Service responsible for maintaining Sitecore Experience Editor data between requests
 */
class EditingDataService {
    /**
     * @param {EditingDataServiceConfig} [config] Editing data service config
     */
    constructor(config) {
        var _a, _b;
        this.apiRoute = (_a = config === null || config === void 0 ? void 0 : config.apiRoute) !== null && _a !== void 0 ? _a : '/api/editing/data/[key]';
        if (!this.apiRoute.includes('[key]')) {
            throw new Error(`The specified apiRoute '${this.apiRoute}' is missing '[key]'.`);
        }
        this.dataFetcher =
            (_b = config === null || config === void 0 ? void 0 : config.dataFetcher) !== null && _b !== void 0 ? _b : new sitecore_jss_1.AxiosDataFetcher({ debugger: sitecore_jss_1.debug.experienceEditor });
    }
    /**
     * Stores Experience Editor payload data for later retrieval by key
     * @param {EditingData} data Editing data
     * @param {string} serverUrl The server url to use for subsequent data API requests
     * @returns {Promise} The {@link EditingPreviewData} containing the generated key and serverUrl to use for retrieval
     */
    setEditingData(data, serverUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(data);
            const url = this.getUrl(serverUrl, key);
            const previewData = {
                key,
                serverUrl,
            };
            sitecore_jss_1.debug.experienceEditor('storing editing data for %o: %o', previewData, data);
            return this.dataFetcher.put(url, data).then(() => {
                return previewData;
            });
        });
    }
    /**
     * Retrieves Experience Editor payload data by key
     * @param {PreviewData} previewData Editing preview data containing the key and serverUrl to use for retrieval
     * @returns {Promise} The {@link EditingData}
     */
    getEditingData(previewData) {
        return __awaiter(this, void 0, void 0, function* () {
            const editingPreviewData = previewData;
            if (!(editingPreviewData === null || editingPreviewData === void 0 ? void 0 : editingPreviewData.serverUrl)) {
                return undefined;
            }
            const url = this.getUrl(editingPreviewData.serverUrl, editingPreviewData.key);
            sitecore_jss_1.debug.experienceEditor('fetching editing data for %o', previewData);
            return this.dataFetcher.get(url).then((response) => {
                return response.data;
            });
        });
    }
    generateKey(data) {
        var _a;
        // Need more than just the item GUID since requests are made "live" during editing in EE.
        // The suffix code will produce a random 10 character alpha-numeric (a-z 0-9) sequence, which is URI-safe.
        // Example generated key: 52961eea-bafd-5287-a532-a72e36bd8a36-qkb4e3fv5x
        const suffix = Math.random()
            .toString(36)
            .substring(2, 12);
        return `${(_a = data.layoutData.sitecore.route) === null || _a === void 0 ? void 0 : _a.itemId}-${suffix}`;
    }
    getUrl(serverUrl, key) {
        var _a;
        // Example URL format:
        //  http://localhost:3000/api/editing/data/52961eea-bafd-5287-a532-a72e36bd8a36-qkb4e3fv5x?secret=1234secret
        const apiRoute = (_a = this.apiRoute) === null || _a === void 0 ? void 0 : _a.replace('[key]', key);
        const url = new URL(apiRoute, serverUrl);
        url.searchParams.append(exports.QUERY_PARAM_EDITING_SECRET, utils_1.getJssEditingSecret());
        return url.toString();
    }
}
exports.EditingDataService = EditingDataService;
/** EditingDataService singleton (with default values) */
exports.editingDataService = new EditingDataService();
