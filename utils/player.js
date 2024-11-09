const { Player } = require('discord-player');

module.exports = (client) => {
  const player = new Player(client);

  player.extractors
    .loadDefault()
    .then(() => console.log("Extractors loaded successfully"));

  player.events.on("audioTrackAdd", (queue, song) => {
    queue.metadata.channel.send(
      `🎶 | Song **${song.title}** added to the queue!`
    );
  });

  player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(`▶ | Started playing: **${track.title}**!`);
  });

  player.events.on("audioTracksAdd", (queue, track) => {
    queue.metadata.channel.send(`🎶 | Tracks have been queued!`);
  });

  player.events.on("disconnect", (queue) => {
    queue.metadata.channel.send(
      "❌ | I was manually disconnected from the voice channel, clearing queue!"
    );
  });

  player.events.on("emptyChannel", (queue) => {
    queue.metadata.channel.send(
      "❌ | Nobody is in the voice channel, leaving..."
    );
  });

  player.events.on("emptyQueue", (queue) => {
    queue.metadata.channel.send("✅ | Queue finished!");
    queue.delete();
  });

  player.events.on("error", (queue, error) => {
    console.log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );
  });

  player.on("playerError", (error) => {
    console.error("Player error:", error);
  });

  client.once("reconnecting", () => {
    console.log("Reconnecting!");
  });

  client.once("disconnect", () => {
    console.log("Disconnect!");
  });
};
