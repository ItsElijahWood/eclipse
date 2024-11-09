const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const warningModel = require('../../models/warnSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription("Get a member's warnings")
        .addMentionableOption(option =>
            option.setName('target-user')
                .setDescription('The user you want to check the warnings of.')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You need the `ManageMessages` permission to execute this command.", ephemeral: true });
        }

        const targetUserId = interaction.options.getMentionable('target-user').id;
        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            return interaction.reply("That user doesn't exist in this server.");
        }

        if (targetUser.user.bot) {
            return interaction.reply("You can't view warnings for a bot.");
        }

        try {
            const warningData = await warningModel.findOne({ GuildID: interaction.guild.id, UserID: targetUserId });

            if (!warningData || warningData.Content.length === 0) {
                const noWarnsEmbed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("No Warnings")
                    .setDescription(`:white_check_mark: ${targetUser} has **0** warnings!`)
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                return interaction.reply({ embeds: [noWarnsEmbed] });
            }

            const warningsEmbed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle(`${targetUser.user.tag}'s Warnings`)
                .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setDescription(`**Total Warnings**: ${warningData.Content.length}`)
                .addFields(warningData.Content.map((w, i) => ({
                    name: `Warning ${i + 1}`,
                    value: `**Moderator**: ${w.ExecuterTag}\n**Reason**: ${w.Reason}`,
                    inline: false,
                })));

            return interaction.reply({ embeds: [warningsEmbed] });

        } catch (err) {
            console.error("Error while fetching warnings:", err);
            return interaction.reply("An error occurred while fetching warnings.");
        }
    }
};
