const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let ethUsdPriceFeedAddress

    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("--------------------------------")

    const lowSVG = fs.readFileSync("./images/dynamicNFT/frown.svg", { encoding: "utf8" })
    const highSVG = fs.readFileSync("./images/dynamicNFT/happy.svg", { encoding: "utf8" })

    console.log("ethUsdPriceFeedAddress:", ethUsdPriceFeedAddress)
    console.log("lowSVG:", lowSVG)
    console.log("highSVG:", highSVG)

    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying............")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicsvg", "main"]
