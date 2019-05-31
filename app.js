//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//database connection and add data to databse
mongoose.connect("mongodb+srv://admin-chamoda:test123@cluster0-y4klm.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const itemSchema ={
  name:String
};
const Item = mongoose.model("Item", itemSchema);

//-------------------add items to normal item collection------------
const itemOne = new Item({
  name:"New List"
});
const itemTwo = new Item({
  name: "Click + to add a item"
});
const itemThree = new Item({
  name: "<-- click this to delete a item"
});
const itemArray=[itemOne, itemTwo, itemThree];

//---------------------list schems-------------------------
const listSchema = {
  name:String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
    if (foundItems.length===0){
      Item.insertMany(itemArray, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("records added succesfully");
        }
      });
      res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });


});

app.get("/:paraseUrl", function(req, res){
  const enteredUrl = _.capitalize(req.params.paraseUrl);
  List.findOne({name:enteredUrl},function(err,foundLists){
    if (!foundLists){
      const addNewList = new List ({
        name:enteredUrl,
        items: itemArray
      });
      addNewList.save();
      res.redirect("/" + enteredUrl);
    }else{
        res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items});
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});




app.post("/", function(req, res){
    const newItem = req.body.newItem;
    const listName = req.body.list;
    const addedItem = new Item({
      name:newItem
    });
    if(listName==="Today"){
      addedItem.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName}, function(err, foundList){
        foundList.items.push(addedItem);
        foundList.save();
        res.redirect("/" + listName );
      });
    }



});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItem, function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull : {items:{_id:checkedItem}}}, function(err, foundItems){
      if(!err){
        res.redirect("/" +listName);
      }
    });
  }

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
