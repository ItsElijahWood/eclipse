const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * getsallfiles from /commands
 * @param {any} dirPath
 * @returns {any}
 */
function getAllFiles(dirPath) {
    let files = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files = files.concat(getAllFiles(fullPath)); 
        } else if (stat.isFile() && item.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

const commandsDir = path.join(__dirname, '../commands');
const commandFiles = getAllFiles(commandsDir);
const commands = [];

module.exports = { commandFiles, commands };

for (const file of commandFiles) {
    const command = require(file);

    if (command.data instanceof SlashCommandBuilder) {
        commands.push(command.data.toJSON());
    } else {
        commands.push(command.data);
    }
}
