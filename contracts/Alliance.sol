//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract Alliance is ERC1155, Ownable, ERC1155Burnable {
    uint256 public constant GENERIC_TOKEN = 0;
    uint256 public constant MAX_STAKE = 10;
    uint256 public constant MIN_TOKEN_NFT = 25;
    uint256 public constant MAX_SKILL_NFTS = 100000;
    mapping(address => mapping(address => bool)) private stakes;
    mapping(uint256 => uint256) private lastMintedNFT;

    constructor(string memory url) ERC1155(url) {
        _mint(msg.sender, GENERIC_TOKEN, 1000000000, "");
    }

    function setURI(string memory newUri) public onlyOwner {
        _setURI(newUri);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(super.uri(tokenId), Strings.toString(tokenId))
            );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(tokenId == GENERIC_TOKEN, "only-generic-token");
        super.safeTransferFrom(from, to, tokenId, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        require(ids.length == amounts.length, "lengths-mismatch");
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] == GENERIC_TOKEN, "only-generic-token");
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function stake(address to, uint256[] memory skillTokenIds) public {
        require(
            MAX_STAKE * skillTokenIds.length <=
                balanceOf(msg.sender, GENERIC_TOKEN),
            "not-enough-tokens"
        );
        require(stakes[msg.sender][to] == false, "already-staked");
        uint256 j;
        for (j = 0; j < skillTokenIds.length; j += 1) {
            require(
                skillTokenIds[j] > 0 && skillTokenIds[j] < 1000,
                "invalid-token-id"
            );
        }
        for (j = 0; j < skillTokenIds.length; j += 1) {
            _mint(to, skillTokenIds[j] + 1000, MAX_STAKE, "");
        }
        _burn(msg.sender, GENERIC_TOKEN, MAX_STAKE * skillTokenIds.length);
        stakes[msg.sender][to] = true;
    }

    function reward(
        address to,
        uint256[] memory skillTokenIds,
        uint256[] memory pcts
    ) public {
        require(stakes[msg.sender][to], "not-staked");
        require(skillTokenIds.length == pcts.length, "lengths-mismatch");
        uint256 j;
        for (j = 0; j < skillTokenIds.length; j += 1) {
            require(
                skillTokenIds[j] > 0 && skillTokenIds[j] < 1000,
                "invalid-token-id"
            );
            require(pcts[j] <= MAX_STAKE && pcts[j] >= 1, "invalid-reward-pct");
            require(
                balanceOf(to, skillTokenIds[j] + 1000) >= MAX_STAKE,
                "not-enough-tokens"
            );
        }
        for (j = 0; j < skillTokenIds.length; j += 1) {
            _mint(to, skillTokenIds[j], pcts[j], "");
            _burn(to, skillTokenIds[j] + 1000, MAX_STAKE);
        }
        stakes[msg.sender][to] = false;
    }

    function mintNFT(uint256 skillTokenId) public {
        require(skillTokenId > 0 && skillTokenId < 1000, "invalid-token-id");
        require(
            balanceOf(msg.sender, skillTokenId) >= MIN_TOKEN_NFT,
            "not-enough-tokens"
        );
        require(lastMintedNFT[skillTokenId] < MAX_SKILL_NFTS, "no-more-nfts");
        _burn(msg.sender, skillTokenId, MIN_TOKEN_NFT);
        _mint(
            msg.sender,
            skillTokenId * MAX_SKILL_NFTS + lastMintedNFT[skillTokenId],
            1,
            ""
        );
        lastMintedNFT[skillTokenId] += 1;
    }
}
