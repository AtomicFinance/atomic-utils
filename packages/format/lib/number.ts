/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param num
 * @param places
 * @returns
 */
export const round = (num: number, places = 0): number =>
  Math.round((num + Number.EPSILON) * Math.pow(10, places)) /
  Math.pow(10, places);
