import { startCase } from "lodash";
import { Moment } from "moment";
import * as React from "react";
import { connect, Dispatch } from "react-redux";

import { loadAftermathDetails } from "../actions/aftermathActions";
import { getReservationAgreementTags, getTokenHolderAgreementTags } from "../actions/getTags";
import { DownloadDocumentLink } from "../components/DownloadDocumentLink";
import EtherScanLink from "../components/EtherScanLink";
import { LoadingIndicator } from "../components/LoadingIndicator";
import MoneyComponent from "../components/MoneyComponent";
import {
  selectLoading,
  selectUnlockDateEth,
  selectUnlockDateEur,
} from "../reducers/aftermathState";
import { IAppState } from "../reducers/index";
import {
  selectReservationAgreementHash,
  selectTokenHolderAgreementHash,
} from "../reducers/legalAgreementState";
import { IDictionary } from "../types";

import { Link } from "react-router";
import { EtherScanLinkType, TokenType, tokenTypeToSymbol } from "../actions/constants";
import * as styles from "./Aftermath.scss";

interface IAftermathState {
  isLoading: boolean;
  lockedAmountEth: string;
  neumarkBalanceEth: string;
  unlockDateEth: Moment;
  lockedAmountEur: string;
  neumarkBalanceEur: string;
  unlockDateEur: Moment;
  reservationAgreementHash: string;
  tokenHolderAgreementHash: string;
  neumarkBalance: string;
}

interface IAftermathDispatcher {
  loadAftermathDetails: (address: string) => {};
  getTokenHolderAgreementTags: () => Promise<IDictionary>;
  getReservationAgreementTags: (tokenType: TokenType) => Promise<IDictionary>;
}

interface IAftermathOwnProps {
  address: string;
}

export class CommitKnownUserAftermath extends React.Component<
  IAftermathOwnProps & IAftermathState & IAftermathDispatcher
> {
  public componentDidMount() {
    this.props.loadAftermathDetails(this.props.address);
  }

  public async componentWillReceiveProps(_nextProps: IAftermathOwnProps & IAftermathState) {
    if (this.props.address !== _nextProps.address) {
      this.props.loadAftermathDetails(_nextProps.address);
    }
  }

  public render() {
    const {
      isLoading,
      address,
      lockedAmountEth,
      unlockDateEth,
      neumarkBalanceEth,
      lockedAmountEur,
      unlockDateEur,
      neumarkBalanceEur,
      getTokenHolderAgreementTags,
      getReservationAgreementTags,
      reservationAgreementHash,
      tokenHolderAgreementHash,
      neumarkBalance,
    } = this.props;

    if (isLoading) {
      return (
        <div className={styles.aftermath}>
          <LoadingIndicator />
        </div>
      );
    }

    const showEther = parseFloat(lockedAmountEth) > 0;
    const showEuro = parseFloat(lockedAmountEur) > 0;

    return (
      <div className={styles.aftermath}>
        <div>
          <div className={styles.header}>
            This is a sneak peak of your committed funds in the Neufund ICBM.
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.infoBox}>
            <h4>Your wallet address:</h4>
            <div className={styles.value}>
              {address}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.infoBox}>
            <h4>Your NEU balance: </h4>
            <div className={styles.value}>
              <MoneyComponent value={neumarkBalance} tokenType={TokenType.NEU} />
            </div>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.value}>
              <DownloadDocumentLink
                key="neumark_token_holder_agreement"
                documentHash={tokenHolderAgreementHash}
                getTags={getTokenHolderAgreementTags}
                outputFilename="neumark_token_holder_agreement"
              >
                Token Holder Agreement
              </DownloadDocumentLink>
            </div>
          </div>
        </div>

        {showEther &&
          <CommitmentInfo
            tokenType={TokenType.ETHER}
            lockedAmount={lockedAmountEth}
            neumarkLockedBalance={neumarkBalanceEth}
            unlockDate={unlockDateEth}
            reservationAgreementHash={reservationAgreementHash}
            getReservationAgreementTags={getReservationAgreementTags}
            neumarkBalance={neumarkBalance}
          />}

        {showEuro &&
          <CommitmentInfo
            tokenType={TokenType.EURO}
            lockedAmount={lockedAmountEur}
            neumarkLockedBalance={neumarkBalanceEur}
            unlockDate={unlockDateEur}
            reservationAgreementHash={reservationAgreementHash}
            getReservationAgreementTags={getReservationAgreementTags}
            neumarkBalance={neumarkBalance}
          />}

        <div className={styles.section}>
          <div className={styles.infoBox}>
            <h4>Your transaction history:</h4>
            <div className={styles.value}>
              <EtherScanLink linkType={EtherScanLinkType.ADDRESS} resourceId={address}>
                Go to etherscan to see all transactions with <i>Neufund Crowdsale</i> contract.
              </EtherScanLink>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <UnlockButton address={address} />
        </div>
      </div>
    );
  }
}

interface ICommitmentInfo {
  lockedAmount: string;
  unlockDate: Moment;
  neumarkLockedBalance: string;
  neumarkBalance: string;
  tokenType: TokenType;
  reservationAgreementHash: string;
  getReservationAgreementTags: (tokenType: TokenType) => Promise<IDictionary>;
}

export const CommitmentInfo: React.SFC<ICommitmentInfo> = ({
  lockedAmount,
  unlockDate,
  neumarkLockedBalance,
  tokenType,
  reservationAgreementHash,
  getReservationAgreementTags,
}) =>
  <div className={styles.section}>
    <h4>
      Your {startCase(tokenType.toLowerCase())} funds:
    </h4>
    <div className={styles.infoBox}>
      <div className={styles.caption}>
        Locked {tokenTypeToSymbol(tokenType)} amount
      </div>
      <div className={styles.value}>
        {lockedAmount ? <MoneyComponent tokenType={tokenType} value={lockedAmount} /> : "-"}
      </div>
    </div>
    <div className={styles.infoBox}>
      <div className={styles.caption}>
        {tokenTypeToSymbol(tokenType)} will be unlocked on
      </div>
      <div className={styles.value}>
        {unlockDate ? unlockDate.format("YYYY-MM-DD") : "-"}
      </div>
    </div>
    <div className={styles.infoBox}>
      <div className={styles.caption}>NEU needed to unlock your funds:</div>
      <div className={styles.value}>
        {neumarkLockedBalance
          ? <MoneyComponent tokenType={TokenType.NEU} value={neumarkLockedBalance} />
          : "-"}
      </div>
    </div>
    <div className={styles.infoBox}>
      <div className={styles.value}>
        <DownloadDocumentLink
          key="reservation_agreement"
          documentHash={reservationAgreementHash}
          getTags={() => getReservationAgreementTags(tokenType)}
          outputFilename="reservation_agreement"
        >
          Reservation Agreement
        </DownloadDocumentLink>
      </div>
    </div>
  </div>;

interface IUnlockButton {
  address: string;
}

export const UnlockButton: React.SFC<IUnlockButton> = ({ address }) => {
  return (
    <Link to={`/commit/unlock/${address}`} className="btn btn-primary">
      Unlock funds
    </Link>
  );
};

function mapStateToProps(state: IAppState) {
  return {
    isLoading: selectLoading(state.aftermathState),
    lockedAmountEth: state.aftermathState.lockedAmountEth,
    lockedAmountEur: state.aftermathState.lockedAmountEur,
    neumarkBalanceEth: state.aftermathState.neumarkBalanceEth,
    neumarkBalanceEur: state.aftermathState.neumarkBalanceEur,
    unlockDateEth: selectUnlockDateEth(state.aftermathState),
    unlockDateEur: selectUnlockDateEur(state.aftermathState),
    neumarkBalance: state.aftermathState.neumarkBalance,
    reservationAgreementHash: selectReservationAgreementHash(state.legalAgreementState),
    tokenHolderAgreementHash: selectTokenHolderAgreementHash(state.legalAgreementState),
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    loadAftermathDetails: (address: string) => dispatch(loadAftermathDetails(address)),
    getTokenHolderAgreementTags: () => dispatch(getTokenHolderAgreementTags),
    getReservationAgreementTags: (tokenType: TokenType) =>
      dispatch(getReservationAgreementTags(tokenType)),
  };
}

export default connect<IAftermathState, IAftermathDispatcher, IAftermathOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CommitKnownUserAftermath);
