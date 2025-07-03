// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./Today.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
    address[] public contracts;
    address public constant OPENSEA_CONDUIT_CONTROLLER = 0x00000000F9490004C11Cef243f5400493c00Ad63;
    bytes32 public constant OPENSEA_CONDUIT_KEY = 0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000;

    mapping(address => address[]) public contractsByDeployer;

    event Deployed(address indexed deployer, address contractAddress, string name, uint256 mintAmount);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function getConduitAddress() public view returns (address conduit) {
        (bool success, bytes memory data) = OPENSEA_CONDUIT_CONTROLLER.staticcall(
            abi.encodeWithSignature("getConduit(bytes32)", OPENSEA_CONDUIT_KEY)
        );
        require(success, "Failed to get conduit address");
        assembly {
            conduit := mload(add(data, 32))
        }
    }

    function deploy(
        uint256 mintAmount,
        address owner,
        string memory name,
        string memory imageUrl,
        string memory textColor,
        string memory bgColor,
        string memory contractURI,
        string memory bannerImage
    ) external returns (address) {
        if (owner == address(0)) {
            owner = msg.sender;
        }

        Today newContract = new Today(name, imageUrl, textColor, bgColor, bannerImage);

        // Get OpenSea's conduit address and approve it
        address conduit = getConduitAddress();
        newContract.setApprovalForAll(conduit, true);

        if (mintAmount > 0) {
            newContract.mint(owner, mintAmount);
        }

        if (bytes(contractURI).length > 0) {
            newContract.setContractURI(contractURI);
        }

        newContract.transferOwnership(owner);

        address contractAddress = address(newContract);
        contracts.push(contractAddress);
        contractsByDeployer[msg.sender].push(contractAddress);

        emit Deployed(msg.sender, contractAddress, name, mintAmount);

        return contractAddress;
    }

    function getContractsCount() external view returns (uint256) {
        return contracts.length;
    }

    function getContractsCountByDeployer(address deployer) external view returns (uint256) {
        return contractsByDeployer[deployer].length;
    }

    function getContractsByDeployer(address deployer) external view returns (address[] memory) {
        return contractsByDeployer[deployer];
    }
}
