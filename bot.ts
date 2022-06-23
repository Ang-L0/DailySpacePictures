import { Bot } from "grammy";
import axios from "axios";
import keys from './secret.json'
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';


/**
 * the keys are in secret.json (vediamo se compila)
 */

var telegram_key = keys.telegram_key;
var nasa_key = keys.nasa_key;

// Create an instance of the `Bot` class and pass your authentication token to it.
const bot = new Bot(telegram_key); // <-- put your authentication token between the ""

function showpicture(ctx:any){
    axios.get("https://api.nasa.gov/planetary/apod?api_key=" + nasa_key)
            .then(res => {
                console.log(res.data);
                if (res.data.date !== lastDate) {
                    try{
                        bot.api.sendPhoto(ctx.chat.id, res.data.hdurl).then(() => {
                            bot.api.sendMessage(ctx.chat.id, res.data.title + "\n" + '"' + res.data.explanation + '"');
                        })
                        lastDate = res.data.date;

                        try {
                            writeFileSync('./lastDate.log', lastDate);
                            // file written successfully
                        } catch (err) {
                            console.error(err);
                        }

                    } catch(err){
                        console.log('errore durante invio messaggi: ', err)
                    }

                    
                }

            })
}

let content = undefined

try{
    content = readFileSync('./lastDate.log', {encoding:'utf8', flag:'r+'});
}catch (e){
    console.log('please create a file called "lastDate.log" / an error occured')
}


let lastDate: any = undefined

if(content !== undefined){
    lastDate = content
}

console.log('date of the last photo: ', lastDate)

bot.command("start", (ctx) => {
    console.log(ctx.from);
    showpicture(ctx)
    setInterval(showpicture, 3600000, ctx) //controlla ogni ora
})

// Start the bot.
bot.start();

console.log("bot avviato!")
