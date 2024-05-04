const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartLessonEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith("take_hint_")) {
            const questionId = interaction.customId.split('_')[2];
            const lesson = interaction.customId.split('_')[3];
            const userId = interaction.user.id;

            let hint = Database.getHint(lesson, questionId);

            let canBuyHint = Database.canUserBuyHint(userId, lesson, questionId);

            if (canBuyHint) {
                Database.removeUserCoins(userId, hint.cost);
                interaction.reply({ content: `Tu nopirki par ${hint.cost} coins hint: ` + "``" + hint.question + "``", ephemeral: true });
            } else {
                interaction.reply({ content: `Tu nevari nopirkt`, ephemeral: true });
            }
        }
        if (interaction.customId === 'end_lesson') {
            const user = interaction.user;
            const userId = user.id;
            const channelId = interaction.channel.id;

            Database.removeActiveLesson(userId, channelId);
            interaction.channel.delete();
        }
        if (interaction.customId === 'start_lesson') {
            const user = interaction.user;
            const userId = user.id;
            const channelId = interaction.channel.id;

            let count = Database.getActiveLessonCount() + 1;

            if (count > MAX_ACTIVE_LESSONS) {
                interaction.reply({ content: 'Pārtrauciet vienu no treniņiem, lai sāktu jaunu.', ephemeral: true });
            } else {
                if (Database.getUserLastLessonCreate(userId) > Date.now() - 60000) {
                    interaction.reply({ content: 'Lūdzu nespamo traniņus, tu drīksti izveidot 1 treniņu 1 minūtē.', ephemeral: true });
                    return;
                } else {
                    Database.setLastTimeCreatedTraining(userId);
                }
                interaction.deferReply({ ephemeral: true });
                const newChannel = await interaction.guild.channels.create({
                    name: "treniņš-" + count,
                    type: ChannelType.GuildText,
                    parent: GUILD_CATEGORY_LESSONS_ID,
                    permissionOverwrites: [{
                            id: interaction.guild.roles.everyone,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: GUILD_ADMIN_ROLE_ID,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                }).then(channel => {
                    channel.send(createStartLessonEmbed(true));

                    setTimeout(() => {
                        interaction.editReply({ content: "<#" + channel.id + ">", ephemeral: true })
                    }, 500);
                    Database.addActiveLesson(userId, channel.id);
                });
            }
        }
        
    }
}