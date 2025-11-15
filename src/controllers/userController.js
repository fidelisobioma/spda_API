const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const generateToken = require("../utils/generateToken");

//register user
const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Please enter both fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail)
      return res.status(400).json({ message: "Email already in use" });

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername)
      return res.status(400).json({ message: "username is already taken" });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashPassword },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.status(200).json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email does not exist" });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await prisma.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    //send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    });

    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    console.log(err.message);
  }
};

//verify-token/:token
const verifyToken = async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() }, // still valid
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  res.status(200).json({ message: "Token is valid" });
};

//reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Please enter both fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() }, // still valid
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyToken,
  resetPassword,
};
