const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check Eclipse\'s latency'),

    async execute(interaction, client) {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const ping = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('Blurple') 
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${ping}ms`, inline: true },
                { name: 'API Latency', value: `${client.ws.ping}ms`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Eclipse Latency', iconURL: client.user.displayAvatarURL() });

        // Ensure client.ws.ping is available
        if (client.ws && client.ws.ping !== undefined) {
            await interaction.reply({ content: 'Pinging...', ephemeral: true });

            await delay(1000); // Simulate delay for effect

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.reply(`Pong! Latency is ${ping}ms. API Latency is unavailable.`);
        }
    }
};
