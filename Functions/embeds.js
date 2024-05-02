const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

function createStartEmbed() {
    const start = new ButtonBuilder()
        .setCustomId('start_lesson')
        .setLabel('Sākt mācīties')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(start);

    const exampleEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Start')
        .setDescription("Es esmu eksāmenu palīgs, kad uzspiedīsiet uz 'Sākt mācīties'\n tiks izveidots channel kurā jūs varēsiet izvēlēties mācību.\n\n```Ja esi gatavs pārbaudei, spied 'Sākt mācīties'```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [exampleEmbed],
        components: [row],
    };
}

module.exports = {
    createStartEmbed
}