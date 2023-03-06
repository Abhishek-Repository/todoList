const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

//MongoDB to store data
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "item",
  itemsSchema
);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit + button to add new item"
});

const item3 = new Item({
  name: "<-- hit this to delete item>"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

app.set('view engine', 'ejs');

app.get("/", function(req, res){
  const day = date.getDate();
  Item.find({})
    .then(function (foundItems){

      if(foundItems.length === 0) {
        Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
      }
      else {
        res.render("list",{listTitle: day, newListItems: foundItems});
      }
    })
    .catch(function (err) {
      console.log(err);
    });

});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName})
  .then(function(foundList){
    if(!foundList){
      //create list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
    } else {
      // show existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(err){
    console.log(err);
  });
  
});

app.post("/", function(req,res){
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/");
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      console.log("Successfully deleted the item ");
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/");

})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000");
});
