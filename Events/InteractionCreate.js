const { Events } = require("discord.js");
const Database = require("../Functions/database");
const { BooksButtons } = require("./Books/Buttons");
const { BooksSelectMenu } = require("./Books/SelectMenu");
const { MyProfileButtons } = require("./MyProfile/Buttons");
const { MyProfileSelectMenu } = require("./MyProfile/SelectMenu");
const { LessonButtons } = require("./Lesson/Buttons");
const { LessonSelectMenu } = require("./Lesson/SelectMenu");
const { LessonModal } = require("./Lesson/Modal");
const { AdminButtons } = require("./Admin/Buttons");
const { AdminSelectMenu } = require("./Admin/SelectMenu");
const { AdminModal } = require("./Admin/Modal");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!await Database.getUser(interaction.user.id)) {
            await Database.addUser(interaction.user.id);
        }

        await LessonButtons(interaction);
        await LessonSelectMenu(interaction);
        await LessonModal(interaction);

        await BooksButtons(interaction);
        await BooksSelectMenu(interaction);

        await MyProfileButtons(interaction);
        await MyProfileSelectMenu(interaction);

        await AdminButtons(interaction);
        await AdminSelectMenu(interaction);
        await AdminModal(interaction);
    }
}