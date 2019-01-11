let Discord = require('discord.js');
let client = new Discord.Client();
global.dsClient = client;
global.currentFight = null;

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

client.on('ready', () => {
  console.log(`I'm ready! ${client.user.tag}`);
});

function fight(message) {
  if (!('p1' in currentFight) || !('p2' in currentFight)) return message.channel.send('Ошибка');
  let embed = new Discord.RichEmbed();
  let miss = false;
  if (!getRndInteger(0, 1)) {
    let int = getRndInteger(0,20);
    currentFight.p2.hp -= int;
    if (int <= 0) {
      currentFight.actions.push(`  ${currentFight.p1.name} промахнулся`);
      miss = true;
    }
    else
      currentFight.actions.push(`  ${currentFight.p1.name} ${['снес', 'снес с вертухи'].randomElement()} ${currentFight.p2.name} ${int} здоровья`);
  } else {
    let int = getRndInteger(0,20);
    currentFight.p1.hp -= int;
    if (int <= 0) {
      currentFight.actions.push(`  ${currentFight.p2.name} промахнулся`);
      miss = true;
    }
    else
      currentFight.actions.push(`  ${currentFight.p2.name} ${['снес', 'снес с вертухи'].randomElement()} ${currentFight.p1.name} ${int} здоровья`);
  }
  let embedDescription = currentFight.actions.slice(-5).join('\n');
  let ended = false;
  if (currentFight.p1.hp <= 0) {
    embedDescription+=`\n\n${currentFight.p2.name} победил!`;
    embed.setThumbnail(currentFight.p2.avatar);
    ended = true;
  } else if (currentFight.p2.hp <= 0) {
    embedDescription+=`\n\n${currentFight.p1.name} победил!`;
    embed.setThumbnail(currentFight.p1.avatar);
    ended = true;
  } else {
    embedDescription += `\n\n${currentFight.p1.name} \`${currentFight.p1.hp}\`   -   \`${currentFight.p2.hp}\` ${currentFight.p2.name}`
  }
  embed.setDescription(embedDescription);
  embed.setColor(ended ? 'GREEN' : (miss ? 'RED' : '#36393f'));
  embed.setAuthor(ended ? 'Победа!' : 'Битва!');
  message.edit(ended ? '' : `${currentFight.p1.name} против ${currentFight.p2.name}`, embed).then(() => {
    if (!ended) setTimeout(() => fight(message), 1000);
    else global.currentFight = null;
  });
}

client.on('message', (message) => {
  // noinspection JSUnresolvedFunction
  if (message.author.bot || message.channel.type !== 'text' || !('guild' in message) || !message.content.toString().startsWith('!')) return;
  let args = message.content.trim().substring('!'.length).split(/ +/g);
  let command = args.shift().toLowerCase();
  if (command === 'fight') {
    if (currentFight !== null) return message.channel.send('Уже идёт битва.');
    let member = message.mentions.members.first();
    if (!member) return message.channel.send('Вы должны указать пользователя.');
    if (member.user.id === message.author.id) return message.channel.send('Вы не можете биться сами с собой.');
    message.channel.send(`${message.author} против ${member}`).then(msg => {
      global.currentFight = {
        p1: {
          name: message.author.toString(),
          avatar: message.author.avatarURL,
          hp: 100
        },
        p2: {
          name: member.user.toString(),
          avatar: member.user.avatarURL,
          hp: 100
        },
        actions: [],
        id: msg.id,
      };
      fight(msg);
    })
  }
})

client.login(process.env.token).catch(console.error);
