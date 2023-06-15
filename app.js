// deno-lint-ignore-file no-unused-vars prefer-const

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGODB);
  console.log("Successfully connected to database!");
}

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Data inserted");
      }).catch(function (error) {
        console.log("This is the error: " + error);
      });
    }

    res.render("list", { listTitle: "Today", newListItems: foundItems });
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundItems) {
    if (!foundItems) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: customListName,
        newListItems: foundItems.items,
      });
    }
  });
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + foundList.name);
    });
  }
});

app.post("/delete", function (req, res) {
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(deleteId).then(function () {
      console.log("Deleted successfully!");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({ name: listName }, {
      $pull: { items: { _id: deleteId } },
    }).then(function (foundList) {
      res.redirect("/" + listName);
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
