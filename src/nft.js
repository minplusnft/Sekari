import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useEffect, useState } from 'react'
import 'sf-font';
import axios from 'axios';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, moralisapi, nftpng } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';

var web3 = null;
var account = null;
var vaultcontract = null;

const moralisapikey = "rjbVuX2UJ7f16EyEVSkXuOrObKN5zqQumKQP6wYh27aPsQyK0GGeBpgM9XB36KiX";
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
      chainId: 4,
      appLogoUrl: null,
      darkMode: true
    }
  },
};
const web3Modal = new Web3Modal({
  network: "rinkeby",
  theme: "dark",
  cacheProvider: true,
  providerOptions
});
export default function NFT() {
  const [apicall, getNfts] = useState([])
  const [nftstk, getStk] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    callApi()
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [])

  async function callApi() {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
    let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
    const nfts = await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=mumbai&format=decimal`), { headers: config })
      .then(output => {
        const { result } = output.data
        return result;
      })
    const apicall = await Promise.all(nfts.map(async i => {
      let item = {
        tokenId: i.token_id,
        holder: i.owner_of,
        wallet: account,
      }
      return item
    }))
    const stakednfts = await vaultcontract.methods.tokensOfOwner(account).call()
      .then(id => {
        return id;
      })
    const nftstk = await Promise.all(stakednfts.map(async i => {
      let stkid = {
        tokenId: i,
      }
      return stkid
    }))
    getNfts(apicall)
    getStk(nftstk)
    console.log(apicall);
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !apicall.length)
    return (
      <h1 className="text-3xl">Wallet Not Connected</h1>)
  return (
    <div className="App-header App ">

      <div className='container' style={{ background: "transparent", marginTop: "auto", border: "0", }}>
        <div className="card nftstaker" style={{ border: "0", borderRadius: "5px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
          <div className="card" style={{ background: "transparent", marginTop: "auto", border: "0", }}>
            <div className="ml-3 mr-3" style={{ display: "inline-grid", gridTemplateColumns: "repeat(3, 5fr)", columnGap: "auto" }}>
              {apicall.map((nft, i) => {
                var owner = nft.wallet.toLowerCase();
                if (owner.indexOf(nft.holder) !== -1) {
                  async function stakeit() {
                    vaultcontract.methods.stake([nft.tokenId]).send({ from: account });
                  }
                  return (
                    <div className="card mt-3" style={{ background: "transparent", marginBottom: "18px", marginRight: "10px", marginLeft: "10px", marginTop: "10px", boxShadow: "1px 1px 10px #000000", }} key={i} >
                      <div className="image-over">
                        <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="MPN PROJECT" />
                        <div style={{ background: "transparent", margin: "auto" }}>
                          <div className="card-body">
                            <input key={i} type="hidden" id='stakeid' value={nft.tokenId} />
                            <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                              <Button variant="default" style={{ background: "#ffffff10", display: "flex", margin: "auto", color: "#fff", fontSize: "13px" }} onClick={stakeit}>STAKE</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              }
              )}
            </div></div>
          <div className="card " style={{ background: "transparent", marginTop: "auto", border: "0", }}>
            <div className="ml-3 mr-3" style={{ display: "inline-grid", gridTemplateColumns: "repeat(3, 5fr)", columnGap: "auto" }}>
              {nftstk.map((nft, i) => {
                async function unstakeit() {
                  vaultcontract.methods.unstake([nft.tokenId]).send({ from: account });
                }
                return (
                  <div className="card mt-3" style={{ background: "#800000", marginBottom: "18px", marginRight: "10px", marginLeft: "10px", marginTop: "10px", boxShadow: "1px 1px 10px #000000", }} key={i} >
                    <div className="image-over">
                      <img style={{ position: 'absolute', top: '0.1rem', width: '60px' }} src='stamp.png' alt='MPN PROJECT'></img>
                      <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="MPN PROJECT" />
                      <div className="card-body">
                        <input key={i} type="hidden" id='nftstk' value={nft.tokenId} />
                        <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                          <Button variant="default" style={{ background: "#000", display: "flex", marginLeft: "10px", marginRight: "10px", color: "#fff", fontSize: "13px" }} onClick={unstakeit}>UNSTAKE</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}</div></div>
          <div className="header">
            <div className="card nftminter" style={{ border: "0", borderRadius: "0px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
              <div className="card nftminter" style={{ border: "0", borderRadius: "0px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                <div style={{ fontSize: '25px', borderRadius: '0px', color: "#ffffff", fontWeight: "300" }}>NFT STAKINGS POOLS REWARDS</div>
              </div>
              <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                <table className='table table-bordered table-dark' style={{ borderRadius: '0px', marginBottom: "0px" }} >
                  <thead className='thead-light'>
                    <tr>
                      <th scope="col">MINER PLUS NFT COLLECTION</th>
                      <th scope="col">DAILY & MONTHLY REWARDS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>BRONZE MPN</td>
                      <td className="amount" data-test-id="rewards-summary-ads">
                        <span className="amount"></span>&nbsp;<span className="currency">5 PLUS / D or 150 PLUS / M</span>
                      </td>
                    </tr>
                    <tr>
                      <td>SILVER MPN</td>
                      <td className="amount" data-test-id="rewards-summary-ac">
                        <span className="amount"></span>&nbsp;<span className="currency">9 PLUS / D or 270 PLUS / M</span>
                      </td>
                    </tr>
                    <tr>
                      <td>GOLD MPN</td>
                      <td className="amount" data-test-id="rewards-summary-ac">
                        <span className="amount"></span>&nbsp;<span className="currency">25 PLUS / D or 750 PLUS / M</span>
                      </td>
                    </tr>
                    <tr>
                      <td>DIAMOND MPN</td>
                      <td className="amount" data-test-id="rewards-summary-ac">
                        <span className="amount"></span>&nbsp;<span className="currency">45 PLUS / D or 1.350 PLUS / M</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="card nftminter" style={{ border: "0", borderRadius: "0px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                <div className="card nftminter" style={{ border: "0", borderRadius: "0px", background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                  <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>GOLD AND DIAMOND HODL REWARDS</div>
                </div>
                <div className="nftsB" style={{ background: "transparent", marginTop: "auto", marginBottom: "auto", }}>
                  <table className='table table-bordered table-dark' style={{ borderRadius: '0px', marginBottom: "0px" }} >
                    <thead className='thead-light'>
                      <tr>
                        <th scope="col">MONTHLY NO LIST / TRANSFER</th>
                        <th scope="col">REWARDS GUARANTED</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2 GOLD MPN</td>
                        <td className="amount" data-test-id="rewards-summary-ads">
                          <span className="amount"></span>&nbsp;<span className="currency">105 USDT - MAX 510 USDT</span>
                        </td>
                      </tr>
                      <tr>
                        <td>2 DIAMOND MPN</td>
                        <td className="amount" data-test-id="rewards-summary-ac">
                          <span className="amount"></span>&nbsp;<span className="currency">250 USDT - NO MAX INCREASE</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="card nftstaker" style={{ borderBottom: "0px", borderRadius: "5px", background: "transparent", marginTop: "20px", marginBottom: "0", }}>
            <label htmlFor="floatingInput" type="button" onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }} style={{ marginTop: "1px", marginBottom: "-1px", color: "#fff", weight: "bold", border: "0px", fontSize: "15px" }} >BACK TO TOP</label>
          </div>
        </div></div>
      <div className="nftsB" style={{ borderBottom: "0px", borderRadius: "5px", background: "transparent", marginTop: "20px", marginBottom: "0", }}>
      </div>
    </div>
  )
}
