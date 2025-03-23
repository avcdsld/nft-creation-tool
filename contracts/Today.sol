// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Today is ERC721A, Ownable {
    using Strings for uint256;

    string private _name;
    string private _imageUrl;
    uint256 private _timestamp;

    constructor(string memory contractName, string memory imageUrl) ERC721A(_getName(contractName), "TODAY") {
        _name = _getName(contractName);
        _imageUrl = imageUrl;
        _timestamp = block.timestamp;
    }

    function _getName(string memory contractName) private view returns (string memory) {
        return bytes(contractName).length > 0 ? contractName : _formatDateString(block.timestamp);
    }

    function mint(address to, uint256 quantity) external onlyOwner {
        _mint(to, quantity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory dateString = _formatDateString(_timestamp);

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"', 
                            dateString,
                            '","description":"',
                            dateString,
                            '","image":"',
                            bytes(_imageUrl).length > 0 ? _imageUrl : _generateSVG(_timestamp),
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function _formatDateString(uint256 timestamp) private pure returns (string memory) {
        uint256 secondsPerDay = 24 * 60 * 60;
        uint256 daysSince1970 = timestamp / secondsPerDay;

        uint256 year = 1970;
        uint256 daysInYear = 365;

        while (daysSince1970 >= daysInYear) {
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                if (daysSince1970 >= 366) {
                    daysSince1970 -= 366;
                    year += 1;
                } else {
                    break;
                }
            } else {
                daysSince1970 -= 365;
                year += 1;
            }
        }

        uint8[12] memory daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            daysInMonth[1] = 29;
        }

        uint256 month = 0;
        while (month < 12 && daysSince1970 >= daysInMonth[month]) {
            daysSince1970 -= daysInMonth[month];
            month += 1;
        }

        month += 1;
        uint256 day = daysSince1970 + 1;

        string[12] memory monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        string memory monthStr = monthNames[month - 1];

        return string(abi.encodePacked(
            monthStr, ".", 
            day.toString(), ",", 
            year.toString()
        ));
    }
    
    function _generateSVG(uint256 timestamp) private pure returns (string memory) {
        return string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(
                bytes(
                    abi.encodePacked(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">',
                        '<rect width="100%" height="100%" fill="#000" />',
                        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="84" font-weight="600" fill="#f5f5f5">',
                        _formatDateString(timestamp),
                        '</text>',
                        '</svg>'
                    )
                )
            )
        ));
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function setImageUrl(string memory url) external onlyOwner {
        _imageUrl = url;
    }

    function getTimestamp() external view returns (uint256) {
        return _timestamp;
    }
}
