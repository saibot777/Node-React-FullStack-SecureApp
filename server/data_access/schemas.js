"use strict";

import mongoose         from "mongoose";
import Promise          from "bluebird";

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
    },
    email: {
        type: String,
        require: true,
    },
    created: {
        type: Date,
        required: true,
        default: new Date()
    }
});

UserSchema.methods.passwordIsValid = function (password, callback) {
    const results = !this.password || !password
        ? false
        : this.password == password;
    callback(null, results);
};

export {UserSchema as UserSchema};
