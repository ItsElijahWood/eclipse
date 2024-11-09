const { Schema, model } = require('mongoose');

const LoggingSchema = new Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
    unique: true,
  }
});

module.exports = model('AuditLog', LoggingSchema);