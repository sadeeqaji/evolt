import { network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
    const ESCROW = "0x803A0eF8ef6732d281A90901a3C9B5fb21ee84C1";
    const VUSD = process.env.HEDERA_VUSD_EVM_ADDRESS!; // 0x...6b4457

    const [owner] = await ethers.getSigners();
    const VoltEscrow = await ethers.getContractFactory("VoltEscrow", owner);
    const escrow = VoltEscrow.attach(ESCROW);

    console.log("Associating escrow with vUSD…");
    const tx = await escrow.associateWithToken(VUSD);
    await tx.wait();
    console.log("✅ Associated");
}

main().catch((e) => { console.error(e); process.exit(1); });