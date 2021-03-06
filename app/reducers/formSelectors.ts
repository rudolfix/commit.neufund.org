import { formValueSelector } from "redux-form";

import config from "../config";
import { myEtherWalletUrl } from "../utils/myetherwallet";
import { parseStrToNumStrict } from "../utils/utils";
import { publicCommitment } from "../web3/contracts/ContractsRepository";
import { IAppState } from "./index";

export const selectMyEtherWallerUrl = (state: IAppState): string => {
  const contractAddress = config.contractsDeployed.commitmentContractAddress;
  let value = parseStrToNumStrict(formValueSelector("commitFunds")(state, "ethAmount"));
  if (isNaN(value)) {
    value = 0;
  }

  const gasLimit = config.contractsDeployed.gasLimit;
  const data = publicCommitment.rawWeb3Contract.commit.getData();

  return myEtherWalletUrl(contractAddress, value, gasLimit, data);
};
