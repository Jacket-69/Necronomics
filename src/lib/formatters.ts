const CURRENCY_CONFIG: Record<string, { symbol: string; decimals: number }> = {
  CLP: { symbol: "$", decimals: 0 },
  USD: { symbol: "US$", decimals: 2 },
  EUR: { symbol: "\u20AC", decimals: 2 }, // Euro sign
  JPY: { symbol: "\u00A5", decimals: 0 }, // Yen sign
  CNY: { symbol: "\u00A5", decimals: 2 }, // Yuan sign
};

export const formatCurrency = (minorUnits: number, currencyCode: string): string => {
  const config = CURRENCY_CONFIG[currencyCode] ?? { symbol: "", decimals: 2 };
  const amount = config.decimals === 0 ? minorUnits : minorUnits / Math.pow(10, config.decimals);
  return `${config.symbol}${amount.toLocaleString("es-CL", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
};

export const formatAccountType = (type: string): string => {
  const labels: Record<string, string> = {
    cash: "Efectivo",
    bank: "Banco",
    credit_card: "Tarjeta de credito",
  };
  return labels[type] ?? type;
};

export const toMinorUnits = (amount: number, decimalPlaces: number): number => {
  return Math.round(amount * Math.pow(10, decimalPlaces));
};

export const fromMinorUnits = (minorUnits: number, decimalPlaces: number): number => {
  return decimalPlaces === 0 ? minorUnits : minorUnits / Math.pow(10, decimalPlaces);
};
