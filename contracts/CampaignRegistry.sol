// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampaignRegistry {
    struct Campaign {
        string name;
        string[] keywords;
        address creator;
        uint256 createdAt;
    }

    Campaign[] private _campaigns;

    event CampaignRegistered(uint256 indexed index, string name, address indexed creator);

    function registerCampaign(string calldata name, string[] calldata keywords) external returns (uint256) {
        uint256 index = _campaigns.length;
        _campaigns.push();
        Campaign storage c = _campaigns[index];
        c.name = name;
        c.creator = msg.sender;
        c.createdAt = block.timestamp;
        for (uint256 i = 0; i < keywords.length; i++) {
            c.keywords.push(keywords[i]);
        }
        emit CampaignRegistered(index, name, msg.sender);
        return index;
    }

    function getCampaignCount() external view returns (uint256) {
        return _campaigns.length;
    }

    function getCampaign(uint256 index) external view returns (Campaign memory) {
        return _campaigns[index];
    }
}
