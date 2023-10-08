const httpStatus = require("http-status-codes");
const { isActiveRoute } = require("../utils/helpers");

exports.notFoundError = (req, res) => {
  let errorCode = httpStatus.StatusCodes.NOT_FOUND;
  res.status(errorCode);
  res.render("error", { isActiveRoute, route: "" });
};

exports.serverError = (error, req, res, next) => {
  let errorCode = httpStatus.StatusCodes.INTERNAL_SERVER_ERROR;
  console.log(`ERROR occurred: ${error.stack}`);
  res.status(errorCode);
  res.send(`${errorCode} | Sorry, the server is broken try again later.`);
};
