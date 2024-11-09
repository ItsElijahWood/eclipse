const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    data: {
    name: 'urate',
    description: 'Rates the specified thing out of 10',
    "integration_types": [1],
    "contexts": [1, 2],

    options: [
        {
            name: 'thing',
            description: 'The thing you want to rate.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
   },

    async execute(interaction) {
        const thingToRate = interaction.options.getString('thing');
        const rating = Math.floor(Math.random() * 11);

        interaction.reply(`I would rate **${thingToRate}** a ${rating}/10!`);
    },
};
