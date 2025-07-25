const hre = require("hardhat");

async function main() {
  console.log("Deploying Factory contract...");

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`Factory deployed to: ${factoryAddress}`);

  const [deployer] = await hre.ethers.getSigners();
  const mintAmount = 10;
  const owner = deployer.address;
  const imageUrl = "data:image/webp;base64,UklGRnQPAABXRUJQVlA4WAoAAAAgAAAAHwMAVwIASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgghg0AABCbAJ0BKiADWAI+bTabSaQjIqEglSgogA2JaW7hd2Eb7Cf+n9on91/rv4udr54x9os479ffx39i/cD+zfPj9874+AF+Qfyz/JflpwXQAPzj+5f6nwUtSzwF/rfcA/kP9B/z3GYUAP5N/WP+H/bvX3/3P8553/zL/E/9b3Cv5n/Yv+3/fPa19gH7mexH+qv//A5IlXmtr6dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp0329wuHK1K4FIQ6M9ZKyxCzJ+6ad8wCjFDlqvP0uoc2spV/BAakJuVECbCjKfp1gZI2PDa3/Hax4CR3vnr8Oahe7gdVLBQpUMO9g2IJu6u7a3tod38j+i4SmyRqjz+n1Dhw4cOHDhw4b89dDd5I+jyHbsH9hLYPpmvIFA/IEjfQN/SMEJn7SEcGriRwOnfDxDuS9yHBi3XDq/EHz5arF6ggba0Nrc9MBr27mWC8WO1aVoIpJbetmson+ui8EXfGmzPyjRFOE/9vDZGhJ9sdcP8NJPA4R5X06dOnTp06dOnTp0cws5iQmnbqBQP76IBjuD6vqyJMCBEy/+eFk5VAUafJU/+xauyc6z8JmzqqJFEQUwQ8iAtlInAdV4ypFn3hGlPZrY9B6pPZxNTAY5YIc2WCApyWXIGd9GyQmsHIPOvxjGqbGz0+ocOHDhw4cOHDhw4cOLlbfBUMNXmtr6dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTp06dOnTpvgAA/v/rAAAAAAAAAAAAAAAAAAAAAAAAAAAAACGOm6Nxt5yOll/GlCJ6I5W6H6VixV9U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";

  console.log(`\nDeploying a test Today contract with:`);
  console.log(`- Mint Amount: ${mintAmount}`);
  console.log(`- Owner: ${owner}`);

  try {
    const beforeCount = await factory.getContractsCount();
    
    const tx = await factory.deploy(
      mintAmount,
      owner,
      "",         // name
      [imageUrl], // imageUrls
      "",         // textColor
      "",         // backgroundColor
      "",         // contractURI
      ""          // bannerImage
    );
    await tx.wait();
    
    const afterCount = await factory.getContractsCount();
    console.log(`\n contracts: ${afterCount} (was ${beforeCount})`);

    const contractsByOwner = await factory.getContractsByDeployer(owner);
    const contractAddress = contractsByOwner[contractsByOwner.length - 1];

    console.log(`\nTest Today contract deployed to: ${contractAddress}`);
    console.log(`Minted ${mintAmount} tokens to: ${owner}`);

    console.log("\nDeployment completed successfully!");


    // if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    //   console.log("\nWaiting for block confirmations...");

    //   await new Promise(resolve => setTimeout(resolve, 60000));

    //   console.log(`\nVerifying contracts on ${hre.network.name}...`);

    //   await hre.run("verify:verify", {
    //     address: factoryAddress,
    //     constructorArguments: [],
    //   });
      
    //   console.log("Contract verification completed!");
    // }
  } catch (error) {
    console.error("Error during deployment:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
