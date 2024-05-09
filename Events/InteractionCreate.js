const { Events } = require("discord.js");
const Database = require("../Functions/database");
const { BooksButtons } = require("./Books/Buttons");
const { BooksSelectMenu } = require("./Books/SelectMenu");
const { MyProfileButtons } = require("./MyProfile/Buttons");
const { MyProfileSelectMenu } = require("./MyProfile/SelectMenu");
const { LessonButtons } = require("./Lesson/Buttons");
const { LessonSelectMenu } = require("./Lesson/SelectMenu");
const { AdminButtons } = require("./Admin/Buttons");
const { AdminSelectMenu } = require("./Admin/SelectMenu");
const { AdminModal } = require("./Admin/Modal");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!Database.getUser(interaction.user.id)) {
            Database.addUser(interaction.user.id);
        }

        await BooksButtons(interaction);
        await BooksSelectMenu(interaction);

        await MyProfileButtons(interaction);
        await MyProfileSelectMenu(interaction);

        await LessonButtons(interaction);
        await LessonSelectMenu(interaction);

        await AdminButtons(interaction);
        await AdminSelectMenu(interaction);
        await AdminModal(interaction);
    }
}