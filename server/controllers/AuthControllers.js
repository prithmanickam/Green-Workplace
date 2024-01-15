const supabase = require("../config/supabaseConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asf23rjkafass35";
const uuid = require('uuid');
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const nodemailer = require('nodemailer');

const JWT_SECRET_FOR_REGISTRATION = 'asbfi3e5asf36n2';

module.exports.updateUsername = async (req, res) => {
  const { userId, editedUser } = req.body;

  try {
    const { data, error } = await supabase
      .from("User")
      .update({
        firstname: editedUser.firstname,
        lastname: editedUser.lastname
      })
      .eq("id", userId);


    res.status(200).json({ status: "ok", message: "User name updated successfully", user: data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};


module.exports.updatePassword = async (req, res) => {
  const { userEmail, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const { data, error } = await supabase
      .from("User")
      .update({
        password: hashedPassword,
      })
      .eq("email", userEmail);

    res.status(200).json({ status: "ok", message: "User name updated successfully", user: data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};


// Fetch all users that are in a specific company (and not admin)
module.exports.getAllUsers = async (req, res) => {
  const { company } = req.body;

  try {
    const { data, error } = await supabase
      .from("User")
      .select(`*, Office(name)`)
      .neq("type", "Admin")
      .eq("company_id", company);

    if (error) {
      return res.status(500).json({ status: "error" });
    }

    res.status(200).json({ status: "ok", users: data });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};

module.exports.sendResetPasswordEmail = async (req, res) => {
  try {
    const email = req.body.email;

    // Create a payload for the JWT token containing email 
    const payload = {
      email,
      company: "",
      office: "",
      resetpasswordtoken: uuid.v4(),
    };

    // Sign the payload to generate the forgot password token
    const resetpasswordtoken = jwt.sign(payload, JWT_SECRET_FOR_REGISTRATION);

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
            <p>Here is your reset password link for Green-Workplace:</p>
            <a href="https://green-workplace.vercel.app/resetpassword/${resetpasswordtoken}">Reset Password</a>
          </body>
        </html>
      `;

    // Send the email to the current recipient
    await transporter.sendMail({
      from: 'no-reply@greenworkplace.com',
      to: email,
      subject: 'Green-Workplace Reset Password Link',
      html: emailContent,
    });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};


// For admin to send registration email to a users email inbox
module.exports.sendRegistrationEmails = async (req, res) => {
  try {
    let emails = req.body.emails;
    const company = req.body.company;
    const office = req.body.office;

    if (!Array.isArray(emails)) {
      emails = [emails];
    }

    for (const email of emails) {
      // Create a payload for the JWT token containing email and other data
      const payload = {
        email,
        company,
        office,
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
    const office = decodedToken.office;

    res.status(200).json({ status: "ok", email, company, office });
  } catch (error) {
    console.error('Error fetching email from token:', error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
};

// Register the user to the database

module.exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password, company, office } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const { data: userData, error: error } = await supabase.from("User").upsert([
      {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        company_id: company,
        office_id: office,
      },
    ])
    .select();

    const { data: companyInfo, error: error2 } = await supabase
      .from("Company")
      .select("*")
      .eq("id", company)
      .single();

    const { error: addToTempTeamError } = await supabase
      .from("Team_Member")
      .insert([
        { "user_id": userData[0].id, "team_id": companyInfo.temporary_team },
    ]);


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
    res.status(500).json({ status: "error" });
  }
};

//Get the user data that logged in
module.exports.getUserData = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration: true,
    });

    const { data } = await supabase
      .from("User")
      .select()
      .eq("email", decodedToken.email)
      .single();

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ status: "ok", data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};