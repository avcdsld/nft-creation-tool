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
        string memory imageUrl
    ) external returns (address) {
        if (owner == address(0)) {
            owner = msg.sender;
        }

        Today newContract = new Today(name, imageUrl);

        if (mintAmount > 0) {
            newContract.mint(owner, mintAmount);
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
