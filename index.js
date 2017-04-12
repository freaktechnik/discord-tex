const Eris = require("eris");
const mj = require("mathjax-node-svg2png");

console.log("Initializing Eris...");
const bot = new Eris(process.env.DISCORD_TOKEN);
console.log("Configuring MathJax...");
mj.config({
    displayMessages: false,
    displayErrors: false,
    undefinedCharError: false
});
console.log("Starting MathJax...");
mj.start();

bot.on("ready", () => {
    console.log("Ready!");
});

let counter = 0;

bot.on("messageCreate", (msg) => {
    if(msg.content.startsWith("TeX:")) {
        bot.sendChannelTyping(msg.channel.id);
        const math = msg.content.substr(4);
        mj.typeset({
            math,
            png: true,
            ex: 20,
            width: 200
        }, (data) => {
            if(!data.errors) {
                bot.createMessage(msg.channel.id, {
                    /*embed: {
                        type: "rich",
                        title: math,
                        image: {
                            url: data.png
                        },
                        author: {
                            name: msg.author.username,
                            icon_url: msg.author.avatarURL
                        }
                    },*/
                    tts: false
                }, {
                    file: Buffer.from(data.png.split(",")[1], 'base64'),
                    name: `tex${++counter}.png`
                });
            }
            else {
                bot.createMessage(msg.channel.id, {
                    content: `Errors occured while parsing the TeX expression "${math}"`,
                    embed: {
                        title: "Errors",
                        color: 0xff0000,
                        fields: data.errors.map((e) => {
                            if(typeof e == "string") {
                                const [ name, value ] = e.split(":");
                                return {
                                    name,
                                    value,
                                    inline: true
                                };
                            }
                            else {
                                return {
                                    name: e.type,
                                    value: e.message,
                                    inline: true
                                };
                            }
                        })
                    }
                });
            }
        })
    }
});

console.log("Connecting...");
bot.connect();
