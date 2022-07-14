/**
 * @param {EditingData} data
 */
export function isEditingData(data) {
    return (data.path !== undefined &&
        data.language !== undefined &&
        data.layoutData !== undefined &&
        data.dictionary !== undefined);
}
