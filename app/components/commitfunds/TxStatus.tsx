import { FontIcon } from "material-ui";
import * as React from "react";
import { Alert } from "react-bootstrap";
import { connect } from "react-redux";
import { Link } from "react-router";

import { EtherScanLinkType } from "../../actions/constants";
import { watchTxBeingMined } from "../../actions/submitFunds";
import { IAppState } from "../../reducers/index";
import EtherScanLink from "../EtherScanLink";
import { LoadingIndicator } from "../LoadingIndicator";
import { CommitHeaderComponent } from "./CommitHeaderComponent";
import * as styles from "./TxStatus.scss";

interface ITxMiningComponent {
  params: { txHash: string };
  isMined: boolean;
  currentBlockNumber: number;
  address: string;
  error: string;
  watchTx: () => any;
}

const iconStyles = {
  width: "64px",
  height: "64px",
  fontSize: "64px",
  color: "#c0cc12",
};

export class TxStatusComponent extends React.Component<ITxMiningComponent> {
  public componentDidMount() {
    this.props.watchTx();
  }

  public render() {
    const { txHash } = this.props.params;
    const { isMined, currentBlockNumber, address, error } = this.props;
    return (
      <div>
        <CommitHeaderComponent number="03" title="Your transaction status" />

        <p>
          The transaction
          <EtherScanLink
            linkType={EtherScanLinkType.TRANSACTION}
            resourceId={txHash}
            className={styles.tx}
          />
          is {isMined ? "ready." : "being mined."}
        </p>

        <div>
          <div>
            Current block number:{" "}
            {currentBlockNumber
              ? <EtherScanLink linkType={EtherScanLinkType.BLOCK} resourceId={currentBlockNumber} />
              : " - "}
          </div>

          <div>
            Is the transaction confirmed?{" "}
            <b>
              {isMined
                ? <span className={styles.yes}>Yes</span>
                : <span className={styles.no}>No</span>}
            </b>
          </div>

          {isMined
            ? <p className={styles.text}>Yay, your transaction was mined.</p>
            : <p className={styles.text}>This might take a while, please wait.</p>}
        </div>
        {error
          ? <div className={styles.error}>
              <Alert bsStyle="danger">
                <h4>Error occured!</h4>
                <p>
                  {error}
                </p>
              </Alert>
              <Link to={"/commit"} className="btn btn-primary btn-link">
                Go back to start
              </Link>
            </div>
          : <div className={styles.confirmedIndicator}>
              {isMined
                ? <FontIcon className="material-icons" style={iconStyles}>
                    done
                  </FontIcon>
                : <LoadingIndicator />}
            </div>}

        {isMined &&
          <Link
            to={`/commit/status/${address}`}
            className="btn btn-primary btn-link pull-right"
            data-test-id="aftermath-link"
          >
            See your commitment
          </Link>}
      </div>
    );
  }
}

export const TxStatus = connect(
  (state: IAppState) => ({
    currentBlockNumber: state.transactionState.blockCurrent,
    isMined: state.transactionState.txConfirmed,
    error: state.transactionState.error,
    address: state.userState.address,
  }),
  (dispatcher, ownProps: any) => ({
    watchTx: () => dispatcher(watchTxBeingMined(ownProps.params.txHash)),
  })
)(TxStatusComponent);
