// scripts/deploy.ts
import { network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
    const [deployer] = await ethers.getSigners();
    const vusd = process.env.HEDERA_VUSD_EVM_ADDRESS!;
    if (!/^0x[0-9a-fA-F]{40}$/.test(vusd)) throw new Error("Bad vUSD address");

    console.log("Deployer:", deployer.address);
    console.log("vUSD:", vusd);

    const VoltEscrow = await ethers.getContractFactory("VoltEscrow", deployer);

    // 👇 no constructor args
    const contract = await VoltEscrow.deploy();
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log("✅ VoltEscrow deployed at:", addr);

    // initialize token post-deploy
    const tx = await contract.updateVusdToken(vusd);
    await tx.wait();
    console.log("✅ vusdToken set to:", await contract.vusdToken());
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});