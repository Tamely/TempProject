const axios = require("axios");
const cheerio = require('cheerio');
const ParkingLot = require('../models/ParkingLot');

async function scrapeAndUpdate() {
    try {
        const response = await axios.get('https://www.lsu.edu/parking/availability.php');
        const $ = cheerio.load(response.data);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = ['7:00 am', '11:00 am', '2:00 pm', '4:00 pm'];

        const availableDays = [];

        $('button[data-target]').each((_, button) => {
            const $button = $(button);
            const buttonText = $button.text().trim();

            const day = days.find(d => buttonText.includes(d));
            if (!day) return;

            const targetPanelSelector = $button.attr('data-target');
            if (!targetPanelSelector) return;

            const panel = $(targetPanelSelector);
            if (!panel.length) return;

            const lotRows = panel.find('tr').toArray();
            const dataRows = lotRows.slice(1);

            dataRows.forEach(row => {
                const lotName = $(row).find('td').first().text().trim();
                const availableTimes = [];

                for (let i = 3; i < 7; i++) {
                    const occupancy = parseInt($(row).find(`td:nth-child(${i+1})`).text()) || 0;
                
                    availableTimes.push({
                        time: times[i - 3],
                        occupancy: occupancy
                    });
                }

                availableDays.push({
                    name: lotName,
                    day: day,
                    time: availableTimes
                });
            });
        });

        for (const day of availableDays) {
            let i = 0;
            let sum = 0;

            for (const time of day.time) {
                i++;
                sum += time.occupancy;
            }

            await ParkingLot.findOneAndUpdate(
                { 
                    name: day.name, 
                    day: day.day 
                },
                {
                    name: day.name,
                    day: day.day,
                    availability: Math.abs(100 - (sum/i)),
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );
        }

        console.log("Finished scraping. Updated Database!");
    } catch (error) {
        console.error('Error scraping or updating:', error);
    }
}

function startScraping(interval = 2 * 60 * 1000) {
    console.log("Starting scrape...");
    scrapeAndUpdate();
    setInterval(scrapeAndUpdate, interval);
}

module.exports = startScraping;