require("dotenv").config();

const { handleInteraction, loadListeners } = require("./handler/interactionsHandler.js")
const { Collection, REST, Routes, ActivityType } = require("discord.js");
const Client = require("./events/client/Client");
const { commandFiles, commands } = require("./handler/commandsHandler.js");
const loadMusic = require('./utils/player.js');

const client = new Client();
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.on("ready", async function () {
  console.log("✅ Ready");

  const updateActivity = () => {
    const serverCount = client.guilds.cache.size;
    client.user.setActivity(`/help • ${serverCount} servers`, {
      type: ActivityType.Playing,
    });
  };

  updateActivity();

  setInterval(updateActivity, 600000);
});

loadListeners(client);
loadMusic(client);
client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(file);
  client.commands.set(command.data.name, command);
}

// registers the commands
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
})();

// when interaction passes it to interactionHandler.js
client.on("interactionCreate", async (interaction) => {
  await handleInteraction(client, interaction);
});

client.login(process.env.TOKEN);
