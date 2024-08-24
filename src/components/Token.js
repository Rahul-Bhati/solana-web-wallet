import React, { useEffect } from "react";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

const Token = () => {
  useEffect(() => {
    async function TokenGen() {
      try {
        const pubKey = new PublicKey(
          "Ajkkona22hnTBepa4WwCY9LFTih3nFRJYT8nafHRTbP4"
        );

        // Generate a new keypair for the payer
        const payer = Keypair.generate();

        // Airdrop SOL to the payer to cover transaction fees
        const connection = new Connection(
          "https://solana-devnet.g.alchemy.com/v2/ADwgZClZhC47WLuGbuf8LLaqVPeJN2py",
          "confirmed"
        );

        console.log(payer.publicKey);

        const airdropSignature = await connection.requestAirdrop(
          payer.publicKey,
          2 * LAMPORTS_PER_SOL // Airdrop 2 SOL to ensure enough balance
        );

        await connection.confirmTransaction(airdropSignature);

        // Create the mint
        const mint = await createMint(
          connection,
          payer,
          pubKey,
          pubKey,
          9 // We are using 9 to match the CLI decimal default exactly
        );

        console.log(`Mint Address: ${mint.toBase58()}`);
      } catch (error) {
        console.error("Error creating token:", error);
      }
    }

    TokenGen();
  }, []);

  return <div>Token Component</div>;
};

export default Token;
