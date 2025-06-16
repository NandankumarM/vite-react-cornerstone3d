// Converters.js

/**
 * Compare two instance UIDs by their numerical value.
 * @param {string} a - First UID string to compare.
 * @param {string} b - Second UID string to compare.
 * @returns {number} - Negative, zero, or positive based on comparison.
 */
export const compareInstanceUIDs = (a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aValue = aParts[i] || 0;
        const bValue = bParts[i] || 0;

        if (aValue !== bValue) {
            return aValue - bValue;
        }
    }

    return 0;
};

/**
 * Extract the instance value from a DICOM URL.
 * @param {string} url - The DICOM web URL to extract the instance from.
 * @returns {string|null} - The instance value or null if not found.
 */
export const getInstanceValue = (url) => {
    const parts = url.split("/");
    const instanceIndex = parts.indexOf("instances");
    return instanceIndex !== -1 ? parts[instanceIndex + 1] : null;
};
