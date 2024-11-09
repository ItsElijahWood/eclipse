const fs = require('fs');
const path = require('path');

const interactionHandlers = new Map();

// Load button handlers dynamically
const buttonFiles = fs.readdirSync(path.join(__dirname, '../events/interactions/buttons')).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const handler = require(`../events/interactions/buttons/${file}`);
    if (handler.customId) {
        interactionHandlers.set(handler.customId, handler);
    } else {
        console.warn(`⚠️ Button handler ${file} does not define a customId.`);
    }
}

// Load other interaction listeners dynamically, passing `client`
function loadListeners(client) {
    const listenersPath = path.join(__dirname, '../events/interactions/listener');
    const listenerFiles = fs.readdirSync(listenersPath).filter(file => file.endsWith('.js'));

    for (const file of listenerFiles) {
        const listener = require(path.join(listenersPath, file));
        if (typeof listener === 'function') {
            listener(client); // Passing `client` to the listener
        } else {
            console.warn(`⚠️ Listener ${file} does not export a function.`);
        }
    }
}

/**
 * Handles interaction for commands and buttons
 * @param {any} client
 * @param {any} interaction
 * @returns {any}
 */
async function handleInteraction(client, interaction) {
    if (interaction.isCommand()) {
        const commandHandler = client.commands.get(interaction.commandName);
        if (commandHandler) {
            try {
                await commandHandler.execute(interaction, client);
            } catch (error) {
                console.error('Error handling command interaction:', error);
                await interaction.reply({ content: 'There was an error handling this interaction!', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Unknown command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const buttonHandler = interactionHandlers.get(interaction.customId);
        if (buttonHandler) {
            try {
                await buttonHandler.execute(interaction);
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.reply({ content: 'There was an error handling this interaction!', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Unknown button!', ephemeral: true });
        }
    }
}

module.exports = { handleInteraction, loadListeners };
