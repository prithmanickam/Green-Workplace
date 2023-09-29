const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asf23rjkafass35";
const uuid = require('uuid');
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const User = require("../models/UserModel");
const nodemailer = require('nodemailer');

const JWT_SECRET_FOR_REGISTRATION = 'asbfi3e5asf36n2';

module.exports.sendRegistrationEmails = async (req) => {
  try {
    const emails = req.body.emails;

    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    console.log(emails)
    for (const email of emails) {
      // Create a payload for the JWT token containing email and other data
      const payload = {
        email,
        registrationToken: uuid.v4(), // You can still include a unique token
      };

      // Sign the payload to generate the registration token
      const registrationToken = jwt.sign(payload, JWT_SECRET_FOR_REGISTRATION);

      // Nodemailer transporter is created
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: COMPANY_EMAIL,
          pass: APP_PASSWORD,
        },
      });

      // Email content
      const emailContent = `
        <html>
          <body>
            <p>Hello,</p>
            <p>Click the following link to complete your Green-Workplace registration:</p>
            <a href="http://localhost:3000/register/${registrationToken}">Register</a>
          </body>
        </html>
      `;

      // Send the email to the current recipient
      await transporter.sendMail({
        from: 'no-reply@greenworkplace.com',
        to: email,
        subject: 'Registration Link',
        html: emailContent,
      });

      console.log(`Registration email sent to ${email}`);
    }
  } catch (error) {
    console.error('Error sending registration emails:', error);
  }
};

// Endpoint to fetch the user's email using the registration token
module.exports.getEmailFromToken = async (req, res) => {
  const { token } = req.query;
  console.log("getEmailFromToken is being called")

  try {
    // Verify the registration token
    console.log('getEmailFromToken API called with token:', token);
    const decodedToken = jwt.verify(token, JWT_SECRET_FOR_REGISTRATION);

    const email = decodedToken.email;
    console.log(email);

    res.status(200).json({ status: "ok", email });
  } catch (error) {
    console.error('Error fetching email from token:', error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
};


module.exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      company: "Company1"
    });

    await newUser.save();

    res.status(201).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
    console.log(error);
  }
};


module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1m",
    });

    res.status(200).json({ status: "ok", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error" });
  }
};

module.exports.getUserData = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration: true,
    });

    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({ error: "User Not found" });
    }

    res.status(200).json({ status: "ok", data: user });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ status: "error" });
  }
};
