// eslint-disable-next-line spaced-comment
/// <reference types="../../global" />
import Cache from 'sync-disk-cache';
import os from 'os';
/**
 * A disk-based editing data cache implementation (required for hosting on Vercel via Serverless Functions)
 * @see EditingDataCache
 */
export class EditingDataDiskCache {
    constructor() {
        // Use gzip compression and store using the OS temp directory (Vercel Serverless Functions have temp directory access)
        this.cache = new Cache('editing-data', { compression: 'gzip', location: os.tmpdir() });
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
/** EditingDataDiskCache singleton */
export const editingDataDiskCache = new EditingDataDiskCache();
