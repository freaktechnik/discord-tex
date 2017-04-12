const Eris = require("eris");
const mj = require("mathjax-node");

const bot = new Eris(process.env.DISCORD_TOKEN);
mj.config({
    displayMessages: false,
    displayErrors: false,
    undefinedCharError: false
});
mj.start();

bot.on("messageCreate", (msg) => {
    if(msg.content.startsWith("TeX:")) {
        const math = msg.content.substr(5);
        mj.typeset({
            math,
            mml: true
        }, (data) => {
            if(!data.errors) {
                bot.createMessage(msg.channel.id, {
                    content: "",
                    embed: {
                        type: "rich",
                        title: math,
                        description: data.mml
                    }
                });
            }
            else {
                bot.createMessage(msg.channel.id, {
                    content: `Errors occured while parsing the TeX expression "${math}"`,
                    embed: {
                        title: "Errors",
                        color: "#ff0000",
                        fields: data.erros.map((e) => {
                            return {
                                name: "error",
                                value: e
                            };
                        })
                    }
                });
            }
        })
    }
})
