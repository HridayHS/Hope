const fs = require('fs');
const { ChannelType } = require('discord.js');

/* Bot Permissions */
const botPermissions = ['Administrator', 'ManageChannels', 'ViewChannel', 'SendMessages', 'ManageMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'AddReactions', 'Connect', 'Speak'];

/* Bot version */
const packageJson = fs.readFileSync('./package.json');
const botVersion = JSON.parse(packageJson)['version'];

/* getAllFiles */
const path = require('path');

const getAllFiles = dir =>
	fs.readdirSync(dir).reduce((files, file) => {
		const name = path.join(dir, file);
		const isDirectory = fs.statSync(name).isDirectory();
		return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
	}, []);

/* Image dominant color */
const { getAverageColor } = require('fast-average-color-node');
const imgDominantColor = img => getAverageColor(img, { algorithm: 'dominant', mode: 'speed', ignoredColor: [0, 0, 0, 0] });

/**
 * Check if bot/member have the required permission(s) to execute the command,
 * If not then it returns false and sends a text message stating which permissions are missing.
 */
function hasCommandPermissions(message, botCommand, botPerms = false) {
	// If command does not require any permission or message channel is DMChannel, return true.
	if (!botCommand.permissions || message.channel.type === ChannelType.DM) {
		return true;
	}

	const Perms = botCommand.permissions[botPerms ? 'bot' : 'member'];
	if (!Perms) {
		return true;
	}

	const hasPermissions = message.channel.permissionsFor(botPerms ? message.guild.members.me : message.member).has(Perms);

	if (hasPermissions) {
		return true;
	} else {
		const missingPerms = [];

		// Check which permission is missing and push it into missingPerms array;
		for (let i = 0; i < Perms.length; i++) {
			const Permission = Perms[i];
			const hasPermission = message.channel.permissionsFor(botPerms ? message.guild.members.me : message.member).has(Permission);
			if (!hasPermission) {
				missingPerms.push(Permission);
			}
		}

		const PermsHumnanReadable = missingPerms.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
		message.channel.send(`${botPerms ? 'I' : `<@${message.author.id}>, You`} do not have the required permissions to perform this action.` + '\n`Permissions required:` `' + PermsHumnanReadable.join(', ') + '`');
		return false;
	}
}

/* Custom date format */
const customDateFormat = (date = new Date(), withTime = false) => {
	const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const Date = date.getDate();
	const Day = Days[date.getDay()];
	const Month = Months[date.getMonth()];
	const Year = date.getFullYear();

	let string = `${Day}, ${Month} ${Date}, ${Year}`;

	if (withTime) {
		const timeIn12Hour = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
		string += ' ' + timeIn12Hour;
	}

	return string;
};

/* Server region name normalized (HR = Human Readable) */
const serverLocaleHR = locale => {
	switch (locale) {
		case 'en-US':
			return 'English (United States)';
		case 'en-GB':
			return 'English (Great Britain)';
		case 'bg':
			return 'Bulgarian';
		case 'zh-CN':
			return 'Chinese (China)';
		case 'zh-TW':
			return 'Chinese (Taiwan)';
		case 'hr':
			return 'Croatian';
		case 'cs':
			return 'Czech';
		case 'da':
			return 'Danish';
		case 'nl':
			return 'Dutch';
		case 'fi':
			return 'Finnish';
		case 'fr':
			return 'French';
		case 'de':
			return 'German';
		case 'el':
			return 'Greek';
		case 'hi':
			return 'Hindi';
		case 'hu':
			return 'Hungarian';
		case 'it':
			return 'Italian';
		case 'ja':
			return 'Japanese';
		case 'ko':
			return 'Korean';
		case 'lt':
			return 'Lithuanian';
		case 'no':
			return 'Norwegian';
		case 'pl':
			return 'Polish';
		case 'pt-BR':
			return 'Portuguese (Brazil)';
		case 'ro':
			return 'Romanian';
		case 'ru':
			return 'Russian';
		case 'es-ES':
			return 'Spanish (Spain)';
		case 'sv-SE':
			return 'Swedish';
		case 'th':
			return 'Thai';
		case 'tr':
			return 'Turkish';
		case 'uk':
			return 'Ukrainian';
		case 'vi':
			return 'Vietnamese';
	}
};

module.exports = {
	botPermissions,
	botVersion,
	customDateFormat,
	getAllFiles,
	hasCommandPermissions,
	imgDominantColor,
	serverLocaleHR
};