import { OptionType } from '@node-dlc/core';

/**
 * Composes a Deribit formatted datestring for a given date.
 *
 * @param date Date or timestamp in seconds
 * @returns deribit formatted datestring (e.g. '14MAY22')
 */
export const getStrDate = (date: number | Date): string => {
  if (typeof date === 'number') date = new Date(date * 1000);

  const day = date.getUTCDate();
  const month = date
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    .toUpperCase()
    .replace('.', '');
  const year = date.toLocaleDateString('pl', {
    year: '2-digit',
    timeZone: 'UTC',
  });

  return `${day}${month}${year}`;
};

/**
 * An object returned by parseInstrumentName,
 * which contains the expiry, strike price, and option type.
 *
 * @param expiry - expiry date
 * @param strikePrice - strike price
 * @param type - option type (call or put)
 */
type OptionInstrument = {
  expiry: Date;
  strikePrice: number;
  type: OptionType;
};

export const composeInstrumentName = ({
  expiry,
  type,
  strikePrice,
}: OptionInstrument): string => {
  const strDate = getStrDate(expiry.getTime() / 1000);
  const typeSymbol = type === 'call' ? 'C' : 'P';
  return `BTC-${strDate}-${strikePrice}-${typeSymbol}`;
};

const EXPIRY_REGEX = /(\d{1,2})([A-Z]+)(\d{1,2})/;

/**
 * Parses an instrument name into its expiry, strike price, and option type.
 *
 * @param instrumentName e.g. BTC-1JAN19-120000-C
 */
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

    const expiry = new Date(`${month}-${day}-${year} 08:00:00 GMT`);
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
