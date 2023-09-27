import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import axios, {isAxiosError} from "axios";


const apiToken = functions.config().skarnik.telegram.dev_group.api_token;
const chatId = functions.config().skarnik.telegram.dev_group.chat_id;

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
