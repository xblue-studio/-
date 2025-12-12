const fs = require("fs");
const config = require("./config.json");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
  Partials,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

client.on("ready", async () => {
  console.log(`================`);
  console.log(`Bot Name : ${client.user.username}`);
  console.log(`Bot Tag : ${client.user.tag}`);
  console.log(`Devloped By : SF7`);
  console.log(`Bot Id : ${client.user.id}`);
  console.log(`Servers Count : ${client.guilds.cache.size}`);
  console.log(
    `Users Count : ${client.guilds.cache
      .reduce((a, b) => a + b.memberCount, 0)
      .toLocaleString()}`,
  );
  console.log(`gg xblue`);
  console.log(`================`);
  var statuses = [`xBlue Studio On Top`, `Bc On Top`, `Dev : SF7`];
  var timers = 2;
  var timeing = Math.floor(timers * 1000);
  setInterval(function () {
    var lengthesof = statuses.length;
    var amounter = Math.floor(Math.random() * lengthesof);
    client.user.setActivity(statuses[amounter], {
      type: "straming",
      url: "https://www.twitch.tv/5fr3_?sr=a",
    });
  }, timeing);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("#bc") || message.author.bot) return;

  const allowedRoleId = config.allowedRoleId;
  const member = message.guild.members.cache.get(message.author.id);

  if (!member.roles.cache.has(allowedRoleId)) {
    return message.reply({
      content: "ليس لديك صلاحية لاستخدام هذا الامر!",
      ephemeral: true,
    });
  }

  if (
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return message.reply({
      content: "ليس لديك صلاحية لاستخدام هذا الامر!",
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("**لوحة تحكم البرودكاست**")
    .setImage(config.image)
    .setDescription("**الرجاء اختيار نوع الارسال للاعضاء.**");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("send_all")
      .setLabel("ارسل للجميع")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("send_online")
      .setLabel("ارسل للمتصلين")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("send_offline")
      .setLabel("ارسل للغير المتصلين")
      .setStyle(ButtonStyle.Danger),
  );

  await message.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      let customId;
      if (interaction.customId === "send_all") {
        customId = "modal_all";
      } else if (interaction.customId === "send_online") {
        customId = "modal_online";
      } else if (interaction.customId === "send_offline") {
        customId = "modal_offline";
      }

      const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle("Virbon Broadcast");

      const messageInput = new TextInputBuilder()
        .setCustomId("messageInput")
        .setLabel("اكتب رسالتك هنا")
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(new ActionRowBuilder().addComponents(messageInput));

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
      const message = interaction.fields.getTextInputValue("messageInput");

      const guild = interaction.guild;
      if (!guild) return;

      await interaction.deferReply({
        ephemeral: true,
      });
      if (interaction.customId === "modal_all") {
        const membersToSend = guild.members.cache.filter(
          (member) => !member.user.bot,
        );
        await Promise.all(
          membersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      } else if (interaction.customId === "modal_online") {
        const onlineMembersToSend = guild.members.cache.filter(
          (member) =>
            !member.user.bot &&
            member.presence &&
            member.presence.status !== "offline",
        );
        await Promise.all(
          onlineMembersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      } else if (interaction.customId === "modal_offline") {
        const offlineMembersToSend = guild.members.cache.filter(
          (member) =>
            !member.user.bot &&
            (!member.presence || member.presence.status === "offline"),
        );
        await Promise.all(
          offlineMembersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      }
      await interaction.editReply({
        content: "**تم ارسال رسالتك الى الاعضاء بنجاح.**",
      });
    }
  } catch (error) {
    console.error("Error in interactionCreate event:", error);
  }
});

client.login(config.token);
