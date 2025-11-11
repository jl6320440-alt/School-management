export function formatCurrency(value: number | string, decimals = 0) {
  const n = Number(value) || 0;
  return `₵${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
