require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')
const { MerkleTree } = require('./helpers/merkleTree.js');
const NFT = artifacts.require('./ZAMNFT.sol')

contract('New NFT contract testing', (accounts) => {
    let res
    let nft
    let lvl_1, lvl_2, lvl_3, specialList
    let merkleTree_1, merkleTree_2, merkleTree_3
    let presalePrice, publicsalePrice
    let publicSaleProof
    before(async() => {
        nft = await NFT.deployed()
        lvl_1 = [accounts[1], accounts[2]]
        lvl_2 = [accounts[3], accounts[4]]
        lvl_3 = [accounts[5], accounts[6]]
        specialList = [accounts[7], accounts[8], accounts[9]]

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
        await nft.addSpecialList(specialList)
        res = await nft.specialList.call(0)
        assert.equal(res, specialList[0], 'special list address array')
    })
    it('set max mint for special list', async() => {
        await nft.setMaximumSpecialList([specialList[0]], 5)
        await nft.setMaximumSpecialList([specialList[1], specialList[2]], 10)
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

    it('presale level 1', async() => {
        res = await nft.presale.call()
        assert.equal(res, true, 'variable presale is true')

        const proof = merkleTree_1.getHexProof(lvl_1[0]);
        let mintAmount = 2
        res = presalePrice * mintAmount
        await nft.mint(mintAmount, 1, proof, {from: lvl_1[0], value: res.toString()})

        res = await nft.ownerOf(0)
        assert.equal(res, lvl_1[0], 'level-1 nft[0] owner')

        res = await nft.balanceOf(lvl_1[0])
        assert.equal(res, 2, 'level-1 owner balance')
    })

    it('presale level 2', async() => {
        const proof = merkleTree_2.getHexProof(lvl_2[0]);
        let mintAmount = 2
        res = presalePrice * mintAmount
        await nft.mint(mintAmount, 2, proof, {from: lvl_2[0], value: res.toString()})

        res = await nft.ownerOf(6999)
        assert.equal(res, lvl_2[0], 'level-1 nft[0] owner')

        res = await nft.ownerOf(7000)
        assert.equal(res, lvl_2[0], 'level-1 nft[0] owner')

        try {
            res = await nft.ownerOf(7001)
        } catch (error) {
            assert.notEqual(typeof(error), undefined, 'sdfsdf')                
        }
        res = await nft.balanceOf(lvl_2[0])
        assert.equal(res, 2, 'level-2 owner balance')
    })

    it('presale level 3', async() => {
        const proof = merkleTree_3.getHexProof(lvl_3[0]);
        let mintAmount = 2
        res = presalePrice * mintAmount
        await nft.mint(mintAmount, 3, proof, {from: lvl_3[0], value: res.toString()})

        res = await nft.ownerOf(8499)
        assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

        res = await nft.ownerOf(8500)
        assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

        try {
            res = await nft.ownerOf(8501)
        } catch (error) {
            assert.notEqual(typeof(error), undefined, 'sdfsdf')                
        }

        res = await nft.balanceOf(lvl_3[0])
        assert.equal(res, 2, 'level-3 owner balance')
    })

    it('set presale state', async() => {
        await nft.setPresale(false)
        res = await nft.presale.call()
        assert.equal(res, false, 'set presale state to false')
    })

    it('public sale level 1', async() => {
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

    it('public sale level 2', async() => {
        res = await nft.presale.call()
        assert.equal(res, false, 'variable presale is true')

        let mintAmount = 2
        res = publicsalePrice * mintAmount
        await nft.mint(mintAmount, 2, publicSaleProof, {from: lvl_2[0], value: res.toString()})

        res = await nft.ownerOf(7001)
        assert.equal(res, lvl_2[0], 'level-2 nft[0] owner')

        res = await nft.ownerOf(7002)
        assert.equal(res, lvl_2[0], 'level-2 nft[0] owner')

        try {
            res = await nft.ownerOf(7003)
        } catch (error) {
            assert.notEqual(typeof(error), undefined, 'sdfsdf')                
        }

        res = await nft.balanceOf(lvl_2[0])
        assert.equal(res, 4, 'level-1 owner balance')
    })

    it('public sale level 3', async() => {
        res = await nft.presale.call()
        assert.equal(res, false, 'variable presale is true')

        let mintAmount = 2
        res = publicsalePrice * mintAmount
        await nft.mint(mintAmount, 3, publicSaleProof, {from: lvl_3[0], value: res.toString()})

        res = await nft.ownerOf(8501)
        assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

        res = await nft.ownerOf(8502)
        assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

        try {
            res = await nft.ownerOf(8503)
        } catch (error) {
            assert.notEqual(typeof(error), undefined, 'sdfsdf')                
        }
        
        res = await nft.balanceOf(lvl_2[0])
        assert.equal(res, 4, 'level-1 owner balance')
    })

    it('_baseURI', async() => {
        res = await nft.tokenURI(0)
        assert.equal(res, "baseURI/0", "baseURI testing")
    })

    it('special list mint', async() => {
        let mintAmount = 2
        await nft.mint(mintAmount, 1, publicSaleProof, {from: specialList[0]})

        res = await nft.ownerOf(4)
        assert.equal(res, specialList[0], 'special list 0 is owner')

        res = await nft.balanceOf(specialList[0])
        assert.equal(res, 2, 'level-1 owner balance')
    })

    it('balance eth', async() => {
        res = await web3.eth.getBalance(nft.address)
        console.log(res.toString())
    })

    it('check level', async() => {
        const proof_1 = merkleTree_1.getHexProof(lvl_3[0]);
        const proof_2 = merkleTree_2.getHexProof(lvl_3[0]);
        const proof_3 = merkleTree_3.getHexProof(lvl_3[0]);
        console.log(proof_1)
        console.log(proof_2)
        console.log(proof_3)
    })
})