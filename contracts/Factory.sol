// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./Today.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
    address[] public contracts;

    mapping(address => address[]) public contractsByDeployer;

    event Deployed(address indexed deployer, address contractAddress, string name, uint256 mintAmount);

    constructor() {
        _transferOwnership(msg.sender);
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
