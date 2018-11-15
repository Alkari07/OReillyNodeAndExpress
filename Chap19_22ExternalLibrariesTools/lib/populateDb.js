module.exports = {
    populate: function(Vacation) {
        console.log('Attempting to seed');
        Vacation.find(function(err, vacations) {
            console.log('Found vacations', vacations);
            if(err) return console.error(err);
            if(vacations.length) return;

            new Vacation({
                name: 'Hood River Day Trip',
                slug: 'hood-river-day-trip',
                category: 'Day Trip',
                sku: 'HR199',
                description: 'Spend a day sailing on the Columbia',
                priceInCents: 9995,
                tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
                inSeason: true,
                available: true,
                maximumGuests: 16,
                packagesSold: 0
            }).save();

            new Vacation({
                name: 'Oregon Coast Getaway',
                slug: 'oregon-coast-getaway',
                category: 'Weekend Getaway',
                sku: 'OC39',
                description: 'Enjoy the ocean',
                priceInCents: 269995,
                tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
                inSeason: false,
                available: true,
                maximumGuests: 8,
                packagesSold: 0
            }).save();

            new Vacation({
                name: 'Rock Climbing in Bend',
                slug: 'rock-climbing-in-bend',
                category: 'Adventure',
                sku: 'B99',
                description: 'Experience the thrill of climbing',
                priceInCents: 289995,
                tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
                inSeason: true,
                requiresWaiver: true,
                available: false,
                maximumGuests: 4,
                packagesSold: 0,
                notes: 'Tour guide had a skiing accident'
            }).save();
            console.log("Database data persisted");
        });
    }
};