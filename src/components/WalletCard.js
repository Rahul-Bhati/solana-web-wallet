import React from "react";
import { useState } from "react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

const WalletCard = ({ pubKey, prvKey }) => {
  const [balance, setBalance] = useState(0);

  const getBalance = async (walletAddress) => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      // Get the balance in lamports
      const balance = await connection.getBalance(new PublicKey(walletAddress));

      // Convert balance from lamports to SOL
      const balanceInSOL = balance / LAMPORTS_PER_SOL;

      // Display the balance
      console.log(
        `Balance of wallet ${walletAddress} is: ${balanceInSOL} SOL`,
        typeof balanceInSOL
      );

      // set balcne associate withh wallet address
      setBalance(balanceInSOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="key">
            Public <input type="text" value={pubKey} readOnly />
          </div>
          <div className="key">
            Secret <input type="text" value={prvKey} readOnly />
          </div>
          <div className="key">
            <span>
              Balance <input type="text" value={`${balance} SOL`} readOnly />
            </span>
            <button onClick={() => getBalance(pubKey)}>Get Balance</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletCard;
