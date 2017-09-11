import * as moment from "moment";
import * as React from "react";
import { Col, Row } from "react-bootstrap";

import { Countdown } from "./Countdown";
import { HexagonsStack } from "./HexagonsStack";
import * as styles from "./Incentive.scss";

interface IBeforeIcoComponentProps {
  startDate: moment.Moment;
  onFinish: () => {};
}
interface IIncentive {
  startDate: moment.Moment;
  onFinish: () => {};
}

export const HexagonText: React.SFC<IBeforeIcoComponentProps> = ({ startDate, onFinish }) =>
  <div className={styles.countdown}>
    <div>
      <h3> Commitment Opportunity starts in: </h3>
      <h1>Autumn</h1>
      <Countdown finishDate={startDate} onFinish={onFinish} />
      <h3>Reward starting point:</h3>
      <p>
        {" "}-- NEU / <strong>1</strong> EHT
      </p>
    </div>
  </div>;

export const Incentive: React.SFC<IIncentive> = ({ startDate, onFinish }) =>
  <Row>
    <Col sm={6} className={styles.incentive}>
      <h1>Community-owned Fundraising Platform</h1>

      <p>
        Neufund bridges blockchain and venture capital enabling ICOs for on- and off-chain startups.
      </p>
      <p>
        Reserve funds<sup>
          <a href="#commit">01</a>
        </sup>{" "}
        today for your future investments. Maintain full control of your investment decisions.
      </p>
      <p>
        Get Neumarks<sup>
          <a href="#commit">02</a>
        </sup>{" "}
        just by reserving funds and become a co-owner of the platform.
      </p>
    </Col>
    <Col sm={6} xsHidden>
      <HexagonsStack className={styles.hexagons}>
        <HexagonText startDate={startDate} onFinish={onFinish} />
      </HexagonsStack>
    </Col>
    <Col className="hexagon-mobile" sm={6} smHidden mdHidden lgHidden>
      <HexagonText startDate={startDate} onFinish={onFinish} />
    </Col>
  </Row>;
