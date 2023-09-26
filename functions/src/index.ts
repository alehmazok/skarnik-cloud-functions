/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {analytics} from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import {AnalyticsEvent} from "firebase-functions/lib/v1/providers/analytics";
import {sendTelegram} from "./telegram";
import * as admin from "firebase-admin";

admin.initializeApp();

export const logTranslation = analytics.event("translation").onLog((event) => {
    logger.info("Event", event.params);
    const word = event.params.word;
    const direction = event.params.dict_name;
    const uri = event.params.uri;
    const message = `
word: <code>${word}</code>
direction: <code>${direction}</code>
link: <a href="${uri}"><code>${uri}</code></a>`;
    return processAnalyticsEvent(event, message);
});

async function processAnalyticsEvent(event: AnalyticsEvent, message = ""): Promise<void> {
    const date = new Date(event.logTime).toLocaleString(
        "be-BY",
        {
            timeZone: "Europe/Warsaw",
        },
    );
    return sendTelegram(`#${event.name}\n${message}\nTime: <code>${date}</code>`, event.user);
}
