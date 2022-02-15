const ZamStacking = artifacts.require("ZamStacking");
const TestToken = artifacts.require("TestToken")

module.exports = async function (deployer) {
  	await deployer.deploy(ZamStacking);
  	await deployer.deploy(TestToken, "ZamStake", "ZAM")
};
