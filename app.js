//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aadarsh:aAdarsHh7420@cluster0.gu2ll.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name : {
    type : String
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Buy Food"
});

const item2 = new Item ({
  name : "Cook Food"
});

const item3 = new Item ({
  name : "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name : String,
  item : [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err,dragon){

    if(dragon.length === 0) {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Successfully inserted the documents!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: dragon});
    }
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,dragon){
    if(!err){
      if(!dragon){
        const list = new List({
          name : customListName,
          item : defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: dragon.name, newListItems: dragon.item});
      }
    }

  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name : itemName
  });

  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err,dragon){
        dragon.item.push(newItem);
        dragon.save();
        res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (!err){
        console.log("Successfully deleted checked item!");
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name:listName},{$pull: {item: {_id : checkedItemId}}},function(err,dragon){
      if(!err){
        console.log("Successfully deleted checked listitem!");
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
