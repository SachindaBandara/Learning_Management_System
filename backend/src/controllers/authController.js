const Admin = require('../models/Admin');
const bcrypt = require("bcryptjs"); // Added bcrypt import
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    const { adminNumber, password } = req.body;

    try {
      // Check if admin exists
      const admin = await Admin.findOne({ adminNumber });
      if (!admin) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Compare passwords directly (plaintext)
      if (admin.password !== password) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      // Respond with token and admin info
      res.status(200).json({
        token,
        admin: { id: admin._id, adminNumber: admin.adminNumber },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

exports.forgotPassword = async (req, res) => {
    const { adminNumber } = req.body;
  
    try {
      const admin = await Admin.findOne({ adminNumber });
      if (!admin) return res.status(404).json({ message: 'Admin number not found' });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'Password Recovery',
        text: `Your password is: ${admin.password}`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email' });
        } else {
          return res.status(200).json({ message: 'Password sent to your email' });
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };