import { BigNumber } from "bignumber.js";
import { isString } from "lodash";
import * as moment from "moment";
import * as replaceString from "replace-string";
import { IDictionary } from "../types";
import { Q18 } from "../web3/utils";

// bignumber.toString() can return something like 1.5e+27
export function bignumberToString(bignumberString: string) {
  const parts = bignumberString.split("e+");
  // no scientific notation, just return it
  if (parts.length === 1) {
    return bignumberString;
  }
  const first = parts[0].replace(".", "");
  const zeroes = parseInt(parts[1], 10) - (first.length - 1);

  return first + "0".repeat(zeroes);
}

export function formatMoney(
  decimals: number,
  moneyInULP: BigNumber | string,
  decimalPlaces: number = 4
) {
  const money: BigNumber = isString(moneyInULP) ? new BigNumber(moneyInULP) : moneyInULP;
  const moneyInPrimaryBase = money.div(new BigNumber(10).pow(decimals));
  return moneyInPrimaryBase.toFixed(decimalPlaces, BigNumber.ROUND_HALF_UP);
}

export function formatDate(dateAsBigNumber: BigNumber) {
  // we can't use here instanceof because it can be created by different constructor
  // we cant do this if code is minified
  if (process.env.NODE_ENV === "development" && dateAsBigNumber.constructor.name !== "BigNumber") {
    throw new Error("Date has to be bignumber instance!");
  }

  const date = moment.unix(dateAsBigNumber.toNumber());
  return formatMomentDate(date);
}

export function formatMomentDate(date: moment.Moment) {
  if (!(date instanceof moment)) {
    throw new Error("Date has to be momentjs instance!");
  }

  return date.format("YYYY-MM-DD hh:mm UTC");
}

// expects fraction in ulps
export function formatFraction(fraction: BigNumber) {
  return bignumberToString(fraction.div(Q18).mul(100).toFixed(4));
}

export function calculateAndFormatRatio(neumarks: string, tokens: string): string {
  return tokens === "0" ? "0" : new BigNumber(neumarks).div(new BigNumber(tokens)).toFixed(3);
}

// returns wei
export function calculateAndFormatFee(penaltyFraction: string, amount: string): string {
  return new BigNumber(penaltyFraction)
    .mul(new BigNumber(amount))
    .div(new BigNumber(10).pow(18))
    .toString();
}

export function replaceTags(text: string, tags: IDictionary): string {
  let outputText = text;
  Object.keys(tags).forEach(tag => {
    outputText = replaceString(outputText, `{${tag}}`, tags[tag]);
  });

  return outputText;
}
