const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  let factory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should have zero deployed contracts initially", async function () {
      expect(await factory.getContractsCount()).to.equal(0);
    });
  });

  describe("NFT Contract Deployment", function () {
    it("Should deploy a new NFT contract with default parameters", async function () {
      const beforeCount = await factory.getContractsCount();

      const tx = await factory.deploy(
        3, // mintAmount
        addr1.address, // owner
        "", // name (empty for default)
        "", // imageUrl (empty for default)
        "", // textColor (empty for default)
        "", // backgroundColor (empty for default)
        "", // contractURI
        "" // bannerImage
      );

      await tx.wait();

      const afterCount = await factory.getContractsCount();
      expect(afterCount).to.equal(Number(beforeCount) + 1);

      const userContracts = await factory.getContractsByDeployer(owner.address);
      const contractAddress = userContracts[userContracts.length - 1];

      expect(contractAddress).to.match(/^0x[0-9a-fA-F]{40}$/);

      expect(await factory.getContractsCountByDeployer(owner.address)).to.equal(1);
    });

    it("Should deploy a new NFT contract with custom name", async function () {
      const customName = "TEST DATE PAINTING";

      const tx = await factory.deploy(
        1, // mintAmount
        owner.address, // owner
        customName, // name
        "", // imageUrl
        "", // textColor (empty for default)
        "", // backgroundColor (empty for default)
        "", // contractURI
        "" // bannerImage
      );

      await tx.wait();

      const userContracts = await factory.getContractsByDeployer(owner.address);
      const contractAddress = userContracts[userContracts.length - 1];

      const Today = await ethers.getContractFactory("Today");
      const today = await Today.attach(contractAddress);

      expect(await today.name()).to.equal(customName);
    });

    it("Should mint the specified amount of NFTs", async function () {
      const mintAmount = 5;

      const tx = await factory.deploy(
        mintAmount,
        owner.address,
        "Test NFTs", // name
        "", // imageUrl
        "", // textColor
        "", // backgroundColor
        "", // contractURI
        "" // bannerImage
      );

      await tx.wait();

      const userContracts = await factory.getContractsByDeployer(owner.address);
      const contractAddress = userContracts[userContracts.length - 1];

      const Today = await ethers.getContractFactory("Today");
      const today = await Today.attach(contractAddress);

      expect(await today.balanceOf(owner.address)).to.equal(mintAmount);
    });

    it("Should set external image URL", async function () {
      const imageUrl = "https://example.com/image.jpg";
      const bannerImage = "https://example.com/banner.jpg";

      const tx = await factory.deploy(
        1,
        owner.address,
        "NFT with Image",
        imageUrl,
        "", // textColor
        "", // backgroundColor
        "", // contractURI
        bannerImage
      );

      await tx.wait();

      const userContracts = await factory.getContractsByDeployer(owner.address);
      const contractAddress = userContracts[userContracts.length - 1];

      const Today = await ethers.getContractFactory("Today");
      const today = await Today.attach(contractAddress);

      const tokenURI = await today.tokenURI(0);
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
      const jsonData = JSON.parse(decodedData);

      expect(jsonData.image).to.equal(imageUrl);
    });

    it("Should set the deployer as the user who deployed the contract", async function () {
      const tx = await factory.connect(addr1).deploy(
        1,
        addr2.address, // Set addr2 as owner
        "Test NFT", // name
        "", // imageUrl
        "", // textColor
        "", // backgroundColor
        "", // contractURI
        "" // bannerImage
      );

      await tx.wait();

      expect(await factory.getContractsCountByDeployer(addr1.address)).to.equal(1);

      const userContracts = await factory.getContractsByDeployer(addr1.address);
      const contractAddress = userContracts[userContracts.length - 1];

      const Today = await ethers.getContractFactory("Today");
      const today = await Today.attach(contractAddress);

      expect(await today.owner()).to.equal(addr2.address);
    });

    it("Should use deployer as owner if owner address is zero", async function () {
      const zeroAddress = "0x0000000000000000000000000000000000000000";

      const tx = await factory.connect(addr1).deploy(
        1,
        zeroAddress, // Zero address
        "Test NFT",
        "", // imageUrl
        "", // textColor
        "", // backgroundColor
        "", // contractURI
        "" // bannerImage
      );

      await tx.wait();

      const userContracts = await factory.getContractsByDeployer(addr1.address);
      const contractAddress = userContracts[userContracts.length - 1];

      const Today = await ethers.getContractFactory("Today");
      const today = await Today.attach(contractAddress);

      expect(await today.owner()).to.equal(addr1.address);
    });
  });
});
