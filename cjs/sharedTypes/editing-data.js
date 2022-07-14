"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEditingData = void 0;
/**
 * @param {EditingData} data
 */
function isEditingData(data) {
    return (data.path !== undefined &&
        data.language !== undefined &&
        data.layoutData !== undefined &&
        data.dictionary !== undefined);
}
exports.isEditingData = isEditingData;
