const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')
const TrillioHeirs = artifacts.require('./TrillioHeirs.sol')



contract('TrillioHeirs Contract', (accounts) => {
    let res
    let trillioHeirs
    let tree_1, tree_2, tree_3
    before(async() => {
        trillioHeirs = await TrillioHeirs.deployed()
    })

    it('make merkle tree', async() => {
        let whitelist = [accounts[0], accounts[1], accounts[2]]
        let leafNodes = whitelist.map(item => keccak256(item))
        tree_1 = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
            
        let root = tree_1.getHexRoot()
        await trillioHeirs.setMerkleTree(root, 1)

        whitelist = [accounts[4], accounts[5], accounts[3]]
        leafNodes = whitelist.map(item => keccak256(item))
        tree_2 = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
            
        root = tree_2.getHexRoot()
        await trillioHeirs.setMerkleTree(root, 2)

        whitelist = [accounts[7], accounts[8], accounts[6]]
        leafNodes = whitelist.map(item => keccak256(item))
        tree_3 = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
            
        root = tree_3.getHexRoot()
        await trillioHeirs.setMerkleTree(root, 3)
    })

    it('presale', async() => {
        let proof = tree_1.getHexProof(keccak256(accounts[0]));
        await trillioHeirs.presaleMint(1, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.15", "ether")})
        res = await trillioHeirs.ownerOf(0)
        assert.equal(res, accounts[0], "owner of token")
    })

    it('special list sale', async() => {
        await trillioHeirs.setPresale(false, {from: accounts[0]})

        await trillioHeirs.addSpecialWallet([accounts[1]], 1)
        await trillioHeirs.setSpecialMaxMintAmount([accounts[1]], 10)
        await trillioHeirs.specialMint(4, {from: accounts[1]})

        await trillioHeirs.addSpecialWallet([accounts[2]], 2)
        await trillioHeirs.setSpecialMaxMintAmount([accounts[2]], 10)
        await trillioHeirs.specialMint(4, {from: accounts[2]})
    })

    it('public sale', async() => {
        await trillioHeirs.setPresale(false, {from: accounts[0]})
        await trillioHeirs.publicsaleMint(1, {from: accounts[0], value: web3.utils.toWei("0.18", "ether")})

        await trillioHeirs.publicsaleMint(3, {from: accounts[4], value: web3.utils.toWei("0.54", "ether")})
    })

    // it('checking remaining nft for each level', async() => {
    //     let proof = tree_1.getHexProof(keccak256(accounts[0]));
    //     await trillioHeirs.presaleMint(4, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.6", "ether")})
    // })

    // it('test max mint for each level', async() => {
    //     let proof = tree_1.getHexProof(keccak256(accounts[0]));
    //     await trillioHeirs.presaleMint(6, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.9", "ether")})

    //     await trillioHeirs.presaleMint(1, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.15", "ether")})
    // })

    // it('set base uri', async() => {
    //     let base_uri = "https://gateway.ipfs.io/ipfs/QmPqbpJRSMkBnoM8jiB1NKuJeAsgsgAmmgvKUqCPqC5g2N/"
    //     await trillioHeirs.setBaseURI(base_uri)
    //     res = await trillioHeirs.tokenURI(0)
    //     console.log(res)
    //     assert.equal(res, base_uri+"0", "set base uri")
    // })

    // it('minted amount for each level', async() => {
    //     let proof = tree_1.getHexProof(keccak256(accounts[0]));
    //     await trillioHeirs.presaleMint(2, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.3", "ether")})

    //     proof = tree_1.getHexProof(keccak256(accounts[1]));
    //     await trillioHeirs.presaleMint(3, 1, proof, {from: accounts[1], value: web3.utils.toWei("0.45", "ether")})

    //     res = await trillioHeirs.mintedAmount_1.call()
    //     assert.equal(res, 6)

    //     proof = tree_2.getHexProof(keccak256(accounts[3]));
    //     await trillioHeirs.presaleMint(4, 2, proof, {from: accounts[3], value: web3.utils.toWei("0.6", "ether")})

    //     proof = tree_2.getHexProof(keccak256(accounts[4]));
    //     await trillioHeirs.presaleMint(5, 2, proof, {from: accounts[4], value: web3.utils.toWei("0.75", "ether")})

    //     res = await trillioHeirs.mintedAmount_2.call()
    //     assert.equal(res, 9)

    //     proof = tree_3.getHexProof(keccak256(accounts[6]));
    //     await trillioHeirs.presaleMint(6, 3, proof, {from: accounts[6], value: web3.utils.toWei("0.9", "ether")})

    //     proof = tree_3.getHexProof(keccak256(accounts[7]));
    //     await trillioHeirs.presaleMint(7, 3, proof, {from: accounts[7], value: web3.utils.toWei("1.05", "ether")})

    //     res = await trillioHeirs.mintedAmount_3.call()
    //     assert.equal(res, 13)
    // })

    // it('presale emergency pause', async() => {
    //     await trillioHeirs.setPaused(false, {from: accounts[0]})
    //     let proof = tree_1.getHexProof(keccak256(accounts[0]));
    //     await trillioHeirs.presaleMint(1, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.15", "ether")})
    // })
})
