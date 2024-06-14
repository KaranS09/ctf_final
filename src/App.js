import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import Token from "./token.json";
import Store from "./store.json";
import Challenge from "./challenge.json";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractAddress2, setContractAddress2] = useState("");
  const [contractAddress3, setContractAddress3] = useState("");
  const [loading, setLoading] = useState(false);

  const hint = process.env.REACT_APP_MY_HINT;

  async function requestAccount() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.log("Error connecting:", error);
      }
    } else {
      console.log("Metamask not detected");
    }
  }

  async function deployContract() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const factory = new ethers.ContractFactory(
        Token.abi,
        Token.bytecode,
        signer
      );

      const factoryStore = new ethers.ContractFactory(
        Store.abi,
        Store.bytecode,
        signer
      );

      const factoryChallenge = new ethers.ContractFactory(
        Challenge.abi,
        Challenge.bytecode,
        signer
      );

      setLoading(true);

      try {
        const contract = await factory.deploy();
        await contract.deployed();
        console.log("Contract deployed at address:", contract.address);
        setContractAddress(contract.address);

        const amount = "30";
        const tx = await contract.mint(walletAddress, amount);
        await tx.wait();
        console.log("Transfer successful: ", tx);

        const contract2 = await factoryStore.deploy(contract.address);
        await contract2.deployed();
        console.log("Contract 2 deployed at address:", contract2.address);
        setContractAddress2(contract2.address);

        const amount1 = "20";
        const tx1 = await contract.approve(contract2.address, amount1);
        await tx1.wait();
        console.log("Approval successful: ", tx1);

        const amount2 = "10";
        const tx2 = await contract2.deposit(amount2);
        await tx2.wait();
        console.log("Deposit successful: ", tx2);

        const str = "sugoi";
        const contract3 = await factoryChallenge.deploy(
          contract.address,
          contract2.address,
          hint
        );
        await contract3.deployed();
        console.log("contract3 deployeed at : ", contract3.address);
        setContractAddress3(contract3.address);
      } catch (error) {
        console.error("Error deploying contract:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  return (
    <div className="App">
      <video autoPlay loop muted className="video-background">
        <source src="vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <header className="App-header">
        <section>
          <h2>Grains of Sand</h2>
        </section>
        <button onClick={requestAccount}>Connect Wallet</button>
        <h3>Wallet Address: {walletAddress}</h3>
        <button onClick={deployContract}>Deploy Contract</button>
        {loading ? (
          <h3>
            <div className="loading-animation">Loading...</div>
          </h3>
        ) : (
          <h3>
            {contractAddress && (
              <p>Token Contract Address: {contractAddress}</p>
            )}
            {contractAddress2 && (
              <p>Store Contract Address: {contractAddress2}</p>
            )}
            {contractAddress2 && (
              <p>Challenge Contract Address: {contractAddress3}</p>
            )}
          </h3>
        )}
      </header>
    </div>
  );
}

export default App;
