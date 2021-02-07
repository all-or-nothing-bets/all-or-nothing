import React from "react";
import { formatUnits } from "@ethersproject/units";
import { useContractReader } from "eth-hooks";
// import { useTokenBalance } from "eth-hooks";

export default function ConditionalTokenBalance(props) {
  // const [dollarMode, setDollarMode] = useState(true);

  const collateral = props.contracts && props.contracts[props.collateral];
  const conditional = props.contracts && props.contracts[props.conditional];
  const { address } = props;
  const conditionId = useContractReader(props.contracts, "CTVendor", "conditionId");

  // const balance = useTokenBalance(tokenContract, props.address, 1777);

  console.log("collateralToken", collateral);
  console.log("conditionalToken", conditional);
  console.log("address", address);
  // console.log("conditionId", conditionId);

  let floatBalance = parseFloat("0.00");

  // let usingBalance = balance;

  // if (typeof props.balance !== "undefined") {
  // usingBalance = props.balance;
  // }

  // if (usingBalance) {
  // const etherBalance = format(usingBalance);
  // parseFloat(etherBalance).toFixed(2);
  // floatBalance = parseFloat(etherBalance);
  // }

  const displayBalance = floatBalance.toFixed(4);

  // if (props.dollarMultiplier && dollarMode) {
  //   displayBalance = "$" + (floatBalance * props.dollarMultiplier).toFixed(2);
  // }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: 24,
        padding: 8,
        cursor: "pointer",
      }}
      // onClick={() => {
      //   setDollarMode(!dollarMode);
      // }}
    >
      foo
      {/* {props.img} {displayBalance} */}
    </span>
  );
}
