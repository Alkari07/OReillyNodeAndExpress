

module.exports = {
    setup: function(app, dataDir) {
        var fs = require('fs');
        var formidable = require('formidable');

        //make sure the data directory exists
        var vacationPhotoDir = dataDir + '/vacation-photo';
        fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
        fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

        function saveContestEntry(contestName, email, year, month, photoPath) {
            //TODO
        }

        app.post('/contest/vacation-photo/:year/:month', function(req, res) {
            var form = new formidable.IncomingForm();
            console.log('POST endpoint hit');
            form.parse(req, function(err, fields, files) {
                if (err) {
                    res.session.flash = {
                        type: 'danager',
                        intro: 'Oops!',
                        message: "There was an error in your submission"
                    };
                    return res.redirect(303, '/error');
                }
                var photo = files.photo;
                var dir = vacationPhotoDir + "/" + Date.now();
                var path = dir + "/" + photo.name;
                fs.mkdirSync(dir);
                fs.renameSync(photo.path, dir+'/'+photo.name);

                saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
                req.session.flash = {
                    type : 'success',
                    intro: 'good luck!',
                    messsage: 'You have been entered into the contest'
                };

                console.log('received fields: ', fields);
                console.log('received files: ');
                console.log(files);
                res.redirect(303, '/thank-you')
            });
        });
    }
};
