mongoose.connect("mongodb://localhost:27017/471")
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
      required:true
    }
    
  });
  
  const User = mongoose.model('users', userSchema);
  