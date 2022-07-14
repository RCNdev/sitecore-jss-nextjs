"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editingDataDiskCache = exports.EditingDataDiskCache = void 0;
// eslint-disable-next-line spaced-comment
/// <reference types="../../global" />
const sync_disk_cache_1 = __importDefault(require("sync-disk-cache"));
const os_1 = __importDefault(require("os"));
/**
 * A disk-based editing data cache implementation (required for hosting on Vercel via Serverless Functions)
 * @see EditingDataCache
 */
class EditingDataDiskCache {
    constructor() {
        // Use gzip compression and store using the OS temp directory (Vercel Serverless Functions have temp directory access)
        this.cache = new sync_disk_cache_1.default('editing-data', { compression: 'gzip', location: os_1.default.tmpdir() });
    }
    set(key, editingData) {
        const filePath = this.cache.set(key, JSON.stringify(editingData));
        if (!filePath || filePath.length === 0) {
            throw new Error(`Editing data cache not set for key ${key} at ${this.cache.root}`);
        }
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry.isCached) {
            console.warn(`Editing data cache miss for key ${key} at ${this.cache.root}`);
            return undefined;
        }
        const data = JSON.parse(entry.value);
        // Remove immediately to preserve disk-space
        this.cache.remove(key);
        return data;
    }
}
exports.EditingDataDiskCache = EditingDataDiskCache;
/** EditingDataDiskCache singleton */
exports.editingDataDiskCache = new EditingDataDiskCache();
