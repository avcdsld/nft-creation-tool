const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Today", function () {
  let today;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Today = await ethers.getContractFactory("Today");
    today = await Today.deploy(
      "Today NFT", // name
      "", // imageUrl
      "", // textColor
      "" // backgroundColor
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await today.owner()).to.equal(owner.address);
    });

    it("Should set the right name", async function () {
      expect(await today.name()).to.equal("Today NFT");
    });

    it("Should set the right symbol", async function () {
      expect(await today.symbol()).to.equal("TODAY");
    });

    it("Should generate default name if empty name is provided", async function () {
      const Today = await ethers.getContractFactory("Today");
      const defaultNameNft = await Today.deploy(
        "", // Empty name
        "", // imageUrl
        "", // textColor
        "" // backgroundColor
      );

      const name = await defaultNameNft.name();
      const dateRegex = /^[A-Z]{3}\.\d{1,2},\d{4}$/;
      expect(dateRegex.test(name)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Only owner can mint tokens", async function () {
      await expect(today.mint(addr1.address, 1))
        .to.not.be.reverted;

      await expect(today.connect(addr1).mint(addr2.address, 1))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should mint multiple tokens correctly", async function () {
      const mintAmount = 5;
      await today.mint(addr1.address, mintAmount);

      expect(await today.balanceOf(addr1.address)).to.equal(mintAmount);

      for (let i = 0; i < mintAmount; i++) {
        expect(await today.ownerOf(i)).to.equal(addr1.address);
      }
    });

    it("Should increment token IDs sequentially", async function () {
      await today.mint(addr1.address, 3);
      await today.mint(addr2.address, 2);

      expect(await today.ownerOf(0)).to.equal(addr1.address);
      expect(await today.ownerOf(1)).to.equal(addr1.address);
      expect(await today.ownerOf(2)).to.equal(addr1.address);
      expect(await today.ownerOf(3)).to.equal(addr2.address);
      expect(await today.ownerOf(4)).to.equal(addr2.address);

      expect(await today.totalSupply()).to.equal(5);
    });
  });

  describe("TokenURI", function () {
    beforeEach(async function () {
      await today.mint(addr1.address, 1);
    });

    it("Should generate valid token URI with SVG", async function () {
      const tokenURI = await today.tokenURI(0);

      expect(tokenURI).to.include("data:application/json;base64,");

      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
      const jsonData = JSON.parse(decodedData);

      expect(jsonData).to.have.property("name");
      expect(jsonData).to.have.property("description");
      expect(jsonData).to.have.property("image");

      expect(jsonData.name).to.equals("Today NFT");
      expect(jsonData.image).to.include("data:image/svg+xml;base64,");

      const svgBase64 = jsonData.image.replace("data:image/svg+xml;base64,", "");
      const svgData = Buffer.from(svgBase64, 'base64').toString('utf8');

      expect(svgData).to.include("<svg");
      expect(svgData).to.include("</svg>");
      expect(svgData).to.include("rect");
      expect(svgData).to.include("text");
    });

    it("Should use external image URL if provided", async function () {
      const imageUrl = "https://example.com/date-image.jpg";
      await today.setImageUrl(imageUrl);

      const tokenURI = await today.tokenURI(0);
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
      const jsonData = JSON.parse(decodedData);

      expect(jsonData.image).to.equal(imageUrl);
    });

    it("Should fail for non-existent token", async function () {
      await expect(today.tokenURI(999)).to.be.reverted;
    });

    it("Only owner can set external image URL", async function () {
      await expect(today.setImageUrl("https://example.com/image.jpg"))
        .to.not.be.reverted;

      await expect(today.connect(addr1).setImageUrl("https://example.com/hacked.jpg"))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
