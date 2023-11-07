const supabase = require("../config/supabaseConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asf23rjkafass35";
const uuid = require('uuid');
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const nodemailer = require('nodemailer');

const JWT_SECRET_FOR_REGISTRATION = 'asbfi3e5asf36n2';

// Fetch all users that are in a specific company (and not admin)
module.exports.getAllUsers = async (req, res) => {
  const { company } = req.body;

  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .neq("type", "Admin")
      .eq("company_id", company);

    if (error) {
      //console.error("Error fetching users in the company:", error);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok", users: data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// For admin to send registration email to a users email inbox
module.exports.sendRegistrationEmails = async (req, res) => {
  try {
    const emails = req.body.emails;
    const company = req.body.company;

    if (!Array.isArray(emails)) {
      emails = [emails];
    }

    for (const email of emails) {
      // Create a payload for the JWT token containing email and other data
      const payload = {
        email,
        company,
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
            <p>Your company has signed you up to Green-Workplace, a site to track your teams hybrid working patterns and carbon footprint.</p>
            <p>Click the following link to complete your registration:</p>
            <a href="https://green-workplace.vercel.app/register/${registrationToken}">Register</a>
          </body>
        </html>
      `;

      // Send the email to the current recipient
      await transporter.sendMail({
        from: 'no-reply@greenworkplace.com',
        to: email,
        subject: 'Green-Workplace Registration Link',
        html: emailContent,
      });

      //console.log(`Registration email sent to ${email}`);

    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

// Endpoint to fetch the user's email using the registration token
module.exports.getEmailFromToken = async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the registration token
    const decodedToken = jwt.verify(token, JWT_SECRET_FOR_REGISTRATION);

    const email = decodedToken.email;
    const company = decodedToken.company;

    res.status(200).json({ status: "ok", email, company });
  } catch (error) {
    //console.error('Error fetching email from token:', error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
};

// Register the user to the database

module.exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password, company } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const { data, error } = await supabase.from("User").upsert([
      {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        company_id: company,
      },
    ]);

    if (error) {
      //console.error("Error registering user:", error);
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Allows user to login if their credentials are correct
module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("User")
      .select()
      .eq("email", email)
      .single();

    if (error) {
      //console.error("Error logging in user:", error);
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ email: email }, JWT_SECRET, {
      expiresIn: "1m",
    });

    // You can generate a token or session here for user authentication

    res.status(200).json({ status: "ok", token });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error", error: "error" });
  }
};

//Get the user data that logged in
module.exports.getUserData = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration: true,
    });

    const { data, error } = await supabase
      .from("User")
      .select()
      .eq("email", decodedToken.email)
      .single();

    if (error) {
      //console.error("Error fetching user data:", error);
      return res.status(500).json({ status: "error" });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }


    res.status(200).json({ status: "ok", data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};