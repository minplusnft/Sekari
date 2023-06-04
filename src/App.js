import './App.css';
import { Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import TOKENABI from './TOKENABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, TOKENCONTRACT, polygonscanapi, moralisapi } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';

var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;
var pluscont = null;

const moralisapikey = "rjbVuX2UJ7f16EyEVSkXuOrObKN5zqQumKQP6wYh27aPsQyK0GGeBpgM9XB36KiX";
const polygonscanapikey = "N6T3SSDAWWEBDHP2VR2424B3Z51UFGRVVI";

const providerOptions = {
  binancechainwallet: {
    package: true
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "64d1bed94f1d40908f08965a0400ac56"
    }
  },
  walletlink: {
    package: WalletLink,
    options: {
      appName: "Miner Plus",
      infuraId: "64d1bed94f1d40908f08965a0400ac56",
      rpc: "",
      chainId: 1,
      appLogoUrl: null,
      darkMode: true
    }
  },
};
const web3Modal = new Web3Modal({
  network: "Polygon",
  theme: "dark",
  cacheProvider: true,
  providerOptions
});
class App extends Component {
  constructor() {
    super();
    this.state = {
      balance: [],
      rawearn: [],
    };
  }
  handleModal() {
    this.setState({ show: !this.state.show })
  }
  handleNFT(nftamount) {
    this.setState({ outvalue: nftamount.target.value });
  }
  async componentDidMount() {

    await axios.get((polygonscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${polygonscanapikey}`))
      .then(outputa => {
        this.setState({
          balance: outputa.data
        })
        console.log(outputa.data)
      })
    let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
    await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=mumbai&format=decimal`), { headers: config })
      .then(outputb => {
        const { result } = outputb.data
        this.setState({
          nftdata: result
        })
        console.log(outputb.data)
      })
  }
  render() {
    const { balance } = this.state;
    const { outvalue } = this.state;
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    const expectedBlockTime = 10000;
    async function connectwallet() {
      var provider = await web3Modal.connect();
      web3 = new Web3(provider);
      await provider.send('eth_requestAccounts');
      var accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('wallet-address').textContent = account;
      contract = new web3.eth.Contract(ABI, NFTCONTRACT);
      vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
      pluscont = new web3.eth.Contract(TOKENABI, TOKENCONTRACT);
      var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
      document.getElementById('yournfts').textContent = getstakednfts;
      var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
      document.getElementById('stakedbalance').textContent = getbalance;
      var plusBal = await pluscont.methods.balanceOf(account).call();
      var plusbal = Web3.utils.fromWei(plusBal); console.log(plusbal);
      var formatbal = Number(plusbal).toFixed(2);
      document.getElementById('Tokbal').textContent = formatbal;
      const arraynft = Array.from(getstakednfts.map(Number));
      const tokenid = arraynft.filter(Number);
      var rwdArray = [];
      tokenid.forEach(async (id) => {
        var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
        var array = Array.from(rawearn.map(Number));
        console.log(array);
        array.forEach(async (item) => {
          var earned = String(item).split(",")[0];
          var earnedrwd = Web3.utils.fromWei(earned);
          var rewardx = Number(earnedrwd).toFixed(2);
          var numrwd = Number(rewardx);
          console.log(numrwd);
          rwdArray.push(numrwd);
        });
      });
      function delay() {
        return new Promise(resolve => setTimeout(resolve, 300));
      }
      async function delayedLog(item) {
        await delay();
        var sum = item.reduce((a, b) => a + b, 0);
        var formatsum = Number(sum).toFixed(2);
        document.getElementById('earned').textContent = formatsum;
      }
      async function processArray(rwdArray) {
        for (const item of rwdArray) {
          await delayedLog(item);
        }
      }
      return processArray([rwdArray]);
    }
    async function verify() {
      var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
      document.getElementById('yournfts').textContent = getstakednfts;
      var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
      document.getElementById('stakedbalance').textContent = getbalance;
    }
    async function tokenbal() {
      var plusBal = await pluscont.methods.balanceOf(account).call();
      var plusbal = Web3.utils.fromWei(plusBal); console.log(plusbal);
      var formatbal = Number(plusbal).toFixed(2);
      document.getElementById('Tokbal').textContent = formatbal;
    }
    async function enable() {
      contract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: account });
    }
    async function rewardinfo() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);
      var rwdArray = [];
      tokenid.forEach(async (id) => {
        var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
        var array = Array.from(rawearn.map(Number));

        array.forEach(async (item) => {
          var earned = String(item).split(",")[0];
          var earnedrwd = Web3.utils.fromWei(earned);
          var rewardx = Number(earnedrwd).toFixed(2);
          var numrwd = Number(rewardx);
          rwdArray.push(numrwd)
        });
      });
      function delay() {
        return new Promise(resolve => setTimeout(resolve, 300));
      }
      async function delayedLog(item) {
        await delay();
        var sum = item.reduce((a, b) => a + b, 0);
        var formatsum = Number(sum).toFixed(2);
        document.getElementById('earned').textContent = formatsum;
      }
      async function processArray(rwdArray) {
        for (const item of rwdArray) {
          await delayedLog(item);
        }
      }
      return processArray([rwdArray]);
    }
    async function claimit() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);

      tokenid.forEach(async (id) => {
        await vaultcontract.methods.claim([id])
          .send({
            from: account,
          })
      })
    }
    async function unstakeall() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);

      tokenid.forEach(async (id) => {
        await vaultcontract.methods.unstake([id])
          .send({
            from: account,
          })
      })
    }
    async function mint() {
      var _mintAmount = Number(outvalue);
      var mintRate = Number(await contract.methods.cost().call());
      var totalAmount = mintRate * _mintAmount;

      contract.methods.mint(account, _mintAmount)
        .send({
          from: account,
          value: String(totalAmount),
        });
    }
    async function mint0() {
      var _pid = "0";
      var erc20address = await contract.methods.getCryptotoken(_pid).call();
      var currency = new web3.eth.Contract(TOKENABI, erc20address);
      var mintRate = await contract.methods.getNFTCost(_pid).call();
      var _mintAmount = Number(outvalue);
      var totalAmount = mintRate * _mintAmount;
      currency.methods.approve(NFTCONTRACT, String(totalAmount)).send({ from: account })
        .then(contract.methods.mintpid(account, _mintAmount, _pid).send({
          from: account

        },
          async function (error, transactionHash) {
            console.log("Transfer Submitted, Hash: ", transactionHash)
            let transactionReceipt = null
            while (transactionReceipt == null) {
              transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
              await sleep(expectedBlockTime)
            }
            window.console = {
              log: function (str) {
                var out = document.createElement("div");
                out.appendChild(document.createTextNode(str));
                document.getElementById("txout").appendChild(out);
              }
            }
            console.log("NFT TRANSFERED", transactionReceipt);
          }));
    }
    const refreshPage = () => {
      window.location.reload();
    }
    return (

      <div className="App">
        <header className="App-header">
          <div className='container' style={{ background: "transparent", marginTop: "10px", border: "0", }}>
            <div className="row">
              <div className="col ">
                <Button variant="default" href="" style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>OPENSEA</Button>
                <Button variant="default" href="" style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>QUICKSWAP</Button>
                <Button variant="default" href="https://twitter.com/MinerPlusNFT/" style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>TWITTER</Button>
                <Button variant="default" href="https://discord.com/invite/uhjbsthuw3/" style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }} >DISCORD</Button>
                <Button variant="default" href="" style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }} >MINER PLUS INFORMATION</Button>
              </div></div>
            <div className="card nftminter" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px", marginBottom: "10px", }}>
              <label htmlFor="floatingInput" style={{ marginTop: "auto", marginBottom: "-2px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >MINER PLUS NFT MINT PORTAL LETS CONNECT</label>
            </div>
            <div className='col'>
              <div className='nftminter' style={{ background: "transparent", marginTop: "auto", border: "0", }}>
                <form>
                  <div className="row pt-3">
                    <div>
                      <Button variant="default" onClick={connectwallet} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "auto", marginTop: "auto" }} >Connect Your Wallet</Button>
                    </div>
                    <div style={{ marginTop: "10px", fontWeight: "auto", fontSize: "18px" }}>
                      <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                        <label id='wallet-address' style={{ margin: "auto", fontWeight: "auto", fontSize: "12px" }}>Your Wallet Address</label>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="floatingInput" style={{ marginTop: "auto", marginBottom: "auto", color: "#fff", weight: "bold", fontSize: "15px" }} >Select Quantity</label>
                    </div></div>
                  <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                    <ButtonGroup size="lg"
                      aria-label="First group"
                      name="amount"
                      onClick={nftamount => this.handleNFT(nftamount, "value")} >
                      <Button variant="default" style={{ color: "#ccc", backgroundColor: "#ffffff10", marginTop: "auto" }} value="1">1</Button>
                      <Button variant="default" style={{ color: "#ccc", backgroundColor: "#ffffff10", marginTop: "auto" }} value="2">2</Button>
                      <Button variant="default" style={{ color: "#ccc", backgroundColor: "#ffffff10", marginTop: "auto" }} value="3">3</Button>
                      <Button variant="default" style={{ color: "#ccc", backgroundColor: "#ffffff10", marginTop: "auto" }} value="4">4</Button>
                      <Button variant="default" style={{ color: "#ccc", backgroundColor: "#ffffff10", marginTop: "auto" }} value="5">5</Button>
                    </ButtonGroup>
                  </div>
                  <div className="row px-2 pb-2 row-style">
                    <div className="col ">
                      <div className="nftsB">
                        <Button variant="default" onClick={mint} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "10px", marginBottom: "auto" }}>MATIC</Button>
                        <Button variant="default" onClick={mint0} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "10px", marginBottom: "auto" }}>PLUS TOKEN</Button>
                      </div></div></div>
                  <label id="lable" style={{ marginBottom: "5px", fontWeight: "300", fontSize: "15px" }}>HAS MINTED {balance.result} FROM 7.777 </label>
                </form>
              </div>
            </div>
            <div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px", marginBottom: "10px", }}>
              <label htmlFor="floatingInput" style={{ marginTop: "auto", marginBottom: "-2px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >APPROVE YOUR WALLET FOR STAKED</label>
            </div>
            <div className='coli'>
              <div className='nftstaker' style={{ background: "transparent", marginTop: "auto", border: "0", }}>
                <form style={{ fontFamily: "SF Pro Display" }} >
                  <div className="row px-3">
                    <div className="nftsB">
                      <div className="row">
                        <div className="col ">
                          <Button variant="default" onClick={enable} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginBottom: "auto", marginTop: "15px" }} >APPROVE WALLET</Button>
                        </div></div></div>
                    <div className="nftsB">
                      <div className="row">
                        <div className="col ">
                          <Button variant="default" onClick={verify} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>CHECK YOUR VAULT</Button>
                          <Button variant="default" onClick={rewardinfo} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>CHECK YOUR REWARDS</Button>
                          <Button variant="default" onClick={tokenbal} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }} >CHECK YOUR PLUS BALANCE</Button>
                          <Button variant="default" onClick={claimit} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }}>CLAIM YOUR REWARDS</Button>
                          <Button variant="default" onClick={unstakeall} style={{ color: "#ccc", backgroundColor: "#ffffff10", margin: "5px", marginTop: "15px" }} >UNSTAKED ALL</Button>
                        </div></div></div>
                    <div className="col nftstaker" style={{ border: "0", background: "transparent", borderRadius: "5px", marginTop: "10px", marginBottom: "4px", }}>
                      <form className="stakingrewards" >
                        <table className='table mb-3' style={{ border: "0", borderRadius: "5px", marginTop: "10px", marginBottom: "7px", }}>
                          <div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "7px" }}>
                            <tr>
                              <label htmlFor="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "12px" }} >YOUR NFT STAKED ID
                                <div className="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                                  <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "300", textShadow: "1px 1px 2px #000000" }} id='yournfts'>ONLINE</span></div></label>
                            </tr></div><div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px" }}>
                            <tr>
                              <label htmlFor="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "12px" }} >YOUR NFT STAKED TOTAL
                                <div className="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                                  <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "300", textShadow: "1px 1px 2px #000000" }} id='stakedbalance'>ONLINE</span></div></label>
                            </tr></div>
                        </table>
                      </form>
                    </div>
                    <div className="col nftstaker" style={{ border: "0", background: "transparent", borderRadius: "5px", marginTop: "10px", marginBottom: "4px" }}>
                      <form className="stakingrewards" >
                        <table className='table mb-3' style={{ border: "0", borderRadius: "5px", marginTop: "7px", marginBottom: "7px", }}>
                          <div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px" }}>
                            <tr>
                              <label htmlFor="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "12px" }} >YOUR PLUS TOKEN BALANCE
                                <div className="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                                  <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "300", textShadow: "1px 1px 2px #000000" }} id='Tokbal'>ONLINE</span></div></label>
                            </tr></div>
                          <div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "#ffffff10", marginTop: "10px" }}>
                            <tr>
                              <label htmlFor="floatingInput" style={{ marginTop: "-9px", color: "#fff", weight: "bold", border: "0px", fontSize: "12px" }} >YOUR REWARDS TOTAL
                                <div className="card nftstaker" style={{ width: "150px", height: "150px", borderRadius: "5px", background: "#ffffff10", margin: "auto" }}>
                                  <span style={{ backgroundColor: "transparent", fontSize: "21px", color: "#fff", fontWeight: "300", textShadow: "1px 1px 2px #000000" }} id='earned'>ONLINE</span></div></label>
                            </tr></div>
                        </table>
                      </form>
                    </div>
                  </div></form>
              </div></div>
            <div className="card nftstaker" style={{ borderBottom: "0px", borderRadius: "5px", background: "#ffffff10", marginTop: "10px", marginBottom: "10px", }}>
              <label htmlFor="floatingInput" type="Button" onClick={refreshPage} style={{ marginTop: "1px", marginBottom: "1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >RELOAD YOUR NFT PORTAL</label>
            </div></div><div className='container' style={{ background: "transparent", marginTop: "auto", border: "0", }}></div>
        </header></div>
    );
  }
}
export default App;
