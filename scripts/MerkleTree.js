const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

const lvl_1_data = require("./wallet_1.json")
const lvl_2_data = require("./wallet_2.json")
const lvl_3_data = require("./wallet_3.json")

function makeMerkleTree(addresses) {
    let leafNodes = addresses.map(item => keccak256(item))
    let tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true})
    return tree
}

function getMerkleTreeRoot(tree) {
    return tree.getHexRoot()
}

function getProof(tree, address) {
    const proof = tree.getHexProof(keccak256(address));
    return proof
}

function main() {
    console.log("* * * MERKLE TREE * * *")

    const tree_1 = makeMerkleTree(lvl_1_data)
    const root_1 = getMerkleTreeRoot(tree_1)
    const proof_1 = getProof(tree_1, lvl_1_data[3])
    const proof_2 = getProof(tree_1, lvl_1_data[4])

    // console.log("Tree : ", tree_1)
    // console.log("Root : ", root_1)
    console.log("Proof : ", proof_1)
    console.log("Proof : ", proof_2)
}

main()