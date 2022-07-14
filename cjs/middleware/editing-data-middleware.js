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
exports.EditingDataMiddleware = void 0;
const editing_data_cache_1 = require("./editing-data-cache");
const editing_data_1 = require("../sharedTypes/editing-data");
const editing_data_service_1 = require("../services/editing-data-service");
const utils_1 = require("../utils");
/**
 * Middleware / handler for use in the editing data Next.js API dynamic route (e.g. '/api/editing/data/[key]')
 * which is required for Sitecore Experience Editor support.
 */
class EditingDataMiddleware {
    /**
     * @param {EditingDataMiddlewareConfig} [config] Editing data middleware config
     */
    constructor(config) {
        var _a, _b;
        this.handler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { method, query, body } = req;
            const secret = query[editing_data_service_1.QUERY_PARAM_EDITING_SECRET];
            const key = query[this.queryParamKey];
            // Validate secret
            if (secret !== utils_1.getJssEditingSecret()) {
                return res.status(401).end('Missing or invalid secret');
            }
            switch (method) {
                case 'GET': {
                    // Get cache value
                    const data = this.editingDataCache.get(key);
                    res.status(200).json(data);
                    break;
                }
                case 'PUT': {
                    if (!editing_data_1.isEditingData(body)) {
                        res.status(400).end('Missing or invalid editing data');
                    }
                    else {
                        // Set cache value
                        this.editingDataCache.set(key, body);
                        res.status(200).end();
                    }
                    break;
                }
                default: {
                    res.setHeader('Allow', ['GET', 'PUT']);
                    res.status(405).end(`Method ${method} Not Allowed`);
                }
            }
        });
        this.queryParamKey = (_a = config === null || config === void 0 ? void 0 : config.dynamicRouteKey) !== null && _a !== void 0 ? _a : 'key';
        this.editingDataCache = (_b = config === null || config === void 0 ? void 0 : config.editingDataCache) !== null && _b !== void 0 ? _b : editing_data_cache_1.editingDataDiskCache;
    }
    /**
     * Gets the Next.js API route handler
     * @returns route handler
     */
    getHandler() {
        return this.handler;
    }
}
exports.EditingDataMiddleware = EditingDataMiddleware;
