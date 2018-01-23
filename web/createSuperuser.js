var Admin = require('./models/admin');
var mongoose = require('mongoose')
mongoose.connect('localhost');

Admin.register(new Admin({username:'admin', password:'qwerty'}), 'qwerty', function(err, admin) {
                if (err) {
                    console.log(new Date() + ' ' + err);
                    return;
                } else {
                    console.log('管理員' + admin.username + ' 已於 ' + new Date() + ' 報名');
                }
                return;
});
