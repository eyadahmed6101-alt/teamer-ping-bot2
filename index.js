const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ----------------- Settings -----------------
const TARGET_CHANNEL_ID = '1562744636890423378'; // ID الروم
const TEAMER_ROLE_ID = '1565070098215993455';     // ID الرتبة
const TOKEN = 'حط_التوكن_بتاعك_هنا';              // توكن البوت
// --------------------------------------------

client.once('ready', () => {
    console.log(`Bot is online as: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // التحقق من الروم والمنشن
    if (message.channel.id === TARGET_CHANNEL_ID && message.mentions.has(client.user)) {
        const userId = message.author.id;

        // إنشاء الزرار
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_modal')
                .setLabel('Click here to fill out the form 📝')
                .setStyle(ButtonStyle.Primary)
        );

        // إرسال رسالة البوت مع الزرار
        const sentMessage = await message.channel.send({
            content: `Hello <@${userId}>, click the button below to fill out your request:`,
            components: [row]
        });

        // استماع للتفاعل مع الزرار
        const filter = (interaction) => interaction.customId === 'open_modal';
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== userId) {
                await interaction.reply({ content: "This button is only for the person who requested the bot!", ephemeral: true });
                return;
            }

            // إنشاء الـ Modal (القائمة المنبثقة)
            const modal = new ModalBuilder()
                .setCustomId('request_modal')
                .setTitle('Submit a New Request');

            const vsInput = new TextInputBuilder()
                .setCustomId('vs_input')
                .setLabel('VS')
                .setPlaceholder('Enter VS details here...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const userInput = new TextInputBuilder()
                .setCustomId('user_input')
                .setLabel('User')
                .setPlaceholder('Enter username...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const codeInput = new TextInputBuilder()
                .setCustomId('code_input')
                .setLabel('Code Server')
                .setPlaceholder('Enter server code...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const linkInput = new TextInputBuilder()
                .setCustomId('link_input')
                .setLabel('Link Server')
                .setPlaceholder('Enter server link...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(vsInput),
                new ActionRowBuilder().addComponents(userInput),
                new ActionRowBuilder().addComponents(codeInput),
                new ActionRowBuilder().addComponents(linkInput)
            );

            await interaction.showModal(modal);

            try {
                const modalSubmission = await interaction.awaitModalSubmit({
                    time: 60000,
                    filter: (i) => i.user.id === userId && i.customId === 'request_modal'
                });

                await modalSubmission.reply({ content: "Your request has been sent successfully!", ephemeral: true });

                const vsVal = modalSubmission.fields.getTextInputValue('vs_input');
                const userVal = modalSubmission.fields.getTextInputValue('user_input');
                const codeVal = modalSubmission.fields.getTextInputValue('code_input');
                const linkVal = modalSubmission.fields.getTextInputValue('link_input');

                const embed = new EmbedBuilder()
                    .setTitle('New Request 📝')
                    .setColor(0x0099ff)
                    .addFields(
                        { name: 'Requested By', value: `<@${userId}>` },
                        { name: '1. VS', value: vsVal },
                        { name: '2. User', value: userVal },
                        { name: '3. Code Server', value: codeVal },
                        { name: '4. Link Server', value: linkVal }
                    );

                const teamerMention = `<@&${TEAMER_ROLE_ID}>`;
                await message.channel.send({
                    content: `${teamerMention} - New request from <@${userId}>`,
                    embeds: [embed]
                });

                // مسح رسالة البوت الأصلية التي تحتوي على الزر
                try {
                    await sentMessage.delete();
                } catch (e) {}

            } catch (e) {
                // انتهى الوقت بدون إرسال المودال
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                try {
                    await sentMessage.delete();
                } catch (e) {}
            }
        });
    }
});

client.login(MTU2NTcxNTIyMjA3NTgwMTYxMA.GNEnn6.frt8J-EpnQwRxigPqPmQBgPMD6JglIEPtVC9fw);