const {User, Admin, Applicant, Competition} = require('../models/schemas');
const timeutils = require('../timeutensils.js');
const upload  = require('../multerConfig'); // Adjust the path as needed


const get_home = (req, res) => {
  const user = req.session.user;
  const searchQuery = req.query.search;

  if (searchQuery) {
    Competition.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive title search
          { genre: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive genre search
        ]
    })
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render('competitions/home', { title: "Search Results", comps: result, user: user });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
  } else {
    Competition.find()
    .populate("host")
    .sort({ createdAt: -1 })
    .then((result) => {
        res.render('competitions/home', { title: "All Competitions", comps: result, user: user });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    });
  }
};


const get_applyhost = (req, res) => {
  const user = req.session.user;
  res.render('competitions/applyhost', { title: 'Apply for Host', user });
};


const post_applyhost = async (req, res) => {
  try {

    const { reason } = req.body;
    const user = req.session.user; 

    const newApplicant = new Applicant({
        user: user._id,
        username: user.username,
        email: user.email,
        reason
    });

    await newApplicant.save();

    res.status(201).json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const get_comp = (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  Competition.findById(id)
    .populate("participants")
    .populate("host")
    .populate({
      path: "judges",
      populate: { path: "user" } 
    })
    .then((result) => {
      // Sort announcements in descending order based on createdAt field
      // sorting kinda messes up the whole thing unfortunately cz i used index to get announcements instead of the announcement ID Sighhhhhh
      // result.announcements.sort((a, b) => b.createdAt - a.createdAt);
      res.render('competitions/compDets', { comp: result, getTimeSince: timeutils.getTimeSince, getTimeLeft: timeutils.getTimeLeft, title: result.title, user: user });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).render('404', { title: "Competition not found" });
    });
};


const get_createcomp = function(req, res){
  const user = req.session.user;
  res.render('competitions/createcomp', { title:"Create", user:user });
};


const post_createcomp = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { title, genre, about } = req.body;

    const user = await User.findById(userId);

    const newCompetition = new Competition({
        title,
        genre,
        about,
        host: user._id,
        hostUsername: user.username,
    });

    newCompetition.judges.push({ user: user._id, judgeName: user.username,  status: 'accepted' });

    await newCompetition.save();

    user.competitions.push(newCompetition._id);
    await user.save();

    res.redirect(`/competitions/home`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const post_joinCompetition = async (req, res) => {
  try {
    const { compId } = req.body;
    const userId = req.session.user._id;

    await User.findByIdAndUpdate(userId, { $addToSet: { competitions: compId } });

    await Competition.findByIdAndUpdate(compId, { $addToSet: { participants: userId } });

    const competition = await Competition.findById(compId).populate('host');

    // Create notification 
    const notificationContent = `${req.session.user.username} has joined ${competition.title}`;

    // Update host's notifications
    await User.findByIdAndUpdate(competition.host._id, { $push: { notifications: { type: 'join', content: notificationContent, createdAt: Date.now() } } });

   
    res.redirect(`/login`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const get_myComps = async (req, res) => {
  try {
    const userID = req.params.userId;

    const user = await User.findById(userID).populate('competitions');

    // console.log(user);
    
    res.render('competitions/myComps', { user, title: "My competitions" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const post_rate = async (req, res) => {
  const { hostId } = req.params;
  const { rating, review } = req.body;
  const currentUserId = req.session.user._id;

  try {

      const host = await User.findById(hostId);
      const currentUser = await User.findById(currentUserId);

      if (!host || !currentUser) {
          return res.status(404).render('404', { title: 'User not found' });
      }

      host.reviews.push({
          reviewerId: currentUser._id,
          reviewerUsername: currentUser.username,
          content: review,
          rating: rating
      });

      // Calculate the new average rating
      const totalRatings = host.reviews.reduce((total, review) => total + review.rating, 0);
      const avgRating = totalRatings / host.reviews.length;
      host.avgRating = avgRating;

      await host.save();

      res.status(200).json({ message: 'Rating and review submitted successfully' });
  } catch (error) {
      // Handle errors
      console.error('Error submitting rating and review:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  get_home,
  get_comp,
  get_createcomp,
  get_applyhost,
  post_applyhost,
  post_createcomp,
  post_joinCompetition,
  get_myComps,
  post_rate

};