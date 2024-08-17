import "./App.css";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { useState } from "react";

window.Buffer = Buffer;

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [change, setChange] = useState("");
  const [wallets, setWallets] = useState([]);
  const [balance, setBalance] = useState({});

  const generateMne = () => {
    setMnemonic(bip39.generateMnemonic());
  };

  const genMultipleWallet = () => {
    if (change === "") {
      alert("Please enter the mnemonic");
      return;
    }
    const seed = bip39.mnemonicToSeedSync(change, "rahulbhati");
    const hd = HDKey.fromMasterSeed(seed.toString("hex"));
    // for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${wallets.length}'/0'`;
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
    const publicKey = keypair.publicKey.toBase58();

    // console.log(publicKey);
    setWallets([...wallets, publicKey]);
  };

  const getBalance = async (walletAddress) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    async function getBalance() {
      try {
        // Get the balance in lamports
        const balance = await connection.getBalance(
          new PublicKey(walletAddress)
        );

        // Convert balance from lamports to SOL
        const balanceInSOL = balance / LAMPORTS_PER_SOL;

        // Display the balance
        console.log(
          `Balance of wallet ${walletAddress} is: ${balanceInSOL} SOL`
        );

        // set balcne associate withh wallet address
        setBalance((prev) => ({ ...prev, [walletAddress]: balanceInSOL }));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
    getBalance();
  };

  return (
    <>
      <div className="App">
        <h1>Web Wallet Solana</h1>
        <p
          id="mnemo"
          style={{ background: "#f1f1f1", cursor: "pointer" }}
          onClick={() => {
            if (mnemonic !== "") {
              navigator.clipboard
                .writeText(mnemonic)
                .then(() => {
                  alert("Mnemonic copied to clipboard!");
                })
                .catch((err) => {
                  console.error("Failed to copy mnemonic: ", err);
                });
            }
          }}
        >
          {mnemonic ? mnemonic : "Click below button to generate mnemonic"}
        </p>
        <button onClick={generateMne} className="btn">
          generateMnemonic
        </button>
        <br />
        <div className="mul-wallet">
          <h3>Multiple Wallet Generation</h3>
          <p>Step 1. Use the button above to generate a mnemonic</p>
          <p>Step 2. Copy the mnemonic and paste it in the input field below</p>
          <input
            type="text"
            placeholder="Paste mnemonic here"
            onChange={(e) => setChange(e.target.value)}
          />
          <button className="btn" onClick={genMultipleWallet}>
            Generate Wallets
          </button>
          <div>
            {wallets.map((wallet, index) => (
              <div key={wallet}>
                <div className="display_wallet">
                  <p className="wallet">{wallet}</p>
                  <button
                    className="btn Get_Balance"
                    onClick={() => getBalance(wallet)}
                  >
                    Get Balance
                  </button>
                  {balance[wallet] !== undefined ? (
                    <p className="wallet">{balance[wallet]} SOL</p>
                  ) : null}
                </div>
                <hr />
              </div>
            ))}
            {/* {wallets.map((wallet, index) => (
              <div key={wallet} className="display_wallet">
                <p className="wallet">{wallet}</p>
                <button className="btn" onClick={getBalance}>
                  Balance
                </button>
                {balance ? <p className="wallet">Balance {balance}</p> : null}
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
