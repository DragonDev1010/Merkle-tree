const { MerkleTree } = require('./merkleTree.js');

let lvl_2 = require('./lvl_2.json');
let lvl_3 = require('./lvl_3.json')

const merkleTree_2 = new MerkleTree(lvl_2)
const root_2 = merkleTree_2.getHexRoot()

const merkleTree_3 = new MerkleTree(lvl_3)
const root_3 = merkleTree_3.getHexRoot()

console.log(root_2)
console.log(root_3)