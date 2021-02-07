/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
import { Divider } from "antd";
import { Address, Balance, TokenBalance, ConditionalTokenBalance } from "../components";
import { formatEther } from "@ethersproject/units";

export default function AllOrNothing({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  readContracts,
}) {
  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>All or Nothing</h1>
        <h2>You</h2>
        Address:
        <Address value={address} ensProvider={mainnetProvider} fontSize={16} />
        <br />
        ETH balance: {yourLocalBalance ? formatEther(yourLocalBalance) : "..."}
        <Balance address={address} provider={localProvider} dollarMultiplier={price} />
        <br />
        BankBucks tokens:
        <TokenBalance contracts={readContracts} name="BankBucks" address={address} provider={mainnetProvider} />
        <Divider />
        <h2>CT Vendor</h2>
        Address:
        <Address
          value={readContracts ? readContracts.CTVendor.address : readContracts}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <br />
        BankBucks tokens:
        <TokenBalance
          contracts={readContracts}
          name="BankBucks"
          address={readContracts ? readContracts.CTVendor.address : readContracts}
          provider={mainnetProvider}
        />
        Conditional tokens:
        <ConditionalTokenBalance
          contracts={readContracts}
          collateral="BankBucks"
          conditional="ConditionalTokens"
          address={readContracts ? readContracts.CTVendor.address : readContracts}
          provider={mainnetProvider}
        />
        <br />
        <Divider />
        <h2>ConditionalTokens</h2>
        Address:
        <Address
          value={readContracts ? readContracts.ConditionalTokens.address : readContracts}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <br />
        BankBucks tokens:
        <TokenBalance
          contracts={readContracts}
          name="BankBucks"
          address={readContracts ? readContracts.ConditionalTokens.address : readContracts}
          provider={mainnetProvider}
        />
      </div>
    </div>
  );
}
