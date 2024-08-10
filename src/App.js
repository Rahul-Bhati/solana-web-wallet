import "./App.css";
import * as bip39 from "bip39";
import { HDKey } from 'micro-ed25519-hdkey';
import { Keypair } from '@solana/web3.js';
import { Buffer } from "buffer";
import { useState } from "react";

window.Buffer = Buffer;

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [change, setChange] = useState("");
  const [wallets, setWallets] = useState([]);

  const generateMne = () => {
    setMnemonic(bip39.generateMnemonic());
  };

  const genMultipleWallet = () => {
    const seed = bip39.mnemonicToSeedSync(change, "rahulbhati");
    const hd = HDKey.fromMasterSeed(seed.toString("hex"));
    // for (let i = 0; i < 10; i++) {
      const path = `m/44'/501'/${wallets.length}'/0'`;
      const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
      const publicKey = keypair.publicKey.toBase58();

      console.log(publicKey);
      setWallets([...wallets, publicKey]);

  }

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
          {mnemonic? mnemonic : "Click below button to generate mnemonic"}
        </p>
        <button onClick={generateMne} className="btn">
          generateMnemonic
        </button>
        <br />
        <div className="mul-wallet">
          <h3>Multiple Wallet Generation</h3>
          <p>Step 1. Use the button above to generate a mnemonic</p>
          <p>Step 2. Copy the mnemonic and paste it in the input field below</p>
          <input type="text" placeholder="Paste mnemonic here" onChange={(e) => setChange(e.target.value)}/>
          <button className="btn" onClick={genMultipleWallet}>Generate Wallets</button>
          <div>
            {wallets.map((wallet, index) => (
              <div key={index}>
                <p className="wallet">{wallet}</p>
              </div>
            ))}
          </div>
        </div>
       </div>
    </>
  );
}
// add styles to pre tag as a

export default App;
