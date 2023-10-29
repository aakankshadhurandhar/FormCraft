const Models = require('../models')
module.exports = async(req, res, next) => {
    console.log(req);
    if (req.user) {
      const userEmail = req.user; 
      //find user id in user model
      const userID = await Models.Users.find({email: userEmail})
      console.log(req.form.userID.toHexString());
      console.log(userID[0]._id.toHexString());
      console.log(req.form.userID.toHexString()==userID[0]._id.toHexString());

    } else {
      // Handle cases where req.user is not defined (unauthenticated requests)
    }
  
    // Continue with your logic
    next();
  };