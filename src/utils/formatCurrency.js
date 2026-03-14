/**
 * Format number as Indonesian Rupiah currency
 * @param {number} value - The amount to format
 * @returns {string} - Formatted currency string (e.g., "Rp 189.000")
 */
export const formatRupiah = (value) => {
  if (!value || isNaN(value)) return "Rp 0";
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format large amounts with M, K suffixes
 * @param {number} value - The amount to format
 * @returns {string} - Formatted currency with suffix (e.g., "Rp 1.2M")
 */
export const formatRupiahShort = (value) => {
  if (!value || isNaN(value)) return "Rp 0";
  
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `Rp ${Math.floor(value)}`;
};
