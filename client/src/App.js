import React, { Component, useState } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    itemManager: null,
    item: null,
    cost: 0,
    itemName: ""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log("web3", accounts);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(ItemManagerContract.networks[networkId].address);

      const itemManager = new web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[networkId] &&
          ItemManagerContract.networks[networkId].address
      );
      console.log(itemManager);
      const item = new web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[networkId] &&
          ItemContract.networks[networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, itemManager, item });
      this.listenToPaymentEvent();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // runExample = async () => {
  //   try {
  //     const { accounts, contract } = this.state;

  //     // Stores a given value, 5 by default.
  //     await contract.methods.set(5).send({ from: accounts[0] });

  //     // Get the value from the contract to prove it worked.
  //     const response = await contract.methods.get().call();
  //     // Update state with the result.
  //     this.setState({ storageValue: response });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  listenToPaymentEvent = () => {
    const self = this;
    if (!this.state.itemManager) return;
    console.log("payment event");
    this.state.itemManager.events
      .SupplyChainStep()
      .on("data", async function(event) {
        console.log(event);
        const { _itemIndex, _step, _itemAddress } = event?.returnValues;
        console.log(_step);
        if (_step == 1)
          alert(`item ${_itemIndex} has been paid, delivered now!`);
        if (_step == 0)
          alert(
            `item ${_itemIndex} has just been created, send ${self.state?.cost} Wei to ${_itemAddress}!`
          );
      });
  };

  handleCreateNewItem = async () => {
    try {
      const { itemManager, accounts } = this.state;
      const cost = document.querySelector("#cost").value;
      const itemName = document.querySelector("#itemName").value;
      this.setState({ ...this.state, cost, itemName });
      console.log(itemName, cost);
      const isOwner = await itemManager.methods.isOwner().call();
      // const owner = await itemManager.methods.owner().call();

      console.log("isOwner", isOwner);
      // console.log("owner", owner);
      await itemManager.methods
        .createItem(itemName, parseInt(cost))
        .send({ from: accounts[0] });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Event Trigger / Supply Chain Example</h1>
        <h2>Items</h2>
        <h2>Add Items</h2>
        <div>
          Cost in Wei:
          <Input id="cost" name="cost" />
        </div>
        <div>
          Item identifier:
          <Input id="itemName" name="itemName" />
        </div>
        <button type="button" onClick={this.handleCreateNewItem}>
          Create new item
        </button>
      </div>
    );
  }
}

function Input(props) {
  const { name, id } = props;
  const [input, setInput] = useState();
  const handleInputChange = event => {
    const target = event.target;
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setInput(value);
  };
  return (
    <input
      id={id}
      type="text"
      name={name}
      value={input}
      onChange={handleInputChange}
    />
  );
}

export default App;
