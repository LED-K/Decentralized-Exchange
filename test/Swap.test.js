const { expect } = require("chai");
const hre = require("hardhat");
const { BigNumber} = require('ethers');
require('dotenv').config({ path: '../.env' });



let swap,token1,token2;



before(async()=>{
  const Swap = await  hre.ethers.getContractFactory("Swap");
  const Token1 = await  hre.ethers.getContractFactory("Token1");
  const Token2 =  await hre.ethers.getContractFactory("Token2");
  token1 = await Token1.deploy();
  await token1.deployed();
  token2 = await Token2.deploy();
  await token2.deployed();
  swap = await Swap.deploy(token1.address,token2.address,'0x76C1d4079527B06d63bc6BecEB2988E581502B49');
  await swap.deployed();  
  //Transfer all tokens to Swap exchange
  await token1.transfer(swap.address,'1000000000000000000000000');
  await token2.transfer(swap.address,'1000000000000000000000000');
  //ganache rpc
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY_TEST);
  signer = wallet.connect(provider);
 
})

describe("SwapDex Deployment", async function () {
  it("Should return the contract name", async function () {

    expect(await swap.name()).to.equal("Swap exchange");
  })
  it("Swap Contract has the funds", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const balanceToken1 = await token1.balanceOf(swap.address);
    const balanceToken2 = await token2.balanceOf(swap.address);
    expect(await balanceToken1.toString()).to.equal("1000000000000000000000000");
    expect(await balanceToken2.toString()).to.equal("1000000000000000000000000");
  })
  it("It should swap eth with token1", async function () {
    let overrides = {
      from : signer.address,
      value: '1000',
      gasLimit: 500000
    }
    const buy = await swap.connect(signer).buyToken1(overrides);
    const balanceUser =  await token1.balanceOf(signer.address); 
    const value =  BigNumber.from("1000");
    //console.log(balanceUser);
    expect(balanceUser).to.equal(value);
  })
  it("It should swap eth with token2", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    let overrides = {
      from : signer.address,
      value: '1000',
      gasLimit: 500000
    }
    const buy = await swap.connect(signer).buyToken2(overrides);
    const balanceUser =  await token2.balanceOf(signer.address); 
    const value =  BigNumber.from("1000");
    //console.log(balanceUser);
    expect(balanceUser).to.equal(value);
  })
  it("It should sell token 1 to get ether", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    let overrides = {
      from : signer.address,
      gasLimit: 500000
    }
    const approve = await token1.connect(signer).approve(swap.address,'1000',overrides);
    const sell = await swap.connect(signer).sellToken1('1000',overrides);
    const balanceUser =  await token1.balanceOf(signer.address); 
    const value =  BigNumber.from("0");
    //console.log(balanceUser);
    expect(balanceUser).to.equal(value);
  })
  });
