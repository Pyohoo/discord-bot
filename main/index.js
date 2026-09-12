const fs = require('fs');
const path = require('path');
require('dotenv').config()
const {Client, GatewayIntentBits, Events, Collection, MessageFlags} = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})


// ładowanie komend

client.commands = new Collection()

const folderPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(folderPath)

for (const folder of commandFolders){
    const commandsPath = path.join(folderPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)

        if('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command)
        } else{
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }

    }
}

// obsługa użycia komend

client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isChatInputCommand()) return
    const command = interaction.client.commands.get(interaction.commandName)
    if(!command){
        console.error(`Command not found ${interaction.commandName}.`)
        return
    }

    try{
        await command.execute(interaction)
    }catch(err) {
        console.error(err)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            })
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            })
        }
    }
})


client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.login(process.env.DISCORD_BOT_TOKEN)