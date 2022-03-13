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
    let tree
    before(async() => {
        trillioHeirs = await TrillioHeirs.deployed()
    })

    it('make merkle tree', async() => {
        // let whitelist = [accounts[0], accounts[1], accounts[2], accounts[3]]
        let whitelist = [
                    "0x0E12bbf43Aa03506f2b133aE38FCfe6083236e7F",
                    "0x5D5F5d0b95fCD20d3Fb837d6341Da4B0B02f224b",
                    "0x656947E79f546e011DB4d2b4b27135Fb46ccb9Fe",
                    "0x453B8D46D3D41d3B3DdC09B20AE53aa1B6aB186E",
                    "0x8C04e1707519cA28Bb73b008Cb9E1DA46Ecd6609",
                ]
        let leafNodes = whitelist.map(item => keccak256(item))
        tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
            
        let root = tree.getHexRoot()
        await trillioHeirs.setMerkleTree(root, 1)

        let proof = tree.getHexProof(keccak256(whitelist[3]));
        console.log("Tree: ", tree)
        console.log("Root: ", root)
        console.log("proof: ", proof)

        // await trillioHeirs.presaleMint(1, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.15", "ether")})

        // res = await trillioHeirs.ownerOf(0)
        // assert.equal(res, accounts[0], "owner of token")
    })

    // it('set level one merkle tree', async() => {
    //     let root = tree.getHexRoot()
    //     await trillioHeirs.setMerkleTree(root, 1)
    // })

    // it('presale', async() => {
    //     let proof = tree.getHexProof(keccak256(accounts[0]));
    //     await trillioHeirs.presaleMint(1, 1, proof, {from: accounts[0], value: web3.utils.toWei("0.15", "ether")})

    //     res = await trillioHeirs.ownerOf(0)
    //     assert.equal(res, accounts[0], "owner of token")
    // })
})
