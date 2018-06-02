var fortunes = [
    'Red future',
    'Blue future',
    'Green future',
    'Yellow future'
];

exports.getFortune = function() {
    var idx = Math.floor(Math.random()*fortunes.length);
    return fortunes[idx];
};