const { Events, MessageFlags, Collection } = require('discord.js')

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return
        const command = interaction.client.commands.get(interaction.commandName)
        if(!command){
            console.error(`Command not found ${interaction.commandName}.`)
            return
        }

        const { cooldowns } = interaction.client

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection())
        }

        const now = Date.now()
        const timestamps = cooldowns.get(command.data.name)
        const defaultCooldownDuration = 5
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000)
                return interaction.reply({
                    content: `Poczekaj, zanim użyjesz \`${command.data.name}\` ponownie. Będziesz mógł użyć jej znowu <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
        timestamps.set(interaction.user.id, now)
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)



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
    }
}