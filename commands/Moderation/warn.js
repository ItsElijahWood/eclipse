const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningModel = require('../../models/warnSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Manage warnings for a user.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a warning to a user.')
                .addMentionableOption(option => 
                    option.setName('target-user')
                        .setDescription('The user you want to warn.')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('The reason for the warning.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a warning from a user.')
                .addMentionableOption(option => 
                    option.setName('target-user')
                        .setDescription('The user you want to remove a warning from.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('warning-id')
                        .setDescription('The ID of the warning to remove.')
                        .setRequired(true))),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You need the `ManageMessages` permission to execute this command.", ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUserId = interaction.options.getMentionable('target-user').id;
        const guildId = interaction.guild.id;
        
        if (subcommand === 'add') {
            const reason = interaction.options.getString('reason') || 'No reason provided';

            await interaction.deferReply();

            const targetUser = await interaction.guild.members.fetch(targetUserId);
            if (!targetUser) {
                await interaction.editReply("That user doesn't exist in this server.");
                return;
            }

            if (targetUser.user.bot) {
                await interaction.editReply("You can't warn a bot.");
                return;
            }

            const userTag = `${targetUser.user.username}#${targetUser.user.discriminator}`;

            try {
                let warningData = await warningModel.findOne({ GuildID: guildId, UserID: targetUserId });
                
                if (!warningData) {
                    warningData = new warningModel({
                        GuildID: guildId,
                        UserID: targetUserId,
                        UserTag: userTag,
                        Content: [{
                            ExecuterId: interaction.user.id,
                            ExecuterTag: interaction.user.tag,
                            Reason: reason
                        }]
                    });
                } else {
                    const warnContent = {
                        ExecuterId: interaction.user.id,
                        ExecuterTag: interaction.user.tag,
                        Reason: reason
                    };
                    warningData.Content.push(warnContent);
                }

                await warningData.save();

                const embed = new EmbedBuilder()
                    .setTitle("Warning Issued")
                    .setColor("Blurple")
                    .setDescription(`User ${targetUser} has been warned.`)
                    .addFields(
                        { name: "Reason", value: reason },
                        { name: "Warned by", value: interaction.user.tag }
                    )
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] }); 

            } catch (err) {
                console.error("Error while saving warning:", err);
                await interaction.editReply("An error occurred while saving the warning.");
            }

        } else if (subcommand === 'remove') {
            const targetUser = await interaction.guild.members.fetch(targetUserId);
            const warningId = interaction.options.getInteger('warning-id');

            try {
                let warningData = await warningModel.findOne({ GuildID: guildId, UserID: targetUserId });
                
                if (!warningData || warningData.Content.length === 0) {
                    return interaction.reply({ content: "This user has no warnings.", ephemeral: true });
                }

                if (warningId < 1 || warningId > warningData.Content.length) {
                    return interaction.reply({ content: `Invalid warning ID. Please enter a value between 1 and ${warningData.Content.length}.`, ephemeral: true });
                }

                warningData.Content.splice(warningId - 1, 1);
                await warningData.save();

                const embed = new EmbedBuilder()
                    .setTitle("Warning Removed")
                    .setColor("Blurple")
                    .setDescription(`Warning ID ${warningId} has been removed from ${targetUser}.`)
                    .addFields(
                        { name: "Removed by", value: interaction.user.tag }
                    )
                    .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp(); 

                await interaction.reply({ embeds: [embed] });

            } catch (err) {
                console.error("Error while removing warning:", err);
                await interaction.reply("An error occurred while removing the warning.");
            }
        }
    }
};
