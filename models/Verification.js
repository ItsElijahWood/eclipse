const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    channelId: {
        type: String,
        required: true
    },
    roleId: {
        type: String,
        required: true
    }
});

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification;
