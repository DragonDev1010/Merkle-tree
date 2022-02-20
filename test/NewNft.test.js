require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')
const { MerkleTree } = require('./helpers/merkleTree.js');
const NFT = artifacts.require('./ZAMNFT.sol')

contract('New NFT contract testing', (accounts) => {
    let res
    let nft
    let lvl_1, lvl_2, lvl_3, lvl_4
    let merkleTree_1, merkleTree_2, merkleTree_3
    let presalePrice, publicsalePrice
    let publicSaleProof
    before(async() => {
        nft = await NFT.deployed()
        lvl_1 = [accounts[1], accounts[2]]
        lvl_2 = [accounts[3], accounts[4]]
        lvl_3 = [accounts[5], accounts[6]]
        lvl_4 = [accounts[7], accounts[8], accounts[9]]

        publicSaleProof = ['0x0000000000000000000000000000000000000000000000000000000000000000']
    })
    it('constructor', async() => {
        res = await nft.name.call()
        assert.equal(res, "ZamNft", "nft name")
        res = await nft.symbol.call()
        assert.equal(res, "ZAM", "nft symbol")
    })
    it('presale price and publicsale price', async() => {
        res = await nft.preSalePrice.call()
        presalePrice = parseInt(res)
        assert.equal(presalePrice, web3.utils.toWei('0.15', 'ether'), 'presale price')

        res = await nft.publicSalePrice.call()
        publicsalePrice = parseInt(res)
        assert.equal(publicsalePrice, web3.utils.toWei('0.18', 'ether'), 'publicsale price is correct')
    })
    it('add special list', async() => {
        await nft.addSpecialList(lvl_4)
        res = await nft.specialList.call(0)
        assert.equal(res, lvl_4[0], 'special list address array')
    })
    it('set max mint for special list', async() => {
        await nft.setMaximumSpecialList([lvl_4[0]], 5)
        await nft.setMaximumSpecialList([lvl_4[1], lvl_4[2]], 10)
    })
    it('setverify', async() => {
        merkleTree_1 = new MerkleTree(lvl_1);
        merkleTree_2 = new MerkleTree(lvl_2);
        merkleTree_3 = new MerkleTree(lvl_3);

        const root_1 = merkleTree_1.getHexRoot()
        await nft.setVerify(root_1, 1)

        const root_2 = merkleTree_2.getHexRoot()
        await nft.setVerify(root_2, 2)

        const root_3 = merkleTree_3.getHexRoot()
        await nft.setVerify(root_3, 3)
    })

    it('mint presale', async() => {
        res = await nft.presale.call()
        assert.equal(res, true, 'variable presale is true')

        const proof = merkleTree_1.getHexProof(lvl_1[0]);
        console.log(proof)
        let mintAmount = 2
        res = presalePrice * mintAmount
        await nft.mint(mintAmount, 1, proof, {from: lvl_1[0], value: res.toString()})

        res = await nft.ownerOf(0)
        assert.equal(res, lvl_1[0], 'level-1 nft[0] owner')

        res = await nft.balanceOf(lvl_1[0])
        assert.equal(res, 2, 'level-1 owner balance')
    })

    it('set presale state', async() => {
        await nft.setPresale(false)
        res = await nft.presale.call()
        assert.equal(res, false, 'set presale state to false')
    })

    it('mint publicsale', async() => {
        res = await nft.presale.call()
        assert.equal(res, false, 'variable presale is true')

        let mintAmount = 2
        res = publicsalePrice * mintAmount
        await nft.mint(mintAmount, 1, publicSaleProof, {from: lvl_1[0], value: res.toString()})

        res = await nft.ownerOf(2)
        assert.equal(res, lvl_1[0], 'level-1 nft[0] owner')

        res = await nft.balanceOf(lvl_1[0])
        assert.equal(res, 4, 'level-1 owner balance')
    })
})