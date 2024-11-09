const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Check if the server is premium
async function isPremiumServer(guildId) {
    try {
        const response = await axios.get(
            ``,
            {
                headers: {
                    Authorization: `Bot ${process.env.TOKEN}`,
                },
            }
        );

        return response.data.some(data => data.guild_id === guildId);
    } catch (error) {
        console.error("Error checking premium status:", error);
        return false; // Default to non-premium if there's an error
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set a slowmode  ee duration for a channel.')
        .addNumberOption(option =>
            option.setName('duration')
                .setDescription('The duration of the slowmode in seconds.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set the slowmode on.')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "❌ You need the `ManageMessages` permission to execute this command.",
                ephemeral: true
            });
        }

        const isPremium = await isPremiumServer(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({
                content: "⚠️ This command is only available to premium servers.",
                ephemeral: true
            });
        }

        const duration = interaction.options.getNumber('duration');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle("Slowmode Updated")
            .setColor("#5865F2") // Blurple color hex code
            .setDescription(`Successfully set slowmode to **${duration}** seconds for ${channel}.`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        try {
            await channel.setRateLimitPerUser(duration);
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: '❌ An error occurred while setting slowmode. Please try again later.',
                ephemeral: true
            });
        }
    },
};
