require('chai')
.use(require('chai-as-promised'))
.should()

const {assert} = require('chai')

const ZamStacking = artifacts.require('./staking/ZamStacking.sol')
const TestToken = artifacts.require('./tokens/TestToken.sol')

const { MerkleTree } = require('./helpers/merkleTree.js');

contract('Staking contract test', (accounts) => {
    let staking, token
    let stakeOwner, stakeVault, stakedTokenAddr, rewardTokenAddr
    before(async() => {
        staking = await ZamStacking.deployed()
        token = await TestToken.deployed()

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

        const merkle_1 = new MerkleTree(level_1)
        const merkle_2 = new MerkleTree(level_2)
        const merkle_3 = new MerkleTree(level_3)

        
    })
})