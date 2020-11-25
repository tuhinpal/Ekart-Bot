const { Telegraf } = require('telegraf');
const request = require('request');
const { Markup } = require('telegraf');
const express = require('express');
const app = express();

const bot = new Telegraf(process.env.BOT_API_KEY);
bot.telegram.setWebhook(`https://${process.env.APP_NAME}.herokuapp.com/bot${process.env.BOT_API_KEY}`);
app.use(bot.webhookCallback(`/bot${process.env.BOT_API_KEY}`));

bot.start((ctx) => ctx.replyWithHTML("<b>Hey, " + (ctx.message.chat.first_name) + " 👋👋</b>\n\n<em>Welcome to <b>Ekart Tracking Bot</b>. \n\nSend the Ekart Tracking ID to get Updates of your Package.\n\nBrought you by @tprojects</em>"));

const abouttext = "<b>This BOT is using Ekart Unofficial API by Tuhin to give updates. This bot is not affiliated by Ekart Logistics.</b>";
bot.command('about', (ctx) => ctx.replyWithHTML(
    abouttext,
    Markup.inlineKeyboard([
        [
            Markup.urlButton('Ekart Unofficial API', 'https://github.com/cachecleanerjeet/Ekart-API')
        ],
        [
            Markup.urlButton("Bot's Source Code", 'https://github.com/cachecleanerjeet/Ekart-Bot')
        ],
        [
            Markup.urlButton("Tuhin's Github", 'https://github.com/cachecleanerjeet/')
        ]
    ]).extra(),

));

bot.command('help', (ctx) => ctx.replyWithHTML("<b>Send the Ekart Tracking ID to get Updates of your Package.</b>\n\nIf you have encountered any error or having problem, then message @t_projects"));


const statustxt = "Seems you are not a part of @tprojects 🤒\nYou have to join our channel to use this bot 😐";

bot.on('message', async(ctx) => {

    //getting name and msg info
    var recmsg = ctx.message.text;
    //statustext

    if (recmsg == undefined) {
        ctx.reply("Sorry, you are sending file. Send the Ekart Tracking ID to get Updates of your Package.")
    } else {
        await ctx.reply("Please hold on...")
        var gettracking = {
            'method': 'GET',
            'url': process.env.EKART_API_URL + '/check?id=' + recmsg
        };
        request(gettracking, function(error, response) {
            if (error) {
                ctx.reply("Sorry, a error happend while fetching result, Kindly report it on @t_projects");
            } else {
                const ub = JSON.parse(response.body);
                if (ub.msg == "Invalid Tracking ID, Kindly recheck and send it again") {
                    ctx.replyWithHTML("<b>You are sending an Invalid Tracking ID, Kindly recheck the Tracking ID and send it again.</b>")
                } else {

                    var updatest, i, updatesd = "";
                    var updatest = ub.updates;
                    for (i = 0; i < updatest.length; i++) {
                        updatesd += updatest[i].Date + " at " + updatest[i].Time + "\n<b>Place</b> : " + updatest[i].Place + "\n<b>Status : </b>" + updatest[i].Status + "\n\n";
                    };
                    ctx.replyWithHTML(
                        "<b>Updates for Tracking ID 👉 </b>" + ub.tracking_id + "\n\n" +
                        "<b>Merchant Name : </b>" + ub.merchant_name + "\n" +
                        "<b>Order Status : </b>" + ub.order_status + "\n" +
                        "<b>Delivery Time : </b>" + ub.time + "\n\n<b>Detailed Updates 👇</b>\n\n" + updatesd)
                };
            };
        });
    };
});

bot.launch()

app.get('/', (req, res) => {
    res.send('Online');
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on Port ${process.env.PORT}`);
});