import "./App.css";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { useState } from "react";

window.Buffer = Buffer;

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [change, setChange] = useState("");
  const [wallets, setWallets] = useState([]);
  const [balance, setBalance] = useState({});

  const [toWallet, setToWallet] = useState("");

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
    const privateKey = keypair.secretKey;

    const newKeyPair = {
      publicKey,
      privateKey,
    };

    // console.log(newKeyPair);
    // const newKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKey));
    // const derivedPublicKey = newKeypair.publicKey.toBase58();

    // // Verify if the derived public key matches the original public key
    // const isSameKeypair = derivedPublicKey === publicKey;
    // console.log(
    //   "Are the public and private keys from the same keypair?",
    //   isSameKeypair
    // );

    // push ele in array with kepping prev ele in array

    // walletsArr.push(newKeyPair);

    // setWallets((prev) => [...prev, publicKey]);
    // // setWallets([...wallets, keypair]);

    // console.log(walletsArr);

    setWallets((prevWallets) => [...prevWallets, newKeyPair]);

    console.log(wallets);
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

  const copyTextAndSHowMsg = () => {
    if (mnemonic !== "") {
      navigator.clipboard
        .writeText(mnemonic)
        .then(() => {
          // alert("Mnemonic copied to clipboard!");
          // show copied text for 2 seconds on cursor position
          const copied = document.createElement("div");
          copied.style.position = "absolute";

          // it should be absolute to p tag

          copied.style.top = "0";
          copied.style.right = "0";
          copied.style.backgroundColor = "black";
          copied.style.color = "white";
          copied.style.padding = "5px";
          copied.style.fontSize = "10px";
          copied.style.borderRadius = "5px";
          copied.style.zIndex = "999";
          copied.innerText = "copied!";
          document.getElementById("mnemo").appendChild(copied);
          setTimeout(() => {
            copied.remove();
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy mnemonic: ", err);
        });
    }
  };

  const airDrop = async (publicKey) => {
    const connection = new Connection(
      "https://solana-devnet.g.alchemy.com/v2/ADwgZClZhC47WLuGbuf8LLaqVPeJN2py",
      "confirmed"
    );

    try {
      const airDropSignature = await connection.requestAirdrop(
        new PublicKey(publicKey),
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airDropSignature);

      console.log(`Airdropped 1 SOL to ${publicKey}`);

      // const lamportsToSend = 1_000_000;

      // const transferTransaction = new Transaction().add(
      //   SystemProgram.transfer({
      //     fromPubkey: publicKey,
      //     toPubkey: publicKey,
      //     lamports: lamportsToSend,
      //   })
      // );

      // await sendAndConfirmTransaction(connection, transferTransaction, [
      //   // fromKeypair,
      // ]);

      // console.log("Transaction successful");
    } catch (error) {
      if (error.message.includes("429")) {
        console.error("Too many airdrop requests. Please wait 24 hours.");
      } else {
        console.error("An error occurred:", error);
      }
    }
  };

  const transfer = async (from, to) => {
    const fromPrivateKey = from.privateKey;
    const fromPublicKey = new PublicKey(from.publicKey);
    const toPublicKey = new PublicKey(to);

    // convert the fromPrivateKey or fromPublicKey to Keypair
    const fromKeypair = Keypair.fromSecretKey(fromPrivateKey);

    const connection = new Connection(
      "https://solana-devnet.g.alchemy.com/v2/ADwgZClZhC47WLuGbuf8LLaqVPeJN2py",
      "confirmed"
    );

    try {
      const lamportsToSend = 1_000_000;

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: lamportsToSend,
        })
      );

      await sendAndConfirmTransaction(connection, transferTransaction, [
        fromKeypair,
      ]);

      console.log("Transaction successful");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <>
      <div className="App">
        <h1>Web Wallet Solana</h1>
        <p
          id="mnemo"
          style={{
            background: "#f1f1f1",
            position: "relative",
            padding: "20px",
          }}
        >
          {mnemonic ? mnemonic : "Click below button to generate mnemonic"}

          <button
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              fontWeight: "400",
              color: "gray",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={copyTextAndSHowMsg}
          >
            copy
          </button>
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

          <h3>Transaction</h3>
          <p>
            Step 1. Click on the "Get Balance" button to get the balance of the
            wallet
          </p>
          <p>
            Step 2. Click on the "Airdrop" button to airdrop 1 SOL to the wallet
          </p>
          <p>
            Step 3. Click on the "Transfer" button to transfer 0.001 SOL from
            the wallet to itself
          </p>

          <div style={{ padding: "10px 20px" }} className="mul_wallet">
            {wallets.map((wallet, index) => (
              <div key={wallet.publicKey}>
                <div className="display_wallet">
                  <p className="wallet">{wallet.publicKey}</p>
                  <button
                    className="btn Get_Balance"
                    onClick={() => getBalance(wallet.publicKey)}
                  >
                    Get Balance
                  </button>

                  {balance[wallet.publicKey] !== undefined ? (
                    <p className="wallet">{balance[wallet.publicKey]} SOL</p>
                  ) : null}

                  <button
                    className="btn Get_Balance"
                    onClick={() => airDrop(wallet.publicKey)}
                  >
                    Airdrop
                  </button>
                </div>

                <input
                  // style={{ width: "50%" }}
                  type="text"
                  placeholder="Paste any of the wallet address where you want to transfer"
                  onChange={(e) => setToWallet(e.target.value)}
                />
                <button
                  className="btn"
                  onClick={() => transfer(wallet, toWallet)}
                >
                  Transfer
                </button>
                <hr />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
