const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anubhavshail12:admin123@cluster0.p1cyvi7.mongodb.net/tododb?retryWrites=true&w=majority");

const itemschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const listschema = mongoose.Schema({
    name: String,
    item: [itemschema]
})

const Item = mongoose.model("Item", itemschema);
const List = mongoose.model("List", listschema);


const workout = new Item({name: "workout"});
const study = new Item({name: "study"});

const lists = [workout, study];

app.get("/", function(req, res){
    // let today = new Date();
    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // }

    //let day = today.toLocaleDateString("en-US", options);

    let day = "Today";

    Item.find().then(function(item){
        if(item == 0){
            Item.insertMany(lists).then(function(item){
                console.log(item);
            })
            .catch(function(err){
                console.log("Error");
            })
            res.redirect("/");
        }
        else{
            res.render("list", {wday: day, items: item});
        }    
    })

    
})

app.get("/:topic", function(req, res){
    const listname = _.capitalize(req.params.topic);

    const newlist = new List({name: listname, item: lists});

    List.findOne({name:listname}).then(function(list){
        if(!list){
            newlist.save();
            res.redirect("/" +listname);
        }
        else{
            res.render("list", {wday: listname, items: list.item});
        }
    })

})

app.post("/", function(req, res){
    const list = req.body.newItem;
    const listname = req.body.button;

    const newlist = new Item({name: list});

    if(listname == "Today"){
        newlist.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listname}).then(function(list){
            list.item.push(newlist);
            list.save();
            res.redirect("/" +listname);
            
        });
    }
})

app.post("/delete", function(req, res){
    const id = req.body.checkbox;
    const listname = req.body.listname;

    if(listname == "Today"){
        Item.deleteOne({_id: id}).then(function(){
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name: listname}, {$pull: {item: {_id: id}}}).then(function(){
            res.redirect("/"+ listname);
        })
    }
})

app.get("/about", function(req, res){
    res.render("about");
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
})