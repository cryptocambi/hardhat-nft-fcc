const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    // basic
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicNftMintTx = await basicNft.mintNft()
    await basicNftMintTx.wait(1)
    console.log(`basicNft index 0 has tokenUri: ${await basicNft.tokenURI(0)}`)

    //dynamic
    const highValue = ethers.utils.parseEther("4000")
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicNftMintTx = await dynamicNft.mintNft(highValue)
    await dynamicNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicNft.tokenURI(0)}`)
    // random
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)

    const mintFee = await randomIpfsNft.getMintFee()
    //const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
    //    value: mintFee.toString(),
    //})
    //const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) //setTimeout(() => reject("Timeout: 'NFTminted' event did not fire"), 300000) // 5 minute timeout time
        randomIpfsNft.once("Nftminted", async function () {
            console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            resolve()
        })

        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
            value: mintFee.toString(),
        })
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
}

module.exports.tags = ["all", "mint"]
