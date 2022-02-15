require('chai')
.use(require('chai-as-promised'))
.should()

const {assert} = require('chai')

const ZamStacking = artifacts.require('./staking/ZamStacking.sol')

contract('Staking contract test', (accounts) => {
    let staking
    before(async() => {
        staking = await ZamStacking.deployed()
    })
})