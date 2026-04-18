// Indian Number System formatter
export const formatINR = (num) => {
  if (num === undefined || num === null) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  // Indian grouping: last 3 digits, then groups of 2
  const parts = abs.toFixed(2).split('.');
  let intPart = parts[0];
  const dec = parts[1];
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = grouped + ',' + last3;
  }
  return `${sign}₹${intPart}.${dec}`;
};

export const formatINRShort = (num) => {
  if (!num) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
};
