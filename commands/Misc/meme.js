const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetch a random meme'),

    async execute(interaction) {
        try {
            const response = await axios.get('https://www.reddit.com/r/memes/.json');
            const memes = response.data.data.children;
            const randomIndex = Math.floor(Math.random() * memes.length);
            const memeData = memes[randomIndex].data;

            const title = memeData.title;
            const image = memeData.url;
            const author = memeData.author;

            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle(title)
                .setImage(image)
                .setURL(image)
                .setFooter({ text: `Posted by ${author}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.reply('Failed to fetch meme. Please try again later.');
        }
    }
};
