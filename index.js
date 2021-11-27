require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000;
const connectionString = process.env.MONGOOSE_DB;

const mongoose = require('mongoose');
mongoose.connect(connectionString);
mongoose.set('debug', true);

// respond with "hello world" when a GET request is made to the homepage
app.get('/test', function (req, res) {
    const Cat = mongoose.model('Cat', { name: String });
    const kitty = new Cat({ name: 'Zildjian' });
    kitty.save().then(() => console.log('meow'));

    res.send('save complete')
});

app.get('/testschema', async function (req, res) {
    var Schema = mongoose.Schema;
    var usersSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            // I haven't found a way to successfully name the auto-index here, but that's okay.
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            default: Date.now
        }
    }, {
        emitIndexErrors: true,
        id: false,
        autoIndex: false
    });

    usersSchema.on('error', function(errorE) {
        console.log('---> index error: ', errorE);
      });
      
    usersSchema.on('index', function(errI) {
        console.log('----> new index creating', errI);
    });

    usersSchema.index({username: 1, email: 1 }, { name: 'idx_username_email' });
    usersSchema.set('autoIndex', false);

    const User = mongoose.model('users', usersSchema);
    User.on('index', function(err) {
        console.error('error creating index', err);
    });

    console.log('creating indexes...');
    await User.ensureIndexes();
    console.log('indexes created!');

    const user = new User({
        username: 'john',
        email: 'john@doe.com',
        password: 'password'
    });

    const result = await user.save();
    res.send(result);
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});