// test/MerkleProofVerify.test.js
// SPDX-License-Identifier: MIT
// based upon https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.1/test/cryptography/MerkleProof.test.js

// require('@openzeppelin/test-helpers');

const { MerkleTree } = require('./helpers/merkleTree.js');

const MerkleProofVerify = artifacts.require('MerkleProofVerify');

contract('MerkleProofVerify', function (accounts) {
    beforeEach(async function () {
        this.merkleProofVerify = await MerkleProofVerify.new();
    });

    it('should return true for a valid leaf', async function () {
        const elements = [accounts[0], accounts[1], accounts[2], accounts[3]];
        const merkleTree = new MerkleTree(elements);

       const root = merkleTree.getHexRoot();

       const proof = merkleTree.getHexProof(elements[0]);

       expect(await this.merkleProofVerify.verify(proof, root, {from: accounts[0]})).to.equal(true);
    });


    it('should return false for an invalid leaf', async function () {
        const elements = [accounts[0], accounts[1], accounts[2], accounts[3]];
        const merkleTree = new MerkleTree(elements);

       const root = merkleTree.getHexRoot();

       const proof = merkleTree.getHexProof(elements[0]);

       expect(await this.merkleProofVerify.verify(proof, root, {from: accounts[4]})).to.equal(false);
    });
});