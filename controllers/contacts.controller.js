const db = require("@cyclic.sh/dynamodb");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const { validationResult } = require("express-validator");
const { validateName, validateEmail } = require("../utils/validators");
const { imageExists } = require("../utils/helpers");
const { isActiveRoute } = require("../utils/helpers");

const s3 = new AWS.S3();

exports.getContacts = async (req, res) => {
  const { name, id: user_id } = req.session;
  if (name && user_id) {
    try {
      const { results } = await db.collection("contacts").filter({ user_id });
      const items = results || [];
      return res.render("contacts", {
        name,
        items: items.map((item) => item.props),
        isActiveRoute,
        route: "contacts",
      });
    } catch (err) {
      return res.send(err.message);
    }
  }
  res.redirect("/users/login");
};

exports.getAddContact = async (req, res) => {
  const { name, id } = req.session;
  if (name && id) {
    return res.render("addContact", {
      message: "",
      name: "",
      phone: "",
      email: "",
      errors: null,
      isActiveRoute,
      route: "add",
    });
  }
  res.redirect("/users/login");
};

exports.getEditContact = async (req, res) => {
  const { name, id: user_id } = req.session;

  if (name && user_id) {
    const { key } = req.params;
    try {
      const { props } = await db.collection("contacts").get(key);

      return res.render("editContact", {
        message: "",
        ...props,
        errors: null,
        isActiveRoute,
        route: "edit",
      });
    } catch (err) {
      return res.send(err.message);
    }
  }
  res.redirect("/users/login");
};

exports.postAddContact = [
  validateName,
  validateEmail,
  async (req, res) => {
    const { id: user_id } = req.session;

    if (!user_id) {
      return res.send("You must login to perform this action!");
    }

    const { name, email, phone } = req.body;
    const img = req.files?.file?.data;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("addContact", {
        phone,
        name,
        email,
        message: "",
        errors: errors.array(),
        isActiveRoute,
        route: "add",
      });
    }

    try {
      const contact_id = uuidv4();

      let data;

      if (img) {
        data = await sharp(img).resize(100).jpeg({ mozjpeg: true }).toBuffer();
      }

      await db.collection("contacts").set(contact_id, {
        key: contact_id,
        user_id,
        name,
        email,
        phone,
        img: Boolean(data),
      });

      if (data) {
        await s3
          .putObject({
            Body: data,
            Bucket: process.env.BUCKET,
            Key: contact_id,
          })
          .promise();
      }

      res.redirect("/contacts");
    } catch (err) {
      res.render("addContact", {
        message: err.message,
        phone,
        name,
        email,
        errors: null,
        isActiveRoute,
        route: "add",
      });
    }
  },
];

exports.getContactImage = async (req, res) => {
  try {
    let s3File = await s3
      .getObject({
        Bucket: process.env.BUCKET,
        Key: req.params.key,
      })
      .promise();
    res.set("Content-type", s3File.ContentType);
    res.send(Buffer.from(s3File.Body));
  } catch (error) {
    if (error.code === "NoSuchKey") {
      res.sendStatus(404).end();
    } else {
      console.log(error);
      res.sendStatus(500).end();
    }
  }
};

exports.postDeleteContact = async (req, res) => {
  try {
    const { key } = req.body;
    await db.collection("contacts").delete(key);
    await s3
      .deleteObject({
        Bucket: process.env.BUCKET,
        Key: key,
      })
      .promise();
    res.send({ message: "Contact Deleted" });
  } catch (err) {
    res.send(err.message);
  }
};

exports.postUpdateContact = [
  validateName,
  validateEmail,
  async (req, res) => {
    const { id: user_id } = req.session;

    if (!user_id) {
      return res.send("You must login to perform this action!");
    }

    const { name, email, phone } = req.body;
    const img = req.files?.file?.data;
    const { key } = req.params;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("editContact", {
        key,
        name,
        phone,
        email,
        message: "",
        errors: errors.array(),
        isActiveRoute,
        route: "edit",
      });
    }

    try {
      let data;

      if (img) {
        data = await sharp(img).resize(100).jpeg({ mozjpeg: true }).toBuffer();
      }

      let bool = await imageExists(key);

      await db.collection("contacts").set(key, {
        key,
        user_id,
        name,
        email,
        phone,
        img: Boolean(data) || bool,
      });

      if (data) {
        await s3
          .putObject({
            Body: data,
            Bucket: process.env.BUCKET,
            Key: key,
          })
          .promise();
      }

      res.redirect("/contacts");
    } catch (err) {
      res.render("editContact", {
        message: err.message,
        name,
        phone,
        email,
        key,
        errors: null,
        isActiveRoute,
        route: "edit",
      });
    }
  },
];

exports.getSearchContact = async (req, res) => {
  const { name, id } = req.session;
  if (name && id) {
    return res.render("search", {
      filterd: [],
      message: "",
      isActiveRoute,
      route: "search",
    });
  }
  res.redirect("/users/login");
};

exports.postSearchContact = async (req, res) => {
  const { name } = req.body;

  const { id: user_id } = req.session;

  if (!user_id) {
    return res.send("You must login to perform this action!");
  }

  try {
    const { results } = await db.collection("contacts").filter({ user_id });
    const items = results.map((item) => item.props);

    const filterd = items.filter((item) => {
      return (
        item.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) ||
        item.name.toLocaleLowerCase().endsWith(name.toLocaleLowerCase())
      );
    });

    res.render("search", {
      filterd,
      message: filterd.length === 0 ? "No contacts found" : "",
      isActiveRoute,
      route: "search",
    });
  } catch (err) {
    res.send(err.message);
  }
};
