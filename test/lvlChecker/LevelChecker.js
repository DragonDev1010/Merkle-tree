const Web3 = require('web3')
const zamABI = require('./ZamABI.json')

const zamAddr = "0xBbcF57177D8752B21d080bf30a06CE20aD6333F8"

var web3, zamToken

async function getLevel(address) {
    web3 = new Web3("https://bsc-dataseed.binance.org/")
    let level_1 = web3.utils.toWei('1000', 'ether')
    let level_2 = web3.utils.toWei('10000', 'ether')

    zamToken = new web3.eth.Contract(zamABI, zamAddr)

    let res = await zamToken.methods.balanceOf(address).call()

    if(parseInt(res) < parseInt(level_1)) {
        console.log(1)
        return 1
    }
    else if (parseInt(res) < parseInt(level_2)){
        console.log(2)
        return 2
    }
    else {
        console.log(3)
        return 3
    }
}
