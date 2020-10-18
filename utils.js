/* Bot Icon */
const botIconURL = 'https://cdn.discordapp.com/app-icons/545420239706521601/9fb441dfa2135181808a394f8189c2cf.webp';

/* Bot Permissions */
const botPermissions = ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK'];

/* getAllFiles */
const fs = require('fs');
const path = require('path');

const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);

/* Custom date format for bot */
const customDateFormat = (date, withTime = false) => {
    const Time12To24 = () => {
        const Hours = date.getHours();
        const Minutes = date.getMinutes();

        const HoursIn12 = (Hours === 0) ? 12
            : (Hours > 12) ? (Hours - 12)
                : Hours;

        const HourText = HoursIn12;
        const MinuteText = (Minutes <= 9) ? '0' + Minutes : Minutes;

        return HourText + ':' + MinuteText;
    };

    const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let string = `${Days[date.getDay()]}, ${date.getDate()} ${Months[date.getMonth()]}, ${date.getFullYear()}`;

    if (withTime) {
        string += `${Time12To24()} ${date.getHours() > 12 ? 'PM' : 'AM'}`;
    }

    return string;
};

/* Server region name normalized (HR = Human Readable) */
const serverRegionHR = region => {
    switch (region) {
        case 'hongkong':
            return 'Hong Kong'
        case 'southafrica':
            return 'South Africa'
        case 'us-central':
            return 'US Central'
        case 'us-east':
            return 'US East'
        case 'us-south':
            return 'US South'
        case 'us-west':
            return 'US West'
        default:
            return region.charAt(0).toUpperCase() + region.slice(1);
    }
};

module.exports = {
    botIconURL,
    botPermissions,
    getAllFiles,
    customDateFormat,
    serverRegionHR
};