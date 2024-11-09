const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display helpful information'),

    async execute(interaction) {
        const guildName = interaction.guild.name;

        const embed = new EmbedBuilder()
            .setTitle(`Server: ${guildName}!`)
            .setColor("Blurple") 
            .addFields(
                { name: "🔹 Command Prefix", value: "Commands in this server start with `/`." },
                { name: "🛠 Support", value: "[Join Eclipse Support](https://discord.gg/rM9N2WeMfc)" },
                { name: "✨ Add Eclipse to Your Server", value: "[Invite Eclipse](https://discord.com/oauth2/authorize?client_id=1217604273060446339&permissions=8&scope=applications.commands+bot)" },
            )
            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
