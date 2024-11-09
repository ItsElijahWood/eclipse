const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Avatar Subcommands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('Get the server banner')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get a user\'s avatar')
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The user whose avatar you want to see.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription('Get the server icon')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'banner': {
                const guild = interaction.guild;

                if (!guild) {
                    return interaction.reply('This command can only be used within a server.');
                }

                const guildBanner = guild.bannerURL({ dynamic: true });

                if (!guildBanner) {
                    return interaction.reply('This server does not have a banner.');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${guild.name} Banner`)
                    .setImage(guildBanner)
                    .setColor('Blurple');

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'get': {
                const user = interaction.options.getUser('target');
                if (!user) {
                    return await interaction.reply({
                        content: 'Please select a valid user.',
                        ephemeral: true,
                    });
                }

                const userAvatar = user.displayAvatarURL({ size: 512 });

                const embed = new EmbedBuilder()
                    .setTitle(`${user.tag}'s avatar`)
                    .setColor('Blurple')
                    .setImage(userAvatar)
                    .setTimestamp();

                await interaction.reply({
                    embeds: [embed],
                });
                break;
            }

            case 'icon': {
                const guild = interaction.guild;

                if (!guild) {
                    return interaction.reply('This command can only be used within a server.');
                }

                const guildIcon = guild.iconURL({ dynamic: true });

                if (!guildIcon) {
                    return interaction.reply('This server does not have an icon.');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${guild.name} Server Icon`)
                    .setImage(guildIcon)
                    .setColor('Blurple');

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    },
};
