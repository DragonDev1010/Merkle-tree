// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ZAMNFT is ERC721, Ownable {
    using SafeMath for uint256;

    string public baseURI;

    bool public paused = false;
    bool public presale = true;

    uint256 public presaleMaxMintAmount = 10;
    uint256 public publicsaleMaxMintAmount = 5;

    uint256 public preSalePrice = 0.15 ether;
    uint256 public publicSalePrice = 0.18 ether;

    mapping(address => bool) public specialListIndex;
    address[] public specialList;
    mapping(address => uint256) public specailListMaxMintAmount;

    bytes32 private root_1;
    bytes32 private root_2;
    bytes32 private root_3;

    uint256 public minted_1;
    uint256 public minted_2;
    uint256 public minted_3;
    uint256 public minted_owner;

    uint256 public totalLevel1 = 7000;
    uint256 public totalLevel2 = 1500;
    uint256 public totalLevel3 = 172;
    uint256 public totalOwner = 216;

    address public auctionAddress;

    event PublicSale(address minter, uint256 tokenId, uint256 level);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        minted_2 = totalLevel1;
        minted_3 = totalLevel1 + totalLevel2;
        minted_owner = totalLevel1 + totalLevel2 + totalLevel3;
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

    function _addOneSpecialList(address one) private {
        if (!inArray(one)) {
            // Append
            specialListIndex[one] = true;
            specialList.push(one);
        }
    }

    function inArray(address who) private view returns (bool) {
        // address 0x0 is not valid if pos is 0 is not in the array
        if (specialListIndex[who]) {
            return true;
        }
        return false;
    }

    function addSpecialList(address[] memory addresses) public onlyOwner {
        for(uint i = 0 ; i < addresses.length ; i++) {
            require(addresses[i] != address(0), "NFT.addSpecialList : input address list contais zero address.");
            _addOneSpecialList(addresses[i]);
        }
    }

    function setMaximumSpecialList(address[] memory addresses, uint256 maxMint) public onlyOwner {
        for(uint i = 0 ; i < addresses.length ; i++) {
            require(addresses[i] != address(0), "NFT.setMaximumSpecialList : input address list contais zero address.");
            require(inArray(addresses[i]), "NFT.setMaximumSpecialList : this address is not special list wallet");
            specailListMaxMintAmount[addresses[i]] = maxMint;
        }
    }

    function setVerify(bytes32 root, uint level) public onlyOwner {
        require(level < 4, "setVerify : level has to be less than 4.");
        if (level == 1)
            root_1 = root;
        else if (level == 2)
            root_2 = root;
        else
            root_3 = root;
    }

    function verify(bytes32[] memory proof, uint level) public view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (level == 1)
            return MerkleProof.verify(proof, root_1, leaf);
        else if (level == 2)
            return MerkleProof.verify(proof, root_2, leaf);
        else 
            return MerkleProof.verify(proof, root_3, leaf);
    }

    function mint(uint256 amount, uint256 level, bytes32[] memory proof) public payable {
        require(!paused);
        require(amount > 0);
        if(presale) {
            if(inArray(msg.sender))
                require(amount < specailListMaxMintAmount[msg.sender], "mint : special-list wallet mint amount has to be less or equal than maximum mint amount");
            else 
                require(amount < presaleMaxMintAmount, "mint : mint amount has to be less or equal than maximum mint amount");
            
            require(msg.value == preSalePrice * amount, "Presale : NFT price is 0.15 ETH.");
            _presale(msg.sender, amount, level, proof);
        } else {
            if(inArray(msg.sender))
                require(amount < specailListMaxMintAmount[msg.sender], "mint : special-list wallet mint amount has to be less or equal than maximum mint amount");
            else 
                require(amount < publicsaleMaxMintAmount, "mint : mint amount has to be less or equal than maximum mint amount");
            
            require(msg.value == publicSalePrice * amount, "Public sale : NFT price is 0.18 ETH.");
            uint256 rndLevel = random().mod(3).add(1);
            _publicsale(msg.sender, amount, rndLevel);
        }
    }

    function _presale(address minter, uint256 amount, uint256 level, bytes32[] memory proof) private {
        require(verify(proof, level), "_persale : Address is not whitelisted.");
        _publicsale(minter, amount, level);
    }

    function _publicsale(address minter, uint256 amount, uint256 level) private {
        if(level == 1) {
            require(minted_1 < 7000, "Mint Level 1 : 7000 lvl-1 NFTs has already been minted.");
            for(uint256 i = 0 ; i < amount ; i++) {
                _safeMint(minter, (minted_1+i));
                emit PublicSale(minter, minted_1+i, 1);
            }
            minted_1 += amount;
        } else if (level == 2) {
            require(minted_2 < 8500, "Mint Level 2 : 1500 lvl-2 NFTs has already been minted.");
            for(uint256 i = 0 ; i < amount ; i++) {
                _safeMint(minter, (minted_2+i));
                emit PublicSale(minter, minted_2+i, 2);
            }
            minted_2 += amount;
        } else if (level == 3) {
            require(minted_3 < 8870, "Mint Level 3 : 370 lvl-3 NFTs has already been minted.");
            for(uint256 i = 0 ; i < amount ; i++) {
                _safeMint(minter, (minted_3+i));
                emit PublicSale(minter, minted_3+i, 3);
            }
            minted_3 += amount;
        }
    }

    function mintAuction() public onlyOwner {
        for(uint256 i = 8870 ; i < 8887 ; i++)
			_safeMint(auctionAddress, i);
    }

    function setPresale(bool state) public onlyOwner {
        presale = state;
    }
    
    function setPaused(bool state) public onlyOwner {
        paused = state;
    }

    function random() private view returns(uint256){
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }

    function setAuctionAddress(address auction_) public onlyOwner {
		auctionAddress = auction_;
	}
}