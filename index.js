import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/471")
app.use(express.static("public"))

const userSchema = new mongoose.Schema({
  cname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  question1: {
    type: String,
    required: true
  },
  question2: {
    type: String,
    required: true
  },
  question3: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  }
});

const User = mongoose.model('users', userSchema);






app.get("/", (req, res) => {
  res.render("index.ejs");

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

app.post("/sign", (req, res) => {
  const userEmail = req.body.email; 
  const userPassword = req.body.password; 

  User.findOne({ email: userEmail }, 'email password')
    .then(user => {
      if (!user) {
        console.log('User not found');
        res.render("index.ejs");
      }

      if (user.password !== userPassword) {
        console.log('Password does not match');
        res.render("index.ejs");

      }

    else{
      User.findOne({ email:userEmail})
      .then(user => {
          console.log("Successful Login");
          res.render('homepage.ejs',{nam:user.cname});
      })
      .catch(error => {
          console.error("Error finding user:", error);
      });
     

    }

      
    })
    .catch(err => {
      console.error('Error finding user:', err);
      res.render("index.ejs")
    });
});



app.post("/question",(req, res) => {
  //jodi amar database er question er sathe req.body.jeinaam disi mile taile ami pass render e jete dibo
  User.findOne({ email: req.body.email })
  .catch(err => {
    console.error('Error finding user', err);
    res.render("index.ejs");
  })
  .then(user => {
    if (!user) {
      console.log('User not found');
      res.render("index.ejs")
    }

    const question1 = user.question1;
    const question2 = user.question2;
    const question3 = user.question3;
    if(question1===req.body.birthday && question2===req.body.meal && question3===req.body.hotel){
      if(req.body.firsttry==req.body.secondtry){
        const newPassword=req.body.secondtry;
        User.findOneAndUpdate({ email: req.body.email }, { password: newPassword })
        .then(user => {
         
          console.log('Password updated successfully');
          res.render("index.ejs");
        })

        .catch(err => {
          console.error('Error updating password:');
          res.render("questions.ejs");
        });   

    }
    else{
      console.log("Passwords Dont Match Try Again");
      res.render("questions.ejs");
    }
    
  }

  else{
    console.log("wrong answer");
    res.render("questions.ejs");
  }
  })
  .catch(err => {
    console.error('Error finding user', err);
    res.render("index.ejs");
  });
});



app.post("/createaccount",(req, res) => {
  console.log(req.body)
  const newUser = new User({
    cname: req.body.cname,
    email: req.body.email,
    password: req.body.password,
    question1: req.body.birthdayquestion,
    question2: req.body.mealquestion,
    question3: req.body.hotelquestion,
    dob:req.body.dateofbirth
  });
  newUser.save()
  
  .then(savedUser => {
  console.log('User saved');
  res.render("index.ejs");
})
.catch(err => {
  console.log('Error saving user');
  res.render("createaccount.ejs")
});
  
  
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

