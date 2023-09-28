/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import { AnalyticsEvent, UserDimensions } from "firebase-functions/lib/v1/providers/analytics";
import * as logger from "firebase-functions/logger";
import { analytics } from "firebase-functions/v1";
import { sendTelegramString } from "./telegram";

admin.initializeApp();

export const logFirstOpen = analytics
    .event("first_open")
    .onLog((event) => {
        logger.info("Event", event.params);
        return processAnalyticsEvent(event);
    });

export const logTranslation = analytics
    .event("translation")
    .onLog((event) => {
        logger.info("Event", event.params);
        const word = event.params.word;
        const direction = event.params.dict_name;
        const uri = event.params.uri;
        const message = `word: <code>${word}</code>
direction: <code>${direction}</code>
link: <a href="${uri}">${uri}</a>`;
        return processAnalyticsEvent(event, message);
    });

async function processAnalyticsEvent(event: AnalyticsEvent, content = ""): Promise<void> {
    const tag = event.name;
    const time = composeTime(event.logTime);
    const userInfo = composeUserInfo(event.user);
    const message = composeMessage(tag, time, userInfo, content);
    return sendTelegramString(message);
}

function composeTime(logTime: string) {
    return new Date(logTime).toLocaleString(
        "be-BY",
        {
            timeZone: "Europe/Warsaw",
        },
    );
}

function composeUserInfo(user?: UserDimensions): string {
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

    return `language: <code>${language}</code>
location: <code>${city}</code>, <code>${country}</code>
device: <code>${brandName}</code>, <code>${marketingName}</code>, <code>${appPlatform}</code> <code>${platformVersion}</code>
version: <code>${appVersion}</code>
source: <code>${appStore}</code>`;
}

function composeMessage(tag: string, time: string, userInfo: string, content: string) {
    return `#${tag}
<code>${time}</code>
${userInfo}
${content}`;
}

