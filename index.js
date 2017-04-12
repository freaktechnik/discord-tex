const Eris = require("eris");
const mj = require("mathjax-node");
const svg2png = require("svg2png");

console.log("Initializing Eris...");
const bot = new Eris(process.env.DISCORD_TOKEN);
console.log("Configuring MathJax...");
mj.config({
    displayMessages: false,
    displayErrors: false,
    undefinedCharError: false,
    MathJax: {
        tex2jax: {
            balanceBraces: true,
            processEscapes: true
        },
        SVG: {
            styles: {
                "svg": {
                    "background-color": "white"
                }
            }
        }
    }
});
console.log("Starting MathJax...");
mj.start();

bot.on("ready", () => {
    console.log("Ready!");
});

let counter = 0;

bot.on("messageCreate", (msg) => {
    if(msg.content.startsWith("!tex")) {
        bot.sendChannelTyping(msg.channel.id);
        const math = msg.content.substr(4);
        mj.typeset({
            math,
            svg: true,
            format: "TeX"
        }, (data) => {
            if(!data.error) {
                const buffer = Buffer.from(data.svg);
                svg2png(buffer, {
                    width: Math.floor(parseFloat(data.width) * 10),
                    height: Math.floor(parseFloat(data.height) * 10)
                }).then((file) => {
                    bot.createMessage(msg.channel.id, {
                        tts: false
                    }, {
                        file,
                        name: `tex${++counter}.png`
                    });
                }, (e) => {
                    bot.createMessage(msg.channel.id, {
                        embed: {
                            title: "Error while generating image",
                            description: e.message,
                            color: 0xff0000
                        }
                    });
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
