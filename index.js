const express = require("express");
const path = require("path");
const logger = require("morgan");
const compression = require("compression");
const cookieSession = require("cookie-session");
const upload = require("express-fileupload");
const layouts = require("express-ejs-layouts");
const dotenv = require("dotenv");

dotenv.config();

const indexRouter = require("./routes/index.router");
const usersRouter = require("./routes/users.router");
const contactsRouter = require("./routes/contacts.router");
const errorController = require("./controllers/error.controller");

const app = express();
const PORT = process.env.PORT || 3000;

// Settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.disable("x-powered-by");

// Middlewares
app.use(compression());
app.use(upload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(layouts);
app.use(
  cookieSession({
    keys: [process.env.COOKIE_KEY],
  })
);

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/contacts", contactsRouter);

// Errors
app.use(errorController.notFoundError);
app.use(errorController.serverError);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
