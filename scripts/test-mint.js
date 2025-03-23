const hre = require("hardhat");

// This script mints additional NFTs using an existing NFT contract
async function main() {
  console.log("Usage: CONTRACT=0xa16E02E87b7454126E5E10d957A927A7F5B5d2be npx hardhat run scripts/test-mint.js --network <network>\n");

  const contractAddress = process.env.CONTRACT;
  console.log(`Using Today contract at: ${contractAddress}`);

  const Today = await hre.ethers.getContractFactory("Today");
  const today = await Today.attach(contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  const mintAmount = 1;
  
  console.log(`Minting ${mintAmount} new NFT(s) to ${deployer.address}...`);
  
  const tx = await today.mint(deployer.address, mintAmount);
  await tx.wait();
  
  console.log("Minting successful!");

  let tokenId = 0;
  try {
    while (true) {
      await today.ownerOf(tokenId);
      tokenId++;
    }
  } catch (error) {
    tokenId--;
  }

  if (tokenId >= 0) {
    console.log(`\nLatest token ID: ${tokenId}`);
    
    const tokenURI = await today.tokenURI(tokenId);
    console.log(`\nToken URI for token ${tokenId}:`);
    
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
      console.log(JSON.parse(decodedData));
    } else {
      console.log(tokenURI);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
