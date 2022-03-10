const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')
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
        let leafNodes = lvl_1.map(addr => keccak256(addr))
        merkleTree_1 = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
        // merkleTree_2 = new MerkleTree(lvl_2);
        // merkleTree_3 = new MerkleTree(lvl_3);

        // const address_list = ["0x8C04e1707519cA28Bb73b008Cb9E1DA46Ecd6609", "0x5D5F5d0b95fCD20d3Fb837d6341Da4B0B02f224b", "0x453B8D46D3D41d3B3DdC09B20AE53aa1B6aB186E", "0x656947E79f546e011DB4d2b4b27135Fb46ccb9Fe"]
        // merkleTree_1 = new MerkleTree(address_list);
        // merkleTree_2 = new MerkleTree(address_list);
        // merkleTree_3 = new MerkleTree(address_list);

        const root_1 = merkleTree_1.getHexRoot()
        await nft.setVerify(root_1, 1)

        // const root_2 = merkleTree_2.getHexRoot()
        // await nft.setVerify(root_2, 2)

        // const root_3 = merkleTree_3.getHexRoot()
        // await nft.setVerify(root_3, 3)

        // console.log("root : ", root_1, root_2, root_3)
    })

    it('presale level 1', async() => {
        res = await nft.presale.call()
        assert.equal(res, true, 'variable presale is true')

        const proof = merkleTree_1.getHexProof(keccak256(lvl_1[0]));
        let mintAmount = 2
        res = presalePrice * mintAmount
        await nft.mint(mintAmount, 1, proof, {from: lvl_1[0], value: res.toString()})

        res = await nft.ownerOf(0)
        assert.equal(res, lvl_1[0], 'level-1 nft[0] owner')

        res = await nft.balanceOf(lvl_1[0])
        assert.equal(res, 2, 'level-1 owner balance')
    })

    // it('presale level 2', async() => {
    //     const proof = merkleTree_2.getHexProof(lvl_2[0]);
    //     let mintAmount = 2
    //     res = presalePrice * mintAmount
    //     await nft.mint(mintAmount, 2, proof, {from: lvl_2[0], value: res.toString()})

    //     res = await nft.ownerOf(7000)
    //     assert.equal(res, lvl_2[0], 'level-1 nft[0] owner')

    //     res = await nft.ownerOf(7001)
    //     assert.equal(res, lvl_2[0], 'level-1 nft[0] owner')

    //     try {
    //         res = await nft.ownerOf(7002)
    //     } catch (error) {
    //         assert.notEqual(typeof(error), undefined, 'sdfsdf')                
    //     }
    //     res = await nft.balanceOf(lvl_2[0])
    //     assert.equal(res, 2, 'level-2 owner balance')
    // })

    // it('presale level 3', async() => {
    //     const proof = merkleTree_3.getHexProof(lvl_3[0]);
    //     let mintAmount = 2
    //     res = presalePrice * mintAmount
    //     await nft.mint(mintAmount, 3, proof, {from: lvl_3[0], value: res.toString()})

    //     res = await nft.ownerOf(8500)
    //     assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

    //     res = await nft.ownerOf(8501)
    //     assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

    //     try {
    //         res = await nft.ownerOf(8502)
    //     } catch (error) {
    //         assert.notEqual(typeof(error), undefined, 'sdfsdf')                
    //     }

    //     res = await nft.balanceOf(lvl_3[0])
    //     assert.equal(res, 2, 'level-3 owner balance')
    // })

    // it('set presale state', async() => {
    //     await nft.setPresale(false)
    //     res = await nft.presale.call()
    //     assert.equal(res, false, 'set presale state to false')
    // })

    // it('public sale level 1', async() => {
    //     res = await nft.presale.call()
    //     assert.equal(res, false, 'variable presale is true')

    //     let mintAmount = 2
    //     res = publicsalePrice * mintAmount
    //     res = await nft.mint(mintAmount, 1, publicSaleProof, {from: lvl_1[0], value: res.toString()})

    //     res = await nft.balanceOf(lvl_1[0])
    //     assert.equal(res, 4, 'lvl_1[0] balance is 4')
    // })

    // it('public sale level 2', async() => {
    //     res = await nft.presale.call()
    //     assert.equal(res, false, 'variable presale is true')

    //     let mintAmount = 2
    //     res = publicsalePrice * mintAmount
    //     await nft.mint(mintAmount, 2, publicSaleProof, {from: lvl_2[0], value: res.toString()})

    //     // res = await nft.ownerOf(7001)
    //     // assert.equal(res, lvl_2[0], 'level-2 nft[0] owner')

    //     // res = await nft.ownerOf(7002)
    //     // assert.equal(res, lvl_2[0], 'level-2 nft[0] owner')

    //     // try {
    //     //     res = await nft.ownerOf(7003)
    //     // } catch (error) {
    //     //     assert.notEqual(typeof(error), undefined, 'sdfsdf')                
    //     // }

    //     res = await nft.balanceOf(lvl_2[0])
    //     assert.equal(res, 4, 'level-1 owner balance')
    // })

    // it('public sale level 3', async() => {
    //     res = await nft.presale.call()
    //     assert.equal(res, false, 'variable presale is true')

    //     let mintAmount = 2
    //     res = publicsalePrice * mintAmount
    //     await nft.mint(mintAmount, 3, publicSaleProof, {from: lvl_3[0], value: res.toString()})

    //     res = await nft.ownerOf(8501)
    //     assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

    //     res = await nft.ownerOf(8502)
    //     assert.equal(res, lvl_3[0], 'level-3 nft[0] owner')

    //     try {
    //         res = await nft.ownerOf(8503)
    //     } catch (error) {
    //         assert.notEqual(typeof(error), undefined, 'sdfsdf')                
    //     }
        
    //     res = await nft.balanceOf(lvl_2[0])
    //     assert.equal(res, 4, 'level-1 owner balance')
    // })

    // it('_baseURI', async() => {
    //     res = await nft.tokenURI(0)
    //     assert.equal(res, "baseURI/0", "baseURI testing")
    // })

    // it('special list mint', async() => {
    //     let mintAmount = 2
    //     await nft.mint(mintAmount, 1, publicSaleProof, {from: specialList[0]})

    //     res = await nft.ownerOf(4)
    //     assert.equal(res, specialList[0], 'special list 0 is owner')

    //     res = await nft.balanceOf(specialList[0])
    //     assert.equal(res, 2, 'level-1 owner balance')
    // })

    // it('balance eth', async() => {
    //     res = await web3.eth.getBalance(nft.address)
    //     let t = 0.15 * 6 + 0.18 * 4

    //     res = await web3.eth.getBalance(accounts[0])
    //     console.log(res)

    //     await nft.withdrawAll()
    
    //     res = await web3.eth.getBalance(accounts[0])
    //     console.log(res)
    // })
})