import * as BigNumber from "bignumber.js";
import * as cn from "classnames";
import * as moment from "moment";
import { Moment } from "moment/moment";
import * as React from "react";
import { Alert, Checkbox, Col, Row } from "react-bootstrap";
import { connect, Dispatch } from "react-redux";

import { loadAftermathDetails } from "../actions/aftermathActions";
import { TokenType } from "../actions/constants";
import { calculateAndFormatFee } from "../agreements/utils";
import * as logo from "../assets/img/myetherwallet_logo.svg";
import { LoadingIndicator } from "../components/LoadingIndicator";
import MoneyComponent from "../components/MoneyComponent";
import { TextCopyable } from "../components/TextCopyable";
import config from "../config";
import { selectLoading, selectUnlockDateEth } from "../reducers/aftermathState";
import { IAppState } from "../reducers/index";
import { myEtherWalletUrl } from "../utils/myetherwallet";
import { etherLock, etherToken, neumark } from "../web3/contracts/ContractsRepository";
import { calculateValueAfterPenalty } from "../web3/utils";
import * as styles from "./Aftermath.scss";

interface IUnlockEtherContainerProps {
  params: { address: string };
  loadAftermathDetails: (address: string) => any;
  isLoading: boolean;
  lockedAmountEth: string;
  neumarkBalance: string;
  neumarkNeededToUnlockEth: string;
  unlockDateEth: Moment;
  penaltyFractionEth: string;
  missingNEUs: string;
  penaltyFee: string;
  willBePenalized: boolean;
  withdrawPossible: boolean;
}

interface IUnlockEtherContainerState {
  agreeToPayFee: boolean;
}

class UnlockEtherContainer extends React.Component<
  IUnlockEtherContainerProps,
  IUnlockEtherContainerState
> {
  constructor(props: IUnlockEtherContainerProps) {
    super(props);
    this.state = {
      agreeToPayFee: false,
    };
  }

  public componentDidMount() {
    this.props.loadAftermathDetails(this.props.params.address);
  }

  public render() {
    if (this.props.isLoading) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        <h1>Unlock your funds</h1>

        <div className={styles.section}>
          <div className={styles.infoBox}>
            <div className={styles.caption}>Your wallet address:</div>
            <div className={styles.value}>
              {this.props.params.address}
            </div>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.caption}>Your NEU balance: </div>
            <div className={styles.value}>
              <MoneyComponent value={this.props.neumarkBalance} tokenType={TokenType.NEU} />
            </div>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.caption}>Locked ETH amount: </div>
            <div className={styles.value}>
              <MoneyComponent value={this.props.lockedAmountEth} tokenType={TokenType.ETHER} />
            </div>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.caption}>ETH can be unlocked without penalty starting on: </div>
            <div className={styles.value}>
              {this.props.unlockDateEth
                ? this.props.unlockDateEth.utc().format("YYYY-MM-DD HH:MM UTC")
                : "-"}
            </div>
          </div>

          <div className={styles.infoBox}>
            <h4>NEU needed to unlock ether funds: </h4>
            <div className={styles.value}>
              <MoneyComponent
                value={this.props.neumarkNeededToUnlockEth}
                tokenType={TokenType.NEU}
              />
            </div>
          </div>
          {this.renderPenaltyBox()}
        </div>
        {this.renderSteps()}
      </div>
    );
  }

  private renderPenaltyBox() {
    if (this.props.willBePenalized) {
      return (
        <div className={styles.infoBox}>
          <div className={styles.caption}>
            Unlock fee distributed back to remaining NEU holders:{" "}
          </div>
          <div className={styles.value}>
            <MoneyComponent
              value={calculateAndFormatFee(
                this.props.penaltyFractionEth,
                this.props.lockedAmountEth
              )}
              tokenType={TokenType.ETHER}
            />
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }

  private renderSteps() {
    const { withdrawPossible, missingNEUs, willBePenalized, penaltyFee } = this.props;

    if (!withdrawPossible) {
      return (
        <div className={styles.section}>
          <Alert bsStyle="danger">
            Please transfer <MoneyComponent value={missingNEUs} tokenType={TokenType.NEU} /> NEU ({missingNEUs}{" "}
            Neu wei) to your wallet address as specified above. Otherwise you will not be able to
            unlock your funds
          </Alert>
        </div>
      );
    }

    return (
      <div className={styles.section}>
        <Alert bsStyle="danger">
          <Checkbox onChange={this.changeAgreeToPayPenalty} checked={this.state.agreeToPayFee}>
            I confirm that by following unlock procedure I agree to return{" "}
            <MoneyComponent
              value={this.props.neumarkNeededToUnlockEth}
              tokenType={TokenType.NEU}
            />{" "}
            {willBePenalized &&
              <span>
                and to pay <MoneyComponent value={penaltyFee} tokenType={TokenType.ETHER} /> unlock
                fee to remaining NEU holders
              </span>}
          </Checkbox>
        </Alert>
        {this.state.agreeToPayFee &&
          <div>
            <h3>Steps to unlock your ether:</h3>
            <div>
              <strong>Step 1</strong>. This transaction unlocks your Ether and burns corresponding
              amount of NEU (calls <em>approveAndCall</em> on <em>Neumark</em> contract)
              <TxInfo
                contractName="Neumark"
                address={neumark.address}
                data={neumark.rawWeb3Contract.approveAndCall.getData(
                  etherLock.address,
                  this.props.neumarkNeededToUnlockEth,
                  ""
                )}
              />
            </div>
            <div className={styles.stepTwo}>
              <strong>Step 2</strong>. Withdraw your funds from Ether Token contract to your wallet
              address (calls <em>withdraw</em> on <em>EtherToken</em> contract):
              <TxInfo
                contractName="Ether Token"
                address={etherToken.address}
                data={etherToken.rawWeb3Contract.withdraw.getData(
                  willBePenalized
                    ? calculateValueAfterPenalty(
                        this.props.lockedAmountEth,
                        this.props.penaltyFractionEth
                      )
                    : this.props.lockedAmountEth
                )}
              />
            </div>
          </div>}
      </div>
    );
  }

  private changeAgreeToPayPenalty = () => {
    this.setState({
      agreeToPayFee: !this.state.agreeToPayFee,
    });
  };
}

function mapStateToProps(state: IAppState) {
  const isLoading = selectLoading(state.aftermathState);

  if (isLoading) {
    return {
      isLoading,
    };
  }

  const unlockDateEth = selectUnlockDateEth(state.aftermathState);
  const lockedAmountEth = state.aftermathState.lockedAmountEth;
  const penaltyFractionEth = state.aftermathState.penaltyFractionEth;

  const neumarkNeededToUnlockAsBI = new BigNumber.BigNumber(state.aftermathState.neumarkBalanceEth);
  const neumarkBalanceAsBI = new BigNumber.BigNumber(state.aftermathState.neumarkBalance);

  const withdrawPossible = neumarkBalanceAsBI.greaterThanOrEqualTo(neumarkNeededToUnlockAsBI);
  const willBePenalized = moment().isBefore(unlockDateEth);

  const missingNEUs = neumarkNeededToUnlockAsBI.sub(neumarkBalanceAsBI).toString();

  const penaltyFee = calculateAndFormatFee(penaltyFractionEth, lockedAmountEth);

  return {
    unlockDateEth,
    withdrawPossible,
    missingNEUs,
    penaltyFee,
    willBePenalized,
    isLoading,
    penaltyFractionEth,
    lockedAmountEth,
    neumarkBalance: state.aftermathState.neumarkBalance,
    neumarkNeededToUnlockEth: state.aftermathState.neumarkBalanceEth,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    loadAftermathDetails: (address: string) => dispatch(loadAftermathDetails(address)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UnlockEtherContainer);

interface ITxInfo {
  contractName: string;
  address: string;
  data: string;
}

const TxInfo: React.SFC<ITxInfo> = ({ contractName, address, data }) =>
  <div className={styles.txInfo}>
    <Row>
      <Col sm={12} md={3}>
        {contractName} contract address:
      </Col>
      <Col xs={12} sm={12} md={9}>
        <TextCopyable text={address} className={styles.monoSpace} />
      </Col>
    </Row>
    <Row>
      <Col sm={12} md={3}>
        Amount To Send (ETH):
      </Col>
      <Col xs={12} sm={12} md={9}>
        <TextCopyable text="0" className={styles.monoSpace} />
      </Col>
    </Row>
    <Row>
      <Col sm={12} md={3}>
        Gas limit:
      </Col>
      <Col xs={12} sm={12} md={9}>
        <TextCopyable
          text={config.contractsDeployed.unlockFundsTxGasLimit.toString()}
          className={styles.monoSpace}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={12} md={3}>
        Data:
      </Col>
      <Col xs={12} sm={12} md={9}>
        <TextCopyable text={data} className={cn(styles.txData, styles.monoSpace)} />
      </Col>
    </Row>
    <Row>
      <Col sm={12} md={3}>
        Open pre-loaded transaction in MyEtherWallet
      </Col>
      <Col xs={12} sm={12} md={9}>
        <a
          className={styles.myEtherWalletLink}
          target="_blank"
          href={myEtherWalletUrl(
            address,
            0,
            config.contractsDeployed.unlockFundsTxGasLimit.toString(),
            data
          )}
        >
          <img className={styles.myEtherWalletLogo} src={logo} />
        </a>
      </Col>
    </Row>
  </div>;
