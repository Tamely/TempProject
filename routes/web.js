const express = require("express");
const router = express.Router();
const ParkingLot = require("../models/ParkingLot");

router.get('/', async (req, res) => {
    const { day } = req.query;

    let filter = {};
    filter.day = day ? day : "Monday";

    const lots = await ParkingLot.find(filter).sort({ availability: -1 }); 

    res.render('index', { lots }, (err, content) => {
        if (err) {
            return res.status(500).send('Error rendering index.ejs');
        }

        res.render('layout', { body: content });
    })
});

router.get('/admin/login', (req, res) => {
    res.render('login', (err, content) => {
        if (err) {
            return res.status(500).send('Error rendering login.ejs');
        }

        res.render('layout', { body: content });
    });
});

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/api/admin/login');
    }
    next();
}

router.get('/admin', isAuthenticated, async (req, res) => {
    const lots = await ParkingLot.find();
    res.render('admin', { lots }, (err, content) => {
        if (err) {
            return res.status(500).send('Error rendering admin.ejs');
        }

        res.render('layout', { body: content });
    });
});

module.exports = router;