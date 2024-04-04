const express=  require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const compRoutes = require('./routes/compRoutes');


const app = express();
const port = 3000;
mongoose.connect("mongodb+srv://raiyanwasisiddiky:Wasi1to6@471db.75x1hsi.mongodb.net/")
  .then((result) =>{
    app.listen(port, ()=>{
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err)=>{
    console.log(err);
  });


app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/competition.ejs", (req, res) => {
  res.render("competition.ejs");
});
app.get("/questions.ejs" , (req, res) => {
  res.render("questions.ejs");
});

app.get("/createaccount.ejs" , (req, res) => {
  res.render("createaccount.ejs");
  //dekhte hobe jodi email  agei theke ase naki
  
});
app.get("/index.ejs", (req, res) => {
  res.render("index.ejs");

});

app.use('/', compRoutes);

app.use((req, res)=>{
  res.status(404).render('404');
});


