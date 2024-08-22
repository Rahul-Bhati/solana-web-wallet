import React, { useState, useEffect } from "react";
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
import WalletCard from "./components/WalletCard";

window.Buffer = Buffer;

function App() {
  const [view, setView] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState([]);
  const [pubKeyForAirdrop, setPubKeyForAirdrop] = useState("");
  const [fromPrivateKey, setFromPrivateKey] = useState("");
  const [toPublicKey, setToPublicKey] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const generateMne = () => {
    setMnemonic(bip39.generateMnemonic());
  };

  const genMultipleWallet = () => {
    if (mnemonic === "") {
      alert("Please enter the mnemonic");
      return;
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic, "rahulbhati");
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

    setWallets((prevWallets) => [...prevWallets, newKeyPair]);
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
    } catch (error) {
      if (error.message.includes("429")) {
        console.error("Too many airdrop requests. Please wait 24 hours.");
      } else {
        console.error("An error occurred:", error);
      }
    }
  };

  const transfer = async (from, to) => {
    // convert the fromPrivateKey or fromPublicKey to Keypair
    const fromPrivateKey = new Uint8Array(Buffer.from(from, "base64"));
    const fromKeypair = Keypair.fromSecretKey(fromPrivateKey);

    const toPublicKey = new PublicKey(to);

    const connection = new Connection(
      "https://solana-devnet.g.alchemy.com/v2/ADwgZClZhC47WLuGbuf8LLaqVPeJN2py",
      "confirmed"
    );

    try {
      const lamportsToSend = 500_000_000; // 1 SOL = 1_000_000_000 lamports

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: lamportsToSend,
        })
      );

      await sendAndConfirmTransaction(connection, transferTransaction, [
        fromKeypair,
      ]);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const toggleView = () => {
    setView(!view);
  };

  useEffect(() => {
    const inputs = document.querySelectorAll(".phrase-input");
    inputs.forEach((input) => {
      input.type = view ? "text" : "password";
    });
  }, [view]);

  return (
    <>
      <div className="App">
        <div className="container">
          <h1>Web Wallet Solana</h1>
          <div className="phrase-container">
            <h2>Recovery Phrase</h2>
            <div className="phrase-inputs">
              {mnemonic === ""
                ? Array.from({ length: 12 }, (_, i) => (
                    <input
                      key={i}
                      type="password"
                      className="phrase-input"
                      readOnly
                    />
                  ))
                : mnemonic
                    .split(" ")
                    .map((word, i) => (
                      <input
                        key={i}
                        type="password"
                        className="phrase-input"
                        readOnly
                        value={word}
                      />
                    ))}
            </div>
            <div className="btn-1">
              <button id="mnemonics" onClick={generateMne}>
                Generate Mnemonics
              </button>
              <button id="toggleView" onClick={toggleView}>
                {view ? "Hide" : "Show"}
              </button>
            </div>
            <div className="btn-1">
              <button id="create_wallet" onClick={genMultipleWallet}>
                Create Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card-2">
        <div className="card">
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <h2>Airdrop</h2>
          <div className="airdrop-inputs">
            <input
              type="text"
              id="airdropInput"
              placeholder="Enter public key"
              value={pubKeyForAirdrop}
              onChange={(e) => setPubKeyForAirdrop(e.target.value)}
            />
            <button
              id="airdropButton"
              onClick={() => airDrop(pubKeyForAirdrop)}
            >
              Airdrop 1 SOL
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Transfer SOL</h2>
          <div className="card-body">
            <div className="key">
              <span>From PrivateKey</span>
              <input
                type="text"
                placeholder="Enter PrivateKey"
                value={fromPrivateKey}
                onChange={(e) => setFromPrivateKey(e.target.value)}
              />
            </div>
            <div className="key">
              <span>To PublicKey</span>
              <input
                type="text"
                placeholder="Enter Public key "
                value={toPublicKey}
                onChange={(e) => setToPublicKey(e.target.value)}
              />
            </div>
            <button onClick={() => transfer(fromPrivateKey, toPublicKey)}>
              Transfer
            </button>
          </div>
        </div>
      </div>
      {wallets.length > 0 && (
        <>
          <h2 className="heading2">Wallets</h2>
          <div className="mul-wallet">
            {wallets.map((wallet, index) => (
              <WalletCard
                key={index}
                pubKey={wallet.publicKey}
                prvKey={Buffer.from(wallet.privateKey).toString("base64")}
              />
            ))}
          </div>
        </>
      )}

      <div className="footer">
        <p>Developed by Rahul Bhati</p>
        {/* social links */}
        <div className="social-links">
          <a
            href="https://www.linkedin.com/in/rahul-bhati-2b4a7b1a1/"
            target="_blank"
            rel="noreferrer"
          >
            <i class="fa fa-linkedin"></i>
          </a>
          <a
            href="https://www.github.com/rahulbhati"
            target="_blank"
            rel="noreferrer"
          >
            <i class="fa fa-github"></i>
          </a>
          <a
            href="https://www.twitter.com/rahulbhati"
            target="_blank"
            rel="noreferrer"
          >
            <i class="fa fa-twitter"></i>
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
