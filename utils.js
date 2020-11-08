const fs = require('fs');

/* Avatar average color */
const { DataResolver } = require('discord.js');
const { getAverageColor } = require('fast-average-color-node');

async function imageAverageColor(image) {
	const imageBuffer = await DataResolver.resolveFileAsBuffer(image);
	const imageAverageColor = await getAverageColor(imageBuffer);
	return imageAverageColor.hex;
}

/* Bot Permissions */
const botPermissions = ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'CONNECT', 'SPEAK'];

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

/**
 * Check if bot/member have the required permission(s) to execute the command,
 * If not then it returns false and sends a text message stating which permissions are missing.
 */
function hasCommandPermissions(message, botCommand, botPerms = false) {
	// If command does not require any permission or message channel is DMChannel, return true.
	if (!botCommand.permissions || message.channel.type === 'dm') {
		return true;
	}

	const Perms = botCommand.permissions[botPerms ? 'bot' : 'member'];
	if (!Perms) {
		return true;
	}

	const hasPermissions = message.channel.permissionsFor(botPerms ? message.guild.me : message.member).has(Perms);

	if (hasPermissions) {
		return true;
	} else {
		const missingPerms = [];

		// Check which permission is missing and push it into missingPerms array;
		for (let i = 0; i < Perms.length; i++) {
			const Permission = Perms[i];
			const hasPermission = message.channel.permissionsFor(botPerms ? message.guild.me : message.member).has(Permission);
			if (!hasPermission) {
				missingPerms.push(Permission);
			}
		}

		const PermsHumnanReadable = missingPerms.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
		message.channel.send(`${botPerms ? 'I' : `<@${message.author.id}>, You`} do not have the required permissions to perform this action.` + '\n`Permissions required:` `' + PermsHumnanReadable.join(', ') + '`');
		return false;
	}
}

/* Custom date format for bot */
const Time12To24 = date => {
	const Hours = date.getHours();
	const Minutes = date.getMinutes();

	const HoursIn12 = (Hours === 0) ? 12
		: (Hours > 12) ? (Hours - 12)
			: Hours;

	const HourText = HoursIn12;
	const MinuteText = (Minutes <= 9) ? '0' + Minutes : Minutes;

	return HourText + ':' + MinuteText;
};

const customDateFormat = (date, withTime = false) => {
	const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	let string = `${Days[date.getDay()]}, ${date.getDate()} ${Months[date.getMonth()]}, ${date.getFullYear()}`;

	if (withTime) {
		string += ` ${Time12To24(date)} ${date.getHours() > 12 ? 'PM' : 'AM'}`;
	}

	return string;
};

/* Server region name normalized (HR = Human Readable) */
const serverRegionHR = region => {
	switch (region) {
		case 'hongkong':
			return 'Hong Kong';
		case 'southafrica':
			return 'South Africa';
		case 'us-central':
			return 'US Central';
		case 'us-east':
			return 'US East';
		case 'us-south':
			return 'US South';
		case 'us-west':
			return 'US West';
		default:
			return region.charAt(0).toUpperCase() + region.slice(1);
	}
};

module.exports = {
	botPermissions,
	botVersion,
	customDateFormat,
	getAllFiles,
	hasCommandPermissions,
	imageAverageColor,
	serverRegionHR
};