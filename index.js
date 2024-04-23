import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/471");
app.use(express.static("public"));
app.use(bodyParser.json());
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
  },
  rank: {
    type: Number,
    required:true,
    default:0
  },
  rating:{
    type:Number,
    require:false,
    default:0
  },
  count: {
    type: Number,
    required:false,
    default:0
  },
  review: {
    reviewText: [{
      type: String,
      required: false
    }],
    reviewer: {
      type: String,
      required: false
    }
  }
});


const User = mongoose.model('users', userSchema);





const competitionSchema = new mongoose.Schema({
  question: [{
    type: String,
    required: true
  }],
  
 
  genre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  addedJudges: [{  
    type: String, 
    required: true
  }]
});

 

const question = mongoose.model('competitions', competitionSchema);

const applicantSchema = new mongoose.Schema({
  details: {
    type: mongoose.Schema.Types.Mixed  
  }
});


const Applicant = mongoose.model('applicant', applicantSchema);


const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: false
  },
  score: {
    type: Number,
    default: 0
  
  }
});

const Score = mongoose.model('scores', scoreSchema);


const rank = new mongoose.Schema({
  

  email: {
    type: String,
    required: true
  },

  rank: {
    type: Number,
    default: 0
  
  }
});

const ranking = mongoose.model('rank', scoreSchema);


const submissionSchema = new mongoose.Schema({
  organizerEmail: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true
  },
  submissions: [{
      type: String,
      required: true
  }],
  vote: {
      numberOfVotes: {
          type: Number,
          default: 0
      },
      votedBy: [{
          type: String
      }]
  }
});

const Submission = mongoose.model('Submission', submissionSchema);








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
          if (user.rank==0 || user.rank==2){
            Score.find().sort({ score: -1 }).limit(5).exec()
            .then(scores => {
              console.log("Successful Login");
              res.render('homepage.ejs', { nam: user.cname, email: user.email, scores: scores ,rating: user.rating});
            })
          }

          else{

            Applicant.find({})
            .then(documents => {
              console.log('All documents:', documents);
              res.render("Adminview.ejs",{obj:documents})
            })
            .catch(err => {
              console.error('Error retrieving documents:', err);
            });
          
          }


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
      dob:req.body.dateofbirth,
      rank:0
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





app.post("/authenticate", (req, res) => {

  res.render("authentication.ejs");


});

app.post("/authenticate-to-admin", (req, res) => {
  const newApplicantDetails = {
    name: req.body.name,
    email: req.body.email,
    title: req.body.title,
    purpose: req.body.purpose
  };

  const newApplicant = new Applicant({

    details:newApplicantDetails

  }
  );

  newApplicant.save()
    .then(savedApplicant => {
      console.log('New details appended to applicant:', savedApplicant);
      res.status(200).send('New details appended to applicant');
    })
    .catch(error => {
      console.error('Error appending new details:', error);
      res.status(500).send('Error appending new details');
    });
});




app.post("/approve", (req, res) => {
  User.findOneAndUpdate({email:req.body.email},{rank:2})
  .catch(err=>{

    console.log("Error Approving")

  })
  .then(user =>{
    console.log("Approved Successfully")

  });

});


app.post("/participate",(req, res) => {
  question.findOne({ email:req.body.organiser_email })
  .catch(err => {
    console.error('Error finding user', err);
    res.render("index.ejs");
  })

  .then(user => {
    
    console.log(user);
    res.render("participate.ejs", { question: user.question, participant_email:req.body.participant_email ,organiser_email:req.body.organiser_email });
    
})
});

app.post("/createcompetition",(req, res) => {
  User.findOne({email:req.body.email})
  .then(user =>{
    if(user.rank==2){
      res.render("createcompetition.ejs",{email:req.body.email});
    }
    else{
      res.send("User not Authorized.Please Apply to Admin for Authorisation");
    }
    
  })
  .catch(err=>{
    console.log("Error ");

  });



});

app.post("/setquestion",(req, res) => {
  // console.log(req.body['judges-emails'],req.body.email,req.body.title,req.body.genre); 
  res.render("competition.ejs",{email:req.body.email,title:req.body.title,genre:req.body.genre,judge:req.body['judges-emails']});

});

app.post("/addques", (req, res) => {
  console.log(req.body);
  const newq = new question({
    question: req.body.questions,
    email:req.body.email,
    genre:req.body.genre,
    addedJudges:req.body.judge
  });

  newq.save()
    .then(newq => {
      console.log("New competition saved");
      res.status(200).send("New competition saved");
    })
    .catch(error => {
      console.error("Error saving competition:", error);
      res.status(500).send("Error saving competition");
    });
});



app.post("/submit_questions", (req, res) => {

      const participantEmail = req.body.participant_email;
      const answersArray = req.body.answers.split(',');
      const newSubmission = new Submission({
      email: participantEmail,
      submissions: answersArray,
      organizerEmail:req.body.organiser_email
  });
  
  newSubmission.save()
      .then(savedSubmission => {
          console.log("New submission saved:", savedSubmission);
          User.findOne({email:req.body.organiser_email})
          .then(users => {
            res.render("rating.ejs",{participant_email:participantEmail,organiser_email:req.body.organiser_email,rating: users.rating,count:users.count})

          })
          .catch(err => {
            console.error("Error:", err)
            res.status(500).send("Error ");
          });
        
      })
      .catch(error => {
          console.error("Error saving submission:", error);
          res.status(500).send("Error saving submission");
      });
  
  
});



app.post("/view-competition", (req, res) => {
  question.find().exec()
    .then(comps => {
      console.log("Successful Search");
      res.render('viewcompetitonlist.ejs', { competition: comps ,userEmail:req.body.email});
    })
    .catch(err => {
      console.error("Error:", err);
      res.status(500).send("Error fetching competitions");
    });
});


// app.post("/my-competitions", (req, res) => {
//   question.find().exec()
//     .then(comps => {
//       res.render('viewcompetitonlist.ejs', { competition: comps });
//     })
//     .catch(err => {
//       console.error("Error:", err);
//       res.status(500).send("Error fetching competitions");
//     });
// });





app.post("/rate", (req, res) => {
  console.log(req.body.email)
  User.findOne({email:req.body.organiser_email})
  .then(users => {
    res.render('rating.ejs', { email: users.email,rating: users.rating,count:users.count});
  })
  .catch(err => {
    console.error("Error:", err)
    res.status(500).send("Error ");
  });

});


app.post("/submit-review", (req, res) => {
  console.log(req.body.email)
  User.findOne({ email: req.body.organiser_email })
    .then(user => {


        let newRating = (user.rating + parseInt(req.body.rating)) / (parseInt(user.count) + 1);
        let newCount = user.count + 1;
        console.log(req.body.review)
        const new_review= user.review.reviewText.push(req.body.review)

        User.findOneAndUpdate(
          { email: req.body.organiser_email  },
          { rating: newRating, count: newCount, 'review.reviewText': user.review.reviewText },
        )
        .then(() => {
          console.log("Rating and count updated successfully");
          res.status(200).send("Rating and count updated successfully");
        })
        .catch(err => {
          console.error("Error updating rating and count:", err);
          res.status(500).send("Error updating rating and count");
        });
    })
    .catch(err => {
      console.error("Error finding user:", err);
      res.status(500).send("Error finding user");
    });
});

app.post("/profilepage", (req, res) => {
  console.log(req.body.email)
  User.findOne({ email: req.body.email })
    .then(user => {


      res.render('profilepage.ejs', { name: user.cname,rating:user.rating,count:user.count,reviews:user.review });
   
    })
    .catch(err => {
      console.error("Error finding user:", err);
      res.status(500).send("Error finding user");
    });
});

app.post("/judge", (req, res) => {
  question.findOne({ email: req.body.organiser_email })
    .then(user => {
      Submission.find().exec()

      .then(submissions => {
  
        
        res.render('judge.ejs', { submissions:submissions,organiser_email:req.body.organiser_email,participant_email:req.body.participant_email,questions:user.question});
     
      })
      .catch(err => {
        res.status(500).send("Error finding user in submissions");
      });

      
   
    })
    .catch(err => {
      res.status(500).send("Error finding user in questions db");
    });
});


app.post('/vote-for-submission', (req, res) => {

    Submission.findOneAndUpdate(
        { organizerEmail: req.body.organiser_email },
        { 
            $inc: { 'vote.numberOfVotes': 1 },
            $push: { 'vote.votedBy': req.body.participant_email }
        },
        { new: true }
    )
    .then(updatedSubmission => {
        if (!updatedSubmission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.status(200).json({ message: 'Vote submitted successfully', submission: updatedSubmission });
    })
    .catch(error => {
        console.error('Error voting for submission:', error);
        res.status(500).json({ message: 'Error voting for submission' });
    });
  });






app.post("/declare-winner", (req, res) => {
    const participantEmail = req.body.participant_email;

    Score.findOneAndUpdate(
        { email: participantEmail }, 
        { $inc: { score: 1 } }, 
        { new: true } 
    )
    .then(updatedScore => {
        if (!updatedScore) {
            return res.status(404).json({ message: 'Score document not found' });
        }
        res.status(200).json({ message: 'Score updated successfully', score: updatedScore });
    })
    .catch(error => {
        // Handle errors
        console.error('Error updating score:', error);
        res.status(500).json({ message: 'Error updating score' });
    });
});





app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


