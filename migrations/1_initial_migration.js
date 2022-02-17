const ZamStacking = artifacts.require("ZamStacking");
const TestToken = artifacts.require("TestToken")
const NFT = artifacts.require("ZAMNFT")

module.exports = async function (deployer) {
  	await deployer.deploy(ZamStacking);
  	await deployer.deploy(TestToken, "ZamStake", "ZAM")
	await deployer.deploy(NFT, "ZamNft", "ZAM", "baseURI");
};
