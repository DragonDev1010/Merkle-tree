// SPDX-License-Identifier: MIT

pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleProofVerify {
    function verify(bytes32[] memory proof, bytes32 root)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));

        return MerkleProof.verify(proof, root, leaf);
    }
}