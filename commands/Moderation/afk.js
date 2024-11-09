const { SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const afkSchema = require('../../models/afkSchema.js');
const Afk = require('../../models/afkSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Manage your AFK status in the server.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Go AFK in this server.')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('The reason for going AFK')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your AFK status.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all AFK users in this server.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear the AFK status of a specific user.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user whose AFK status you want to remove')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clearall')
                .setDescription('Clear all AFK statuses in this server.')
        ),

    async execute(interaction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        const Data = await afkSchema.findOne({
            Guild: interaction.guild.id,
            User: interaction.user.id,
        });

        switch (subcommand) {
            case 'set':
                if (Data) {
                    return await interaction.reply({
                        content: 'You are already AFK in this server.',
                        ephemeral: true,
                    });
                } else {
                    const message = options.getString('message');
                    const nickname = interaction.member.nickname || interaction.user.username;

                    await afkSchema.create({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                        Message: message,
                        Nickname: nickname,
                    });

                    const name = `[AFK] ${nickname}`;
                    await interaction.member.setNickname(name).catch((err) => { return; });

                    const embed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription('You are now AFK in the server! Send a message or use /afk remove to remove your AFK status.');

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;

            case 'remove':
                if (!Data) {
                    return await interaction.reply({
                        content: 'You are not AFK in this server.',
                        ephemeral: true,
                    });
                } else {
                    const nickname = Data.Nickname;

                    await afkSchema.deleteMany({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                    });

                    await interaction.member.setNickname(nickname).catch((err) => { return; });

                    const embed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription('Your AFK status has been removed!');

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;

            case 'list':
                async function listAfkUsers(guildId) {
                    try {
                        const afkUsers = await Afk.find({ Guild: guildId });

                        if (afkUsers.length === 0) {
                            return 'No users are AFK in this server.';
                        } else {
                            const afkUserDetails = afkUsers.map(user => ({
                                name: user.Nickname || user.User,
                                value: `Message: ${user.Message}`
                            }));
                            return afkUserDetails;
                        }
                    } catch (error) {
                        console.error('Error retrieving AFK users:', error);
                        return 'An error occurred while retrieving AFK users.';
                    }
                }

                const afkUsersEmbed = await listAfkUsers(interaction.guild.id);
                if (typeof afkUsersEmbed === 'string') {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(afkUsersEmbed);
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setTitle('AFK Users')
                        .addFields(afkUsersEmbed);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;

            case 'clear':
                const targetUser = options.getUser('user');

                if (!targetUser) {
                    return await interaction.reply({
                        content: 'Please specify a user to remove their AFK status.',
                        ephemeral: true,
                    });
                }

                const afkData = await afkSchema.findOneAndDelete({
                    Guild: interaction.guild.id,
                    User: targetUser.id,
                });

                if (!afkData) {
                    return await interaction.reply({
                        content: 'The specified user is not AFK in this server.',
                        ephemeral: true,
                    });
                }

                const nickname = afkData.Nickname;
                const member = interaction.guild.members.cache.get(targetUser.id);

                if (member) {
                    await member.setNickname(nickname).catch(console.error);
                }

                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`AFK status for ${targetUser.tag} has been removed.`);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case 'clearall':
                try {
                    const deleteResult = await afkSchema.deleteMany({
                        Guild: interaction.guild.id,
                    });

                    const embed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`AFK status has been cleared for ${deleteResult.deletedCount} users in this server.`);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('Error clearing AFK status:', error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('An error occurred while clearing AFK statuses.');
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
                break;
        }
    },
};
