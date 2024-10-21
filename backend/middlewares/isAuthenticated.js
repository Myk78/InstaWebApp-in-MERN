const jwt = require("jsonwebtoken");

module.exports.isAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(403).json({
        message: "user is not Authenicate",
        success: false,
      });
    }
    const decode = await jwt.verify(token, process.env.JWT_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "unAuthorized user",
        success: false,
      });
    }
    req.id = decode.id;
    next();
  } catch (error) {
    console.log(error);
  }
};
