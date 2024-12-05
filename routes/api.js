const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const ParkingLot = require("../models/ParkingLot");
const User = require('../models/User');

router.get("/lots", async (req, res) => {
    const lots = await ParkingLot.find();
    res.json(lots);
});

router.post("/lots", async (req, res) => {
    const newLot = new ParkingLot(req.body);
    await newLot.save();
    res.status(201).json(newLot);
});

router.delete("/lots/:id", async (req, res) => {
    await ParkingLot.findByIdAndDelete(req.params.id);
    res.status(204).end();
});

router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({username: username});
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }

    if (user.password != password) {
        return res.status(401).send('Invalid username or password');
    }

    req.session.user = user;
    res.redirect('/admin');
});

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/api/admin/login');
    }
    next();
}

router.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

router.post('/admin/add', isAuthenticated, async (req, res) => {
    const { name, availability, day } = req.body;

    const newLot = new ParkingLot({ name, availability, day });
    await newLot.save();

    res.redirect('/admin');
});

router.post('/admin/delete', isAuthenticated, async (req, res) => {
    const { id } = req.body;
    await ParkingLot.findByIdAndDelete(id);

    res.redirect('/admin');
});

module.exports = router;