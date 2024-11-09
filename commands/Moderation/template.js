const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Setup basic text channels in your server"),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      return interaction.reply({
        content:
          "You need the `ManageChannels` permission to execute this command.",
        ephemeral: true,
      });
    }

    const guild = interaction.guild;

    if (!guild) {
      return;
    }

    if (guild.channels.cache.size >= 3) {
      return interaction.reply({
        content: "I cannot create them, if the server has over 3 text channels",
        ephemeral: true,
      });
    } else {
      try {
        // Create the Bulletin Board category and its channels
        const BULL = await guild.channels.create({
          name: "📌┋Bulletin' Board",
          type: ChannelType.GuildCategory,
        });

        await guild.channels.create({
          name: "👋┋welcome",
          type: ChannelType.GuildText,
          parent: BULL.id,
        });

        await guild.channels.create({
          name: "📘┋rules",
          type: ChannelType.GuildText,
          parent: BULL.id,
        });

        await guild.channels.create({
          name: "✅┋verification",
          type: ChannelType.GuildText,
          parent: BULL.id,
        });

        // Create the Text Channels category and its channels
        const TEXTC = await guild.channels.create({
          name: "🗨️ TEXT CHANNELS",
          type: ChannelType.GuildCategory,
        });

        await guild.channels.create({
          name: "💬┋general",
          type: ChannelType.GuildText,
          parent: TEXTC.id,
        });

        await guild.channels.create({
          name: "📃┋spam",
          type: ChannelType.GuildText,
          parent: TEXTC.id,
        });

        await guild.channels.create({
          name: "🤣┋memes",
          type: ChannelType.GuildText,
          parent: TEXTC.id,
        });

        await guild.channels.create({
          name: "📸┋clips",
          type: ChannelType.GuildText,
          parent: TEXTC.id,
        });

        await guild.channels.create({
          name: "🤖┋bot-commands",
          type: ChannelType.GuildText,
          parent: TEXTC.id,
        });

        // Create the Voice Channels category and its channels
        const VC = await guild.channels.create({
          name: "🗣┋VCs",
          type: ChannelType.GuildCategory,
        });

        await guild.channels.create({
          name: "🗣┋General",
          type: ChannelType.GuildVoice,
          parent: VC.id,
        });

        await guild.channels.create({
          name: "🕑┋AFK",
          type: ChannelType.GuildVoice,
          parent: VC.id,
        });

        await guild.channels.create({
          name: "🎶┋Music",
          type: ChannelType.GuildVoice,
          parent: VC.id,
        });

        await interaction.reply({
          content: "Created the text channels and VC.",
          ephemeral: true,
        });
      } catch (error) {
        console.log("Error creating category or channels:", error);
        await interaction.reply({
          content: "There was an error creating the channels.",
          ephemeral: true,
        });
      }
    }
  },
};
