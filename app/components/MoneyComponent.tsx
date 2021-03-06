import { BigNumber } from "bignumber.js";
import * as React from "react";
import { Textfit } from "react-textfit";

import { connect } from "react-redux";
import { TokenType, tokenTypeToSymbol } from "../actions/constants";
import { formatMoney } from "../agreements/utils";
import { IAppState } from "../reducers/index";

interface IMoneyComponentProps {
  decimals: number;
}

interface IMoneyComponentOwnProps {
  tokenType: TokenType;
  value: BigNumber | string;
  containerClass?: string;
  valueClass?: string;
  currencyClass?: string;
  fit?: boolean;
  separateThousands?: boolean;
  decimalPlaces?: number;
}

const MoneyComponent: React.SFC<IMoneyComponentProps & IMoneyComponentOwnProps> = ({
  value,
  decimals,
  tokenType,
  containerClass,
  valueClass,
  currencyClass,
  fit,
  decimalPlaces,
  separateThousands,
  ...props,
}) => {
  if (!decimals) {
    throw new Error("Couldnt get TOKEN details!");
  }

  let formattedValue = formatMoney(decimals, value, decimalPlaces);
  if (separateThousands) {
    formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  let valueComponent;
  if (fit) {
    valueComponent = (
      <Textfit mode="single" max={18} className={valueClass}>
        {formattedValue}
      </Textfit>
    );
  } else {
    valueComponent = (
      <span className={valueClass}>
        {formattedValue}
      </span>
    );
  }

  return (
    <span className={containerClass} {...props}>
      {valueComponent} <span className={currencyClass}>{tokenTypeToSymbol(tokenType)}</span>
    </span>
  );
};

MoneyComponent.defaultProps = {
  decimalPlaces: 4,
};

function tokenTypeToDecimals(token: TokenType, state: IAppState): number {
  switch (token) {
    case TokenType.ETHER:
      return state.commitmentState.ethDecimals;
    case TokenType.EURO:
      return state.commitmentState.euroDecimals;
    case TokenType.NEU:
      return state.commitmentState.neuDecimals;
    default:
      throw new Error(`Token ${token} not supported`);
  }
}

export default connect<
  IMoneyComponentProps,
  {},
  IMoneyComponentOwnProps
>((state: IAppState, ownProps) => {
  return {
    decimals: tokenTypeToDecimals(ownProps.tokenType, state),
  };
}, {})(MoneyComponent);
