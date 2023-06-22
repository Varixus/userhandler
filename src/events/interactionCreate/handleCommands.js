const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands')

module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    const localCommand = getLocalCommands();

    try {
        const commandObject = localCommand.find((cmd) => cmd.name === interaction.commandName)

        if(!commandObject) return;

        if(commandObject.devOnly) {
            if(!devs.includes(interaction.member.id)){
                interaction.reply({
                    content: 'Only developers are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        if(commandObject.testOnly) {
            if(!(interaction.guild.id === testServer)){
                interaction.reply({
                    content: 'This command cannot be ran here.',
                    ephemeral: true,
                });
                return;
            }
        }

        if(commandObject.permissionRequired?.length) {
            for(const permission of commandObject.permissionRequired) {
                if(!interaction.member.permission.has(permission)){
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    });
                    break;
                }
            }
        }

        if(commandObject.botPermission?.length){
            for(const permission of commandObject.permissionRequired) {
                const bot = interaction.guild.members.me;

                if(!bot.permission.has(permission)){
                    interaction.reply({
                        content: "I don't have enough permissions.",
                        ephemeral: true,
                    });
                    break;
                }
            }
        }

        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`ERROR (handleCommands.js): ${error}`)
    }
};