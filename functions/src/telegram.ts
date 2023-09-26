import * as functions from "firebase-functions";
import {UserDimensions} from "firebase-functions/lib/v1/providers/analytics";
import * as logger from "firebase-functions/logger";
import axios, {isAxiosError} from "axios";


const apiToken = functions.config().skarnik.telegram.dev_group.api_token;
const chatId = functions.config().skarnik.telegram.dev_group.chat_id;
// const emoji = {
//     "aut": "🇦🇹",
//     "blr": "🇧🇾",
//     "can": "🇨🇦",
//     "che": "🇨🇭",
//     "cze": "🇨🇿",
//     "deu": "🇩🇪",
//     "dnk": "🇩🇰",
//     "est": "🇪🇪",
//     "fin": "🇫🇮",
//     "fra": "🇫🇷",
//     "gbr": "🇬🇧",
//     "hun": "🇭🇺",
//     "kaz": "🇰🇿",
//     "ltu": "🇱🇹",
//     "lva": "🇱🇻",
//     "nor": "🇳🇴",
//     "pol": "🇵🇱",
//     "rus": "🇷🇺",
//     "svk": "🇸🇰",
//     "svn": "🇸🇮",
//     "swe": "🇸🇪",
//     "ukr": "🇺🇦",
//     "usa": "🇺🇸",
// };


function userInfoString(user?: UserDimensions): string {
    // const uid = user?.userId;
    const language = user?.deviceInfo?.userDefaultLanguage;
    const brandName = user?.deviceInfo?.mobileBrandName;
    const marketingName = user?.deviceInfo?.mobileMarketingName;
    const platformVersion = user?.deviceInfo?.platformVersion;
    const appPlatform = user?.appInfo?.appPlatform;
    const country = user?.geoInfo?.country;
    const city = user?.geoInfo?.city;
    const appVersion = user?.appInfo?.appVersion;
    const appStore = user?.appInfo?.appStore;

    return `
language: <code>${language}</code>
location: <code>${city}</code>, <code>${country}</code>
device: <code>${brandName}</code>, <code>${marketingName}</code>, <code>${appPlatform}</code>, <code>${platformVersion}</code>
version: <code>${appVersion}</code>
source: <code>${appStore}</code>`;
}

export async function sendTelegram(message: string, user?: UserDimensions): Promise<void> {
    return sendTelegramString(message + userInfoString(user));
}

export async function sendTelegramString(message: string): Promise<void> {
    logger.info(`Sending message to Telegram, token=${apiToken}, chatId=${chatId}`);

    try {
        const escaped = decodeURI(message);
        const params = {
            chat_id: chatId,
            parse_mode: "HTML",
            text: escaped,
        };
        const url = `https://api.telegram.org/bot${apiToken}/sendMessage`;
        logger.info("Making request:", url, params);
        const response = await axios.get(url, {params: params});
        logger.info(response.status);
    } catch (error) {
        logger.error(error?.toString());
        if (isAxiosError(error)) {
            if (error.response != null) {
                logger.error(error.response.data);
            }
        }
    }

    return Promise.resolve();
}
