//this is the base url in case your linked paths to static content are not relative to the local directory
//you want the relative paths to be agnostic to some root directory - you wuold define that here
var baseUrl='';

exports.map = function(name) {
    return baseUrl+name;
};