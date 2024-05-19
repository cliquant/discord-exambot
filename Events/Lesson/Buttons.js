const Database = require("../../Functions/database");
const { createStartLessonEmbed } = require("../../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;
const { ChannelType, PermissionFlagsBits } = require("discord.js");

async function LessonButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith("take_hint_")) {
        const questionId = interaction.customId.split('_')[2];
        const lesson = interaction.customId.split('_')[3];
        const userId = interaction.user.id;

        let hint = await Database.getHint(lesson, questionId);

        let canBuyHint = await Database.canUserBuyHint(userId, lesson, questionId);

        if (canBuyHint) {
            await Database.removeUserCoins(userId, hint.cost);
            await interaction.reply({ content: `Tu nopirki par ${hint.cost} coins hint: ` + "``" + hint.question + "``", ephemeral: true });
        } else {
            await interaction.reply({ content: `Tu nevari nopirkt`, ephemeral: true });
        }
    }
    if (interaction.customId === 'end_lesson') {
        const user = interaction.user;
        const userId = user.id;
        const channelId = interaction.channel.id;

        await Database.removeActiveLesson(userId, channelId);
        await interaction.channel.delete();
    }
    if (interaction.customId === 'start_lesson') {
        const user = interaction.user;
        const userId = user.id;
        const channelId = interaction.channel.id;

        let count = await Database.getActiveLessonCount() + 1;

        if (count > MAX_ACTIVE_LESSONS) {
            await interaction.reply({ content: 'Pārtrauciet vienu no treniņiem, lai sāktu jaunu.', ephemeral: true });
        } else {
            if (await Database.getUserLastLessonCreate(userId) > Date.now() - 60000) {
                await interaction.reply({ content: 'Lūdzu nespamo traniņus, tu drīksti izveidot 1 treniņu 1 minūtē.', ephemeral: true });
                return;
            } else {
                await Database.setLastTimeCreatedTraining(userId);
            }
            await interaction.deferReply({ ephemeral: true });
            await interaction.guild.channels.create({
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
            }).then(async channel => {
                await channel.send(await createStartLessonEmbed(true));

                setTimeout(async () => {
                    await interaction.editReply({ content: "<#" + channel.id + ">", ephemeral: true })
                }, 500);
                await Database.addActiveLesson(userId, channel.id);
            });
        }
    }
}

module.exports = {
    LessonButtons
}