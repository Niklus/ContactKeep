const db = require("@cyclic.sh/dynamodb");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const util = require("util");
const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

const scrypt = util.promisify(crypto.scrypt);

exports.getLogin = (req, res) => {
  const { name, key } = req.session;
  if (name && key) {
    return res.redirect("/contacts");
  }
  res.render("login", { email: "", message: "" });
};

exports.getSignup = (req, res) => {
  const { name, key } = req.session;
  if (name && key) {
    return res.redirect("/contacts");
  }
  res.render("signup", {
    errors: null,
    message: "",
    name: "",
    email: "",
    password: "",
  });
};

exports.getSignout = (req, res) => {
  req.session = null;
  res.redirect("/users/login");
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password: providedPassword } = req.body;

    const item = await db.collection("users").get(email);

    if (item?.props) {
      const [hashed, salt] = item.props.password.split(".");
      const hashedProvided = await scrypt(providedPassword, salt, 64);

      if (hashed === hashedProvided.toString("hex")) {
        req.session.id = item.props.id;
        req.session.name = item.props.name;
        return res.redirect("/contacts");
      }

      res.render("login", { email, message: "Wrong password try again" });
    } else {
      return res.render("login", {
        email,
        message: "Wrong email try again",
      });
    }
  } catch (err) {
    res.render("login", { email: "", message: err.message });
  }
};

exports.postSignup = [
  validateName,
  validateEmail,
  validatePassword,
  async (req, res) => {
    const { name, password, email } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("signup", {
        name,
        password,
        email,
        message: "Something is wrong",
        errors: errors.array(),
      });
    }

    console.log("Signup:", name, password, email);

    try {
      const item = await db.collection("users").get(email);

      if (item?.props) {
        return res.render("signup", {
          message: "E-mail already in use",
          name,
          password,
          email,
          errors: null,
        });
      }

      const salt = crypto.randomBytes(8).toString("hex");
      const buf = await scrypt(password, salt, 64);

      const { props } = await db.collection("users").set(email, {
        id: uuidv4(),
        name,
        email,
        password: `${buf.toString("hex")}.${salt}`,
      });

      console.log("New user created:", props);

      req.session.id = props.id;
      req.session.name = props.name;
      res.redirect("/contacts");
    } catch (err) {
      res.render("signup", {
        message: err.message,
        name,
        password,
        email,
        errors: null,
      });
    }
  },
];
