// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TrillioHeirs is ERC721, Ownable{
    using SafeMath for uint256;

    bool public paused = false;
    bool public presale = true;
    string public baseURI;

    uint256 public mintedAmount_1;
    uint256 public mintedAmount_2;
    uint256 public mintedAmount_3;
    uint256 public mintedAmount_4;

    uint256 public maxMint_1 = 7000;
    uint256 public maxMint_2 = 1500;
    uint256 public maxMint_3 = 370;
    uint256 public maxMint_auction = 18;

    uint256 public presalePrice = 0.15 ether;
    uint256 public publicsalePrice = 0.18 ether;

    uint256 public presaleMaxMint = 10;
    uint256 public publicsaleMaxMint = 5;

    bytes32 private merkleTreeRoot_1;
    bytes32 private merkleTreeRoot_2;
    bytes32 private merkleTreeRoot_3;

    uint256 public ownerMintTotal = 198;
    uint256 ownerMint_1;
    uint256 ownerMint_2;
    uint256 ownerMint_3;

    struct SpecialWallet {
        uint256 level;
        uint256 maxMintAmount;
    }
    mapping(address => SpecialWallet) specialListInfo;

    constructor(string memory name, string memory symbol, string memory baseUrl) ERC721(name, symbol) {
        setBaseURI(baseUrl);
    }

    receive() external payable {}

    function withdrawAll() external onlyOwner{
        uint256 amount = address(this).balance;
        payable(owner()).transfer(amount);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setPresale(bool s_) public onlyOwner {
        presale = s_;
    }

    modifier isPresale {
        require(presale);
        _;
    }

    modifier isPublicsale {
        require(!presale);
        _;
    }

    function setPaused(bool s_) public onlyOwner {
        paused = s_;
    }

    modifier emergencyPause {
        require(!paused);
        _;
    }

    function _getRemainingForLvl(uint256 lvl) private view returns(uint256) {
        if (lvl == 1)
            return maxMint_1 - mintedAmount_1;
        else if (lvl == 2)
            return maxMint_2 - mintedAmount_2;
        else if (lvl == 3)
            return maxMint_3 - mintedAmount_3;
        else 
            return 0;
    }

    function addSpecialWallet(address[] memory addresses, uint256 lvl) public onlyOwner {
        require(lvl > 0, "TrillioHeirs.addSpecialWallet : The level of special wallet can not be zero.");
        require(lvl < 4, "TrillioHeirs.addSpecialWallet : The levle of special wallet can not be greater than 4.");

        for(uint256 i = 0 ; i < addresses.length ; i++) {
            require(addresses[i] != address(0), "TrillioHeirs.addSpecialWallet : The address of special wallet can not be zero.");
            SpecialWallet memory temp = SpecialWallet(lvl, 0);
            specialListInfo[addresses[i]] = temp;
        }
    }

    function isSpecialList(address addr_) public view returns(bool) {
        if(specialListInfo[addr_].level == 0)
            return false;
        else
            return true;
    }

    function setSpecialMaxMintAmount(address[] memory addresses, uint256 max) public onlyOwner {
        require(max > 0, "TrillioHeirs.setSpecialMaxMintAmount : The max mint amount of special wallet can not be zero.");
        for(uint256 i = 0 ; i < addresses.length ; i++) {
            require(isSpecialList(addresses[i]), "TrillioHeirs.setSpecialMaxMintAmount : An address is not a special wallet.");
        }
        for(uint256 i = 0 ; i < addresses.length ; i++) {
            specialListInfo[addresses[i]].maxMintAmount = max;
        }
    }

    function _getPresoldAmount() private view returns(uint256) {
        return mintedAmount_1 + mintedAmount_2 + mintedAmount_3;
    }

    function _getPresaleCost(uint256 amount) private view returns(uint256) {
        return presalePrice.mul(amount);
    }

    function setMerkleTree(bytes32 root_, uint256 lvl) public onlyOwner {
        if (lvl == 1)
            merkleTreeRoot_1 = root_;
        else if (lvl == 2)
            merkleTreeRoot_2 = root_;
        else 
            merkleTreeRoot_3 = root_;
    }

    function _verifyWhitelist(bytes32[] memory proof, uint256 lvl) private view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if(lvl == 1)
            return MerkleProof.verify(proof, merkleTreeRoot_1, leaf);
        else if (lvl == 2)
            return MerkleProof.verify(proof, merkleTreeRoot_2, leaf);
        else 
            return MerkleProof.verify(proof, merkleTreeRoot_3, leaf);
    }

    function presaleMint(uint256 amount, uint256 lvl, bytes32[] memory proof) public payable emergencyPause isPresale {
        uint256 estimatedAmount = balanceOf(msg.sender).add(amount);
        require(estimatedAmount <= presaleMaxMint, "TrillioHeirs.presaleMint : You have already minted max NFTs or you are going to mint too many NFTs now.");
        require(_verifyWhitelist(proof, lvl), "TrillioHeirs.presaleMint : Only whitelisted wallet can attend in presale.");
        require(_getPresoldAmount() <= 3000, "TrillioHeirs.presaleMint : In presale, Only 3000 NFTs can be mint.");
        require(_getRemainingForLvl(lvl) >= amount, "TrillioHeirs.presaleMint : Mint amount can not be greater than remaining NFT amount in each level.");
        require(msg.value == _getPresaleCost(amount), "TrillioHeirs.presaleMint : Msg.value is less than the real value.");
        if(lvl == 1) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
        } else if (lvl == 2) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
        } else {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
        }
    }

    function _getRandomLevel(uint256 amount) private view returns(uint256) {
        uint256 remain = _getRemainingForLvl(1).add(_getRemainingForLvl(2)).add(_getRemainingForLvl(3)).sub(_getRemainingOwnerMintAmount());
        require(amount <= remain, "TrilloHeirs._getRandomLevel : Remaining NFT is not enough.");
        uint256 random = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, mintedAmount_1, mintedAmount_2, mintedAmount_3)));
        uint256 lvl = random.mod(3).add(1);
        uint256 count = 0;
        while(_getRemainingForLvl(lvl) < amount) {
            lvl = lvl.mod(3).add(1);
            if (count == 2)
                return 0;
            count++;
        }
        return lvl;
    }

    function _getPublicsaleCost(uint256 amount) private view returns(uint256) {
        return amount.mul(publicsalePrice);
    }

    function publicsaleMint(uint256 amount) public payable emergencyPause  {
        uint256 estimatedAmount = balanceOf(msg.sender).add(amount);
        require(estimatedAmount <= publicsaleMaxMint, "TrillioHeirs.publicsaleMint : You have already minted max NFTs or you are going to mint too many NFTs now.");
        uint256 randomLvl = _getRandomLevel(amount);
        require(randomLvl == 0, "TrillioHeirs.publicsaleMint : Amount of remaining NFT for each level is not enough.");
        require(msg.value == _getPublicsaleCost(amount), "TrillioHeirs.publicsaleMint : Msg.value is not enough.");
        if(randomLvl == 1) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
        } else if (randomLvl == 2) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
        } else {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
        }
    }

    function specialMint(uint256 amount) public emergencyPause isPublicsale {
        uint256 remain = _getRemainingForLvl(1).add(_getRemainingForLvl(2)).add(_getRemainingForLvl(3)).sub(_getRemainingOwnerMintAmount());
        require(amount <= remain, "TrilloHeirs.specialMint : Remaining NFT is not enough.");
        uint256 max = specialListInfo[msg.sender].maxMintAmount;
        require(amount <= max, "Trillioheirs.specialMint : Amount can not be greater than max mint amount.");

        uint256 lvl = specialListInfo[msg.sender].level;
        require(amount <= _getRemainingForLvl(lvl), "Trillioheirs.specialMint : Remaining NFT for level is not enough.");
        if(lvl == 1) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
        } else if (lvl == 2) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
        } else {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
        }
    }

    function _getRemainingOwnerMintAmount() private view returns(uint256) {
        return ownerMintTotal.sub(ownerMint_1.add(ownerMint_2).add(ownerMint_3));
    }

    function ownerMint(uint256 amount, uint256 lvl) public onlyOwner {
        require(amount <= _getRemainingOwnerMintAmount(), "TrillioHeirs.ownerMint : Remaining Owner NFT amount is not enough.");
        require(amount <= _getRemainingForLvl(lvl), "TrillioHeirs.ownerMint : Level has not enough NFT.");
        if(lvl == 1) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
            ownerMint_1 += amount;
        } else if (lvl == 2) {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
            ownerMint_2 += amount;
        } else {
            for(uint256 i = 0 ; i < amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
            ownerMint_3 += amount;
        }
    }

    function auctionMint(uint256 amount) public onlyOwner {
        require(amount > 0, "TrilloHeirs.auctionMint : Mint amount can not be zero.");
        uint256 remaining = maxMint_auction.sub(mintedAmount_4);
        require(amount <= remaining, "TrilloHeirs.auctionMint : NFT is not enough.");
        for(uint256 i = 0 ; i < amount ; i++)
            _safeMint(msg.sender, (mintedAmount_4 + maxMint_1 + maxMint_2 + maxMint_3 + i));
        mintedAmount_4 += amount;
    }
}