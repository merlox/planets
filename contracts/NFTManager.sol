// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTFactory {
  struct Trait {
    string id;
    uint score;
  }

  uint constant internal maxRarityScore = 100;
  uint internal nonce = 1293;
  mapping (string => bool) internal foundDNAs;

  Trait[][] internal traitTable;
  Trait[4]  internal colors;
  Trait[6]  internal faces;
  Trait[12] internal eyes;
  Trait[5]  internal hats;
  Trait[5]  internal muss;
  Trait[3]  internal mouths;

  constructor() {
    _setTraitTable();
  }

  function _getDNA(uint _salt) internal returns (string memory) {
    while (true) {
      string memory id = "";
      for (uint i=0; i<traitTable.length; i++) {
        Trait[] memory traitPool = traitTable[i];
        string memory traitId = _pickFromTraits(traitPool, _salt);
        id = string(abi.encodePacked(id, traitId));
      }
      if (foundDNAs[id] == false) {
        foundDNAs[id] = true;
        return id;
      }
    }
  }

  function _pickFromTraits(Trait[] memory _traits, uint _salt) internal returns (string memory) {
    uint r = _random(_salt, maxRarityScore);
    string memory foundTrait;
    uint found;
    for (uint i=0; i<_traits.length; i++) {
      if (_traits[i].score <= r) {
        if (found == 0) {
          foundTrait = _traits[i].id;
          found = 1;
        }else{
          if (_random(_salt, 2) > 0) {
            foundTrait = _traits[i].id;
          }
        }
      }
    }
    return foundTrait;
  }

  function _setTraitTable() internal {
    colors[0] = Trait("0", 0);
    colors[1] = Trait("1", 80);
    colors[2] = Trait("2", 75);
    colors[3] = Trait("3", 95);

    faces[0] = Trait("0", 0);
    faces[1] = Trait("1", 10);
    faces[2] = Trait("2", 20);
    faces[3] = Trait("3", 30);
    faces[4] = Trait("4", 80);
    faces[5] = Trait("5", 95);

    eyes[0] = Trait("0", 0);
    eyes[1] = Trait("1", 10);
    eyes[2] = Trait("2", 20);
    eyes[3] = Trait("3", 30);
    eyes[4] = Trait("4", 40);
    eyes[5] = Trait("5", 50);
    eyes[6] = Trait("6", 50);
    eyes[7] = Trait("7", 50);
    eyes[8] = Trait("8", 50);
    eyes[9] = Trait("9", 50);
    eyes[10] = Trait("a", 90);
    eyes[11] = Trait("b", 95);

    hats[0] = Trait("0", 0);
    hats[1] = Trait("1", 80);
    hats[2] = Trait("2", 85);
    hats[3] = Trait("3", 90);
    hats[4] = Trait("4", 95);

    muss[0] = Trait("0", 0);
    muss[1] = Trait("1", 70);
    muss[2] = Trait("2", 85);
    muss[3] = Trait("3", 90);
    muss[4] = Trait("4", 95);

    mouths[0] = Trait("0", 0);
    mouths[1] = Trait("1", 20);
    mouths[2] = Trait("2", 50);

    traitTable.push(colors);
    traitTable.push(faces);
    traitTable.push(eyes);
    traitTable.push(hats);
    traitTable.push(muss);
    traitTable.push(mouths);
  }

  function _random(uint _salt, uint _limit) internal returns (uint) {
    uint r = (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce, _salt)))) % _limit;
    nonce++;
    return r;
  }
}

contract NFTManager is ERC721Enumerable, NFTFactory, Ownable {
  using SafeMath for uint256;
  using SafeMath for uint8;

  uint public maxDudes = 512;
  uint public maxDudesPerPurchase = 10;
  uint256 public price = 20000000000000000; // 0.020 Ether

  bool public isSaleActive = false;
  string public baseURI;
  mapping (uint => string) public dudes;

  address public creator;

  constructor (uint _maxDudes, uint _maxDudesPerPurchase) ERC721("the dudes", "dude") {
    maxDudes = _maxDudes;
    maxDudesPerPurchase = _maxDudesPerPurchase;
    creator = msg.sender;
    _claim(creator, 1, 873281);
  }

  function setIsSaleActive(bool _isSaleActive) public onlyOwner {
    isSaleActive = _isSaleActive;
  }

  function setPrice(uint256 _newPrice) public onlyOwner {
    price = _newPrice;
  }

  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    payable(msg.sender).transfer(balance);
  }

  function claim(uint256 _numDudes, uint _salt) public payable {
    require(isSaleActive, "dude, sale is not active!" );
    require(_numDudes > 0 && _numDudes <= maxDudesPerPurchase, 'You can get no fewer than 1, and no more than 10 dudes at a time');
    require(totalSupply().add(_numDudes) <= maxDudes, "Sorry too many dudes!");
    require(msg.value >= price.mul(_numDudes), "Ether value sent is not correct dude!");

    _claim(msg.sender, _numDudes, _salt);
  }

  function tokensOfOwner(address _owner) public view returns (uint256[] memory) {
    uint256 tokenCount = balanceOf(_owner);
    if (tokenCount == 0) {
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](tokenCount);
      uint256 index;
      for (index = 0; index < tokenCount; index++) {
        result[index] = tokenOfOwnerByIndex(_owner, index);
      }
      return result;
    }
  }

  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
    return string(abi.encodePacked(_baseURI(), "/", dudes[_tokenId]));
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function _claim(address _to, uint256 _numDudes, uint _salt) internal {
    for (uint256 i = 0; i < _numDudes; i++) {
      uint256 mintIndex = totalSupply();

      string memory dudeId = _getDNA(_salt * i);
      dudes[mintIndex] = dudeId;

      _safeMint(_to, mintIndex);
    }
  }
  
  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }
}