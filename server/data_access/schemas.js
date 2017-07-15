"use strict";

import mongoose         from "mongoose";
import Promise          from "bluebird";
// import bcrypt           from "bcrypt";

const Schema = mongoose.Schema;

const EventVoteSchema = new Schema({
    eventId: {
        type: Number,
        ref: "TimelineItem",
        require: true,
        min: 1,
    },
    voteType: {
        type: String,
        require: true
    },
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

EventVoteSchema.index({voteType: String, voter: String});
export {EventVoteSchema as EventVoteSchema};

export const TimelineItemSchema = new Schema({
    _id: Number,
    name: String,
    short: String,
    group: String,
    content: String,
    start: Date,
    end: Date,
    timelineEvents: Array,
    details: [],
    records: {
        type: Number,
        default: 0
    },
    breachType: String,
    sources: Array,
    targets: String,
    affiliations: String
});

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: {
        type: String,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        match: /(?=.*[a-zA-Z])(?=.*[0-9]+).*/,
        minlength: 12
    },
    email: {
        type: String,
        require: true,
        match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    },
    created: {
        type: Date,
        required: true,
        default: new Date()
    }
});

// Bcrypt Way
// UserSchema.pre("save", function (next) {
//     if (!this.isModified("password")) {
//         return next();
//     }

//     bcrypt.hash(this.password, 16.5, (err, hash) => {
//         if (err) {
//             next(err);
//             return;
//         }

//         this.password = hash;
//         next();
//     });
// });

UserSchema.methods.passwordIsValid = function (password, callback) {
    const results = !this.password || !password
        ? false
        : this.password == password;
    callback(null, results);
};

// Bcrypt Way
// UserSchema.methods.passwordIsValid = function(password, callback) {
//     bcrypt.compare(password, this.password, function() {
//         if (err) {
//             callback(false);
//             return
//         }

//         callback(null, results);
//     })
// };

export {UserSchema as UserSchema};

const LoginsSchema = new Schema({
    identityKey: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    failedAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    timeout: {
        type: Date,
        required: true,
        default: new Date()
    },
    inProgress: {
        type: Boolean,
        default: false
    }
});

LoginsSchema.static("inProgress", async function(key) {
    const login = await this.findOne({identityKey: key});
    const query = {identityKey: key};
    const update = {inProgress: true};
    const options = {setDefaultsOnInsert: true, upsert: true};
    await this.findOneAndUpdate(query, update, options).exec();
    return (login && login.inProgress);
});

LoginsSchema.static("canAuthenticate", async function (key) {
    const login = await this.findOne({identityKey: key});

    if (!login || login.failedAttempts < 5 ){
        return true;
    }

    const timeout = (new Date() - new Date(login.timeout).addMinutes(1));
    if (timeout >= 0) {
        await login.remove();
        return true;
    }
    return false;
});

LoginsSchema.static("failedLoginAttempt", async function (key) {
    const query = {identityKey: key};
    const update = {$inc: {failedAttempts: 1}, timeout: new Date(), inProgress: false};
    const options = {setDefaultsOnInsert: true, upsert: true};
    return  await this.findOneAndUpdate(query, update, options).exec();
});

LoginsSchema.static("successfulLoginAttempt", async function (key) {
    const login = await this.findOne({identityKey: key});
    if (login) {
        return await login.remove();
    }
});

export {LoginsSchema as LoginsSchema};
