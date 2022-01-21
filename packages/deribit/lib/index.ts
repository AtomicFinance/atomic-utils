import { OptionType } from '@node-dlc/core';

export const getStrDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  const day = date.getUTCDate();
  const month = date
    .toLocaleString('default', { month: 'short', timeZone: 'UTC' })
    .toUpperCase()
    .replace('.', '');
  const year = date.toLocaleDateString('pl', {
    year: '2-digit',
    timeZone: 'UTC',
  });

  return `${day}${month}${year}`;
};

type OptionInstrument = {
  expiry: number;
  strikePrice: number;
  type: OptionType;
};

export const composeInstrumentName = ({
  expiry,
  type,
  strikePrice,
}: OptionInstrument): string => {
  const strDate = getStrDate(expiry);
  const typeSymbol = type === 'call' ? 'C' : 'P';
  return `BTC-${strDate}-${strikePrice}-${typeSymbol}`;
};

const EXPIRY_REGEX = /(\d{1,2})([A-Z]+)(\d{1,2})/;
export const parseInstrumentName = (
  instrumentName: string,
): OptionInstrument => {
  try {
    const [, expiryString, _strikePrice, typeSymbol] =
      instrumentName.split('-');
    if (
      !typeSymbol ||
      !EXPIRY_REGEX.test(expiryString) ||
      (typeSymbol !== 'C' && typeSymbol !== 'P')
    ) {
      throw new Error(`Only option instrument names are supported.`);
    }

    const [, day, month, year] = expiryString.match(EXPIRY_REGEX);

    const expiry =
      new Date(`${month}-${day}-${year} 08:00:00 GMT`).getTime() / 1000;
    const strikePrice = parseInt(_strikePrice, 10);
    const type = typeSymbol === 'C' ? 'call' : 'put';

    return {
      expiry,
      strikePrice,
      type,
    };
  } catch (e) {
    throw new Error(`Unsupported instrument name: ${instrumentName}`);
  }
};
