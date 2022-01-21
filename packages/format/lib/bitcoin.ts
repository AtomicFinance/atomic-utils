import BigNumber from 'bignumber.js';

/**
 * Converts satoshis to BTC, rounds to the specified number of decimal places.
 * Throws an error if non-number characters are provided.
 *
 * @param sats
 * @param decimalPlaces
 * @returns
 */
export function toBTC(sats: number | string, decimalPlaces?: number): number {
  const num = new BigNumber(sats).div(1e8);
  if (num.isNaN()) throw new Error('Invalid number provided');

  if (decimalPlaces) {
    return +num.toFixed(decimalPlaces);
  }
  return +num.toFixed(8).replace(/(\.0+|0+)$/, '');
}

/**
 * Converts BTC to satoshis.
 *
 * @param btc
 * @returns
 */
export function toSats(btc: number | string): number {
  const num = new BigNumber(btc);
  if (num.isNaN()) throw new Error('Invalid number provided');

  return num.times(1e8).integerValue().toNumber();
}

/**
 * Rounds a BTC amount to 8 decicmal places.
 * This is useful for formatting amounts affected by floating point errors.
 *
 * @param btc
 * @returns
 */
export function roundBTC(btc: number): number {
  return +btc.toFixed(8).replace(/(\.0+|0+)$/, '');
}
