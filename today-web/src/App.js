import { useState } from "react";
import { ethers } from "ethers";
import { Seaport } from "@opensea/seaport-js";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const factoryAddress = "0xE2153Bb59801C117763e89C960968c68B0Dc2506";
const factoryABI = [
  "function deploy(uint256,address,string,string[],string,string,string,string) external returns (address)"
];
const bgColors = ["#000000", "#1A1A40", "#3B2F2F", "#3A4A3F", "#600000"];
const WETH_ADDRESS = "0x52ef3d68bab452a294342dc3e5f464d7f610f72e";
const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [mintAmount, setMintAmount] = useState(10);
  const [txUrl, setTxUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [prices, setPrices] = useState("");
  const [currency, setCurrency] = useState("POL");
  const [isApproving, setIsApproving] = useState(false);

  const ensureAmoyNetwork = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install MetaMask.");
      return false;
    }
  
    const amoyChainId = 80002;
    const prov = new ethers.BrowserProvider(window.ethereum);
    const network = await prov.getNetwork();
  
    if (network.chainId !== amoyChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13882" }], // 80002
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x13882",
                chainName: "Polygon Amoy",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc-amoy.polygon.technology"],
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              }],
            });
          } catch (addError) {
            alert("Failed to add the Amoy network. Please switch manually.");
            console.error(addError);
            return false;
          }
        } else {
          alert("Failed to switch to Amoy network.");
          console.error(switchError);
          return false;
        }
      }
    }
  
    return true;
  };  

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }
  
    const ok = await ensureAmoyNetwork();
    if (!ok) return;
  
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accs = await prov.send("eth_requestAccounts", []);
      const s = await prov.getSigner();
      setProvider(prov);
      setSigner(s);
      setAccount(accs[0]);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Failed to connect wallet. Please check your MetaMask.");
    }
  };

  const randomBgColor = () => {
    const weighted = [0, 0, 0, 1, 2, 3, 4];
    const idx = weighted[Math.floor(Math.random() * weighted.length)];
    return bgColors[idx];
  };

  const generateImage = async (text) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    const bg = randomBgColor();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "bold 84px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 400, 300);
    return { url: canvas.toDataURL("image/webp", 0.4), bg };
  };
  
  const handleCreate = async () => {
    const ok = await ensureAmoyNetwork();
    if (!ok) return;

    const dateStr = new Date()
      .toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
      .toUpperCase()
      .replace(" ", ".")
      .replace(",", ",");
    const { url, bg } = await generateImage(dateStr);
    const finalImages = imageUrls.filter(url => url.trim() !== "");
    const finalImage = finalImages.length > 0 ? finalImages[0] : url;
    const textColor = imageUrls.length > 0 ? "" : "#f5f5f5";
    const bgColor = imageUrls.length > 0 ? "" : bg;
    const contract = new ethers.Contract(factoryAddress, factoryABI, signer);
    const userAddress = await signer.getAddress();

    console.log("Deploy parameters:", {
      mintAmount,
      userAddress,
      name,
      finalImages: finalImages.map(url => 
        url.length > 100 ? url.substring(0, 100) + "..." : url
      ),
      textColor,
      bgColor,
      contractURI: "",
      bannerImageUrl
    });

    let receipt;
    try {
      const tx = await contract.deploy(
        mintAmount,
        userAddress,
        name,
        finalImages.length > 0 ? finalImages : [finalImage],
        textColor,
        bgColor,
        "",
        bannerImageUrl,
        {
          maxFeePerGas: ethers.parseUnits("50", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"),
          gasLimit: 8000000
        }
      );
      console.log("Transaction sent:", tx.hash);
      setTxUrl(`https://amoy.polygonscan.com/tx/${tx.hash}`);
      receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
    } catch (err) {
      console.error("Deployment failed:", err);
      if (err.data) {
        console.error("Error data:", err.data);
      }
      if (err.message) {
        console.error("Error message:", err.message);
      }
      alert(`Deployment failed: ${err.message}`);
      return;
    }
  };

  const getContractAddressFromSlug = async (slug) => {
    const url = `https://testnets-api.opensea.io/api/v2/collections/${slug}`;
    const res = await fetch(url);
    const json = await res.json();
    json.contracts?.forEach((c) => console.log(c.address));
    return json.contracts?.[0]?.address;
  };

  const handleList = async () => {
    if (!signer) {
      alert("Please connect your wallet first.");
      return;
    }

    const ok = await ensureAmoyNetwork();
    if (!ok) return;

    try {
      const priceList = prices
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p)
        .map((p) => {
          // USDCは6桁のデシマルを使用
          if (currency === "USDC") {
            return ethers.parseUnits(p, 6);
          }
          // POLとWETHは18桁のデシマル
          return ethers.parseEther(p);
        });

      const userAddress = await signer.getAddress();
      const contractAddress = await getContractAddressFromSlug(slug);
      if (!contractAddress) {
        alert("Could not retrieve contract address from slug.");
        return;
      }

      const seaport = new Seaport(signer);

      const SEAPORT_CONTRACT_ADDRESS = "0x0000000000000068f116a894984e2db1123eb395";
      const OPENSEA_CONDUIT_KEY = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
      const OPENSEA_CONDUIT_ADDRESS = "0x0000000000000000000000000000000000000000";  // Will be derived
      const OPENSEA_FEE_RECIPIENT = "0x0000a26b00c1F0DF003000390027140000fAa719";
      const OPENSEA_API_URL = "https://testnets-api.opensea.io/v2/orders/amoy/seaport/listings";

      // Get the Conduit address from the Conduit key
      const conduitController = new ethers.Contract(
        "0x00000000F9490004C11Cef243f5400493c00Ad63",
        ["function getConduit(bytes32) view returns (address)"],
        provider
      );
      const conduitAddress = await conduitController.getConduit(OPENSEA_CONDUIT_KEY);
      console.log("Conduit address:", conduitAddress);

      // Check if approval is needed
      const nftContract = new ethers.Contract(
        contractAddress,
        ["function isApprovedForAll(address,address) view returns (bool)", "function setApprovalForAll(address,bool)"],
        signer
      );
      
      const isApproved = await nftContract.isApprovedForAll(userAddress, conduitAddress);
      if (!isApproved) {
        setIsApproving(true);
        console.log("Approving NFT contract for Conduit...");
        const approveTx = await nftContract.setApprovalForAll(conduitAddress, true);
        await approveTx.wait();
        console.log("Approval transaction completed");

        // 承認後に少し待機し、承認状態を再確認
        console.log("Waiting for approval to be reflected...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機

        // 承認状態を再確認
        const isApprovedAfterWait = await nftContract.isApprovedForAll(userAddress, conduitAddress);
        if (!isApprovedAfterWait) {
          setIsApproving(false);
          alert("Approval not yet reflected. Please wait a moment and try again.");
          return;
        }
        console.log("Approval confirmed after waiting");
        setIsApproving(false);
      }

      for (let i = 0; i < priceList.length; i++) {
        const tokenId = String(i);
        const price = priceList[i];
        const feeAmount = (price * 50n) / 10000n;
        const sellerAmount = price - feeAmount;

        const order = await seaport.createOrder({
          offer: [
            {
              itemType: 2,
              token: contractAddress,
              identifier: tokenId,
            },
          ],
          consideration: [
            {
              amount: sellerAmount.toString(),
              recipient: userAddress,
              token: currency === "WETH" ? WETH_ADDRESS : (currency === "USDC" ? USDC_ADDRESS : ethers.ZeroAddress),
              itemType: currency === "POL" ? 0 : 1,
            },
            {
              amount: feeAmount.toString(),
              recipient: OPENSEA_FEE_RECIPIENT,
              token: currency === "WETH" ? WETH_ADDRESS : (currency === "USDC" ? USDC_ADDRESS : ethers.ZeroAddress),
              itemType: currency === "POL" ? 0 : 1,
            },
          ],
          orderType: 0,
          startTime: Math.floor(Date.now() / 1000),
          endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
          zone: ethers.ZeroAddress,
          zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          conduitKey: OPENSEA_CONDUIT_KEY,
        });

        const executedOrder = await order.executeAllActions();

        const formattedOrder = {
          parameters: { ...executedOrder.parameters },
          signature: executedOrder.signature,
          protocol_address: SEAPORT_CONTRACT_ADDRESS,
          extraData: "0x",
        };

        console.log("Submitting order to OpenSea...");
        const response = await fetch(OPENSEA_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedOrder),
        });
        const result = await response.json();
        console.log("OpenSea Response:", result);
      }

      alert("Listing process attempted. Check console for details.");
    } catch (err) {
      console.error("Listing error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 bg-white rounded-2xl shadow-lg mt-12 mb-12">
      <h1 className="text-3xl font-extrabold text-gray-800">NFT Creation & Listing Tool</h1>

      {!account ? (
        <button onClick={connect} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Connect Wallet</button>
      ) : (
        <p className="text-sm text-gray-600">Connected: {account}</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-600">Image URLs (optional)</label>
            <button
              onClick={() => {
                navigator.clipboard.readText().then(text => {
                  const urls = text.split(/[\n,]/)
                    .map(url => url.trim())
                    .filter(url => url !== "");
                  if (urls.length > 0) {
                    setImageUrls(urls);
                  }
                }).catch(err => console.error('Failed to read clipboard:', err));
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Paste Multiple URLs
            </button>
          </div>
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder={`Image URL ${index + 1}`}
                value={url}
                onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[index] = e.target.value;
                  setImageUrls(newUrls);
                }}
                className="border p-2 rounded-md w-full"
              />
              {imageUrls.length > 1 && (
                <button
                  onClick={() => {
                    const newUrls = imageUrls.filter((_, i) => i !== index);
                    setImageUrls(newUrls);
                  }}
                  className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                >
                  ×
                </button>
              )}
              {url && (
                <img
                  src={url}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          ))}
          <button
            onClick={() => setImageUrls([...imageUrls, ""])}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 w-full"
          >
            + Add Image URL
          </button>
        </div>
        <input
          placeholder="Banner Image URL (optional)"
          value={bannerImageUrl}
          onChange={(e) => setBannerImageUrl(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
        <input
          type="number"
          placeholder="Mint Amount"
          value={mintAmount}
          onChange={(e) => setMintAmount(Number(e.target.value))}
          className="border p-2 rounded-md w-full"
        />
        <button onClick={handleCreate} className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 w-full">Create NFT</button>
      </div>

      {txUrl && (
        <div className="text-sm text-blue-600 space-y-1">
          <a href={txUrl} target="_blank" rel="noopener noreferrer" className="underline">View Transaction</a>
          <br />
          <a href={`https://testnets.opensea.io/${account}`} target="_blank" rel="noopener noreferrer" className="underline">My OpenSea Page</a>
        </div>
      )}

      <hr className="my-6" />

      <div className="grid grid-cols-1 gap-4">
        <input
          placeholder="OpenSea Collection Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-600">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border p-2 rounded-md min-w-[120px]"
              >
                <option value="POL">POL (Native)</option>
                <option value="WETH">WETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1 flex-1">
              <label className="text-sm text-gray-600">Prices (one per line)</label>
              <textarea
                placeholder="List of prices (1 per line)"
                value={prices}
                onChange={(e) => setPrices(e.target.value)}
                className="border p-2 rounded-md w-full h-32"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={handleList} 
          className={`text-white py-2 rounded-md w-full ${
            account 
              ? isApproving 
                ? 'bg-yellow-500 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!account || isApproving}
        >
          {!account 
            ? "Connect wallet to list NFTs"
            : isApproving 
              ? "Approving... Please wait"
              : "List NFTs"
          }
        </button>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Ara ·{" "}
        <a
          href="https://github.com/avcdsld/nft-creation-tool"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}