require('chai')
.use(require('chai-as-promised'))
.should()

const {assert} = require('chai')

const ZamStacking = artifacts.require('./staking/ZamStacking.sol')
const TestToken = artifacts.require('./tokens/TestToken.sol')
const NFT = artifacts.require('./ZAMNFT.sol')

const { MerkleTree } = require('./helpers/merkleTree.js');

contract('Staking contract test', (accounts) => {
    let res
    let staking, token, nft
    let stakeOwner, stakeVault, stakedTokenAddr, rewardTokenAddr
    before(async() => {
        staking = await ZamStacking.deployed()
        token = await TestToken.deployed()
        nft = await NFT.deployed()

        stakeOwner = accounts[0]
        stakeVault = accounts[9]
        stakedTokenAddr = TestToken.address
        rewardTokenAddr = TestToken.address
    })
    it('Transfer Test token to clients', async() => {
        await token.transfer(accounts[1], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[2], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[3], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[4], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[5], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[6], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[7], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[8], web3.utils.toWei('1000', 'ether'))
        await token.transfer(accounts[9], web3.utils.toWei('1000', 'ether'))
    })
    it('Staking contract initialize', async() => {
        await staking.initialize(stakeOwner, stakeVault, stakedTokenAddr, rewardTokenAddr)
    })
    it('Depositing', async() => {
        await token.approve(staking.address, web3.utils.toWei('10', 'ether'), {from: accounts[1]})
        await staking.deposit(web3.utils.toWei('10', 'ether'), {from: accounts[1]})

        await token.approve(staking.address, web3.utils.toWei('10', 'ether'), {from: accounts[2]})
        await staking.deposit(web3.utils.toWei('10', 'ether'), {from: accounts[2]})

        await token.approve(staking.address, web3.utils.toWei('10', 'ether'), {from: accounts[3]})
        await staking.deposit(web3.utils.toWei('10', 'ether'), {from: accounts[3]})

        await token.approve(staking.address, web3.utils.toWei('30', 'ether'), {from: accounts[4]})
        await staking.deposit(web3.utils.toWei('30', 'ether'), {from: accounts[4]})

        await token.approve(staking.address, web3.utils.toWei('30', 'ether'), {from: accounts[5]})
        await staking.deposit(web3.utils.toWei('30', 'ether'), {from: accounts[5]})

        await token.approve(staking.address, web3.utils.toWei('30', 'ether'), {from: accounts[6]})
        await staking.deposit(web3.utils.toWei('30', 'ether'), {from: accounts[6]})

        await token.approve(staking.address, web3.utils.toWei('50', 'ether'), {from: accounts[7]})
        await staking.deposit(web3.utils.toWei('50', 'ether'), {from: accounts[7]})

        await token.approve(staking.address, web3.utils.toWei('50', 'ether'), {from: accounts[8]})
        await staking.deposit(web3.utils.toWei('50', 'ether'), {from: accounts[8]})

        await token.approve(staking.address, web3.utils.toWei('50', 'ether'), {from: accounts[9]})
        await staking.deposit(web3.utils.toWei('50', 'ether'), {from: accounts[9]})
    })
    it('Merkle Tree', async() => {
        let level_1 = [accounts[1], accounts[2], accounts[3]]
        let level_2 = [accounts[4], accounts[5], accounts[6]]
        let level_3 = [accounts[7], accounts[8], accounts[9]]

        const merkleTree_1 = new MerkleTree(level_1)
        const merkleTree_2 = new MerkleTree(level_2)
        const merkleTree_3 = new MerkleTree(level_3)

        const root_1 = merkleTree_1.getHexRoot();
        await nft.setVerify(root_1, 1)
        const proof_1 = merkleTree_1.getHexProof(accounts[1]);
        res = await nft.verify(proof_1, 1, {from:accounts[1]})
        assert(res, true, 'level 1 verify is true')

        const root_2 = merkleTree_2.getHexRoot();
        await nft.setVerify(root_2, 2)
        const proof_2 = merkleTree_2.getHexProof(accounts[4]);
        res = await nft.verify(proof_2, 2, {from:accounts[4]})
        assert(res, true, 'level 2 verify is true')

        const root_3 = merkleTree_3.getHexRoot();
        await nft.setVerify(root_3, 3)
        const proof_3 = merkleTree_3.getHexProof(accounts[7]);
        res = await nft.verify(proof_3, 3, {from: accounts[7]})
        assert(res, true, 'level 3 verify is true')
    })
})