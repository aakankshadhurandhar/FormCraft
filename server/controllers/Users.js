const passport = require('passport')
const { validateUserRegisterSchema } = require('../utils/validations')
const Models = require('../models')
const redis = require('../services/redis')
const { sendVerificationEmail } = require('../services/mail')
const { generateOneTimeToken } = require('../utils/jwtEncode')

// Registers a new user
module.exports.registerUser = async (req, res, next) => {
  let { username, email, password } = req.body

  username = username.toLowerCase()
  email = email.toLowerCase()

  // Validate user input
  const { error } = validateUserRegisterSchema({ username, email, password })
  if (error) {
    return res.sendBadRequest('Validation failed', error)
  }

  passport.authenticate('signup', { session: false }, async (err, user) => {
    try {
      if (err) {
        // Handle errors (e.g., duplicate email)
        return res.sendBadRequest('Error during signup', err)
      }

      if (!user) {
        // Handle failed signup (e.g., duplicate email)
        return res.sendBadRequest('Signup failed, user already exists')
      }
      // User was successfully created
      return res.sendResponse('User registered successfully', user, 201)
    } catch (error) {
      return res.sendInternalServerError(error)
    }
  })(req, res, next)
}

// Logs in a user
module.exports.loginUser = (req, res) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return res.sendInternalServerError(err)
    }
    if (!user) {
      return res.sendBadRequest('Incorrect loginID or password', info)
    }

    const token = user.generateToken()
    return res.sendResponse('User logged in successfully', { token })
  })(req, res)
}

// logoutUser
module.exports.logoutUser = async (req, res) => {
  // get the token from the header
  const token = req.headers.authorization

  //add it to the redis blacklist
  await redis
    .set(token, 'blacklisted', 'EX', 60 * 60 * 24 * 7)
    .then(() => {
      return res.sendSucces()
    })
    .catch((err) => {
      return res.sendInternalServerError(err)
    })
}


module.exports.verifyUser = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.sendBadRequest('No token provided');
  }

  try{

    // find the token with type verify and populate the user
    const Token  = await Models.Token.findOne({ token, type: 'verify' }).populate('user');

    if (!Token) {
      return res.sendBadRequest('Invalid token');
    }
    // check if the token has expired
    if (Token.expiresAt < Date.now()) {
      return res.sendBadRequest('Token expired');
    }
    // check if the user is already verified
    if (Token.user.verified) {
      return res.sendBadRequest('User already verified');
    }

    // mark the user as verified
    await Token.user.updateOne({ verified: true });

    // delete the token
    await Token.deleteOne();
    return res.sendSuccess('User verified successfully');
  }catch(err){
    res.sendInternalServerError(err)
  }

}

// send a verification email to the user
module.exports.verificationEmailRequest = async (req, res) =>{

  const user = await Models.Users.findById(req.user.id);

  if (user.verified) {
    return res.sendBadRequest('User already verified');
  }
  const userToken = user.generateOneTimeToken();
  await Models.Token.create({
    token: userToken,
    user: user.id,
    type: 'verify',
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  sendVerificationEmail(user.email, user.username, userToken);
  return res.sendSuccess('Verification email sent');
}
