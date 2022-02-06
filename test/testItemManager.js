const { assert } = require("console");

const ItemManager = artifacts.require("./ItemManager.sol");

contract("ItemManager", (accounts) => {
  it("...should be able to add an Item", async () => {
    let instance = await ItemManager.deployed();
    const itemName = "test1";
    const itemPrice = 100;

    const result = await instance.createItem(itemName, itemPrice, {
      from: accounts[0],
    });
    // assert.equal(result.logs[0].args._itemIndex, 0, "It's not the first item");
    const item = await instance.items(0);
    console.log(item);
  });
});
