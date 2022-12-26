// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "./Token1.sol";
import "./Token2.sol";
import "../Oracle/simple-oracle/contracts/Oracle.sol";

contract Swap {
    string public name = "Swap exchange";
    address owner;
    Token1 public token1;
    Token2 public token2;
    Oracle public oracle;
    uint256 public rate1; 
    uint256 public rate2;
    //for later -> add/remove liquidity
    mapping(address => uint) public balances;

    constructor(Token1 _token1, Token2 _token2,Oracle _oracle) {
        token1 = _token1;
        token2 = _token2;
        owner = msg.sender;
        oracle = _oracle;
    }

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate

    );

    function buyToken1 () public payable{
        //Numbers of token to buy
        getTokensPriceOracle();
        setTokensPriceOracle ();
        uint tokenAmount = msg.value * rate1;
        require(token1.balanceOf(address(this)) >= tokenAmount);
        token1.transfer(msg.sender,tokenAmount);
        //Emit event
        emit TokenPurchased(msg.sender, address(token1), tokenAmount, rate1);
    }

    function buyToken2 () public payable{
        getTokensPriceOracle();
        setTokensPriceOracle ();
        uint tokenAmount = msg.value * rate2;
        require(token2.balanceOf(address(this)) >= tokenAmount);
        token2.transfer(msg.sender,tokenAmount);
        //Emit event
        emit TokenPurchased(msg.sender, address(token2), tokenAmount, rate2);
    }

    function sellToken1(uint _amount) public payable{
        getTokensPriceOracle();
        setTokensPriceOracle();
        // calculate ether amount to send
        uint etherAmount = _amount / rate1;
        require((address(this).balance) >= etherAmount);
        //make sale
        token1.transferFrom(msg.sender, payable(address(this)), _amount);
        payable(msg.sender).transfer(etherAmount);
    }

    function sellToken2(uint _amount) public payable{
        getTokensPriceOracle();
        setTokensPriceOracle();
        // calculate ether amount to send
        uint etherAmount = _amount / rate2;
        require((address(this).balance) >= etherAmount);
        //make sale
        token2.transferFrom(msg.sender, payable(address(this)), _amount);
       payable(msg.sender).transfer(etherAmount);
    }

    function getTokensPriceOracle() public {
        oracle.getTokensPrice();
    }

    function setTokensPriceOracle () public onlyOwner{
        rate1 = oracle.token1Price();
        rate2 = oracle.token2Price();
    }

    function setTokens(Token1 _token1, Token2 _token2) public onlyOwner{
        token1=_token1;
        token2=_token2;

    }

    function setOracle(Oracle _oracle) public onlyOwner{
        oracle = _oracle;
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    receive() external payable {}
    
}

