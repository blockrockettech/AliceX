const functions = require('firebase-functions');
const wizardNotificationService = require('./wizard-notification-service');
const firestoreService = require('./firestore-service');
const notificationService = require('./notification-service');

exports.challengeNotifier = functions.firestore
    .document('wizards/network/{network}/{wizardId}/duel/{challengeId}')
    .onWrite(async (change, context) => {
        console.log('**Executing challenge notifier**');

        const network = context.params.network;
        const wizardId = context.params.wizardId;
        const challengeId = context.params.challengeId;
        console.log(`Context params: Network - ${network}, Wizard ID: ${wizardId}, Challenge ID: ${challengeId}`);

        const document = change.after.exists ? change.after.data() : null;
        const oldDocument = change.before.data();

        // promise returned from the function
        let processor = null;

        // An undefined document means the challenge has been revoked
        // An undefined oldDocument means that the challenge is new
        // Anything else is an update to an existing challenge on one or more sides
        if (!document) {
            console.log('Challenge revoked');
            processor = await wizardNotificationService.notifyChallengedWizard(
                oldDocument,
                wizardNotificationService.notifyChallengeRevoked,
                wizardId,
                network
            );
        } else if(!oldDocument) {
            console.log('New challenge received');
            processor = await wizardNotificationService.notifyChallengedWizard(
                document,
                wizardNotificationService.notifyNewChallengeReceived,
                wizardId,
                network
            );
        } else {
            console.log('Challenge updated');
            processor = await wizardNotificationService.notifyChallengedWizard(
                oldDocument,
                wizardNotificationService.notifyChallengeUpdated,
                wizardId,
                network
            );
        }

        console.log('**End of challenge notifier**');
        return processor;
    });

exports.wizardPokeNotifier = functions.firestore
    .document('wizards/network/{network}/{wizardId}/poke/{pokeId}')
    .onWrite(async (change, context) => {
        console.log('**Executing wizard poke notifier**');
        const network = context.params.network;
        const wizardId = context.params.wizardId;
        const pokeId = context.params.pokeId;
        console.log(`Context params: Network - ${network}, Wizard ID: ${wizardId}, pokeId: ${pokeId}`);

        const document = change.after.exists ? change.after.data() : null;
        const oldDocument = change.before.data();

        // promise returned from the function
        let processor = null;

        if(!oldDocument) {
            console.log('New poke received');

            // Get the device messaging token (firebase messaging token)
            const wizard = await firestoreService.getWizard(network, wizardId);
            console.log('wizard', wizard);
            if (!wizard || (wizard && !wizard.owner)) {
                console.error(`Unable to retrieve wizard / owner data for wizard ID ${wizardId}. Exiting early...`);
                return null;
            }

            const registrationToken = await firestoreService.getFirebaseDeviceMessagingToken(wizard.owner);
            if (!registrationToken) {
                console.error(`Unable to retrieve a firebase messaging token for ${wizard.owner}. Exiting early...`);
                return null;
            }

            processor = notificationService.sendNotification(
                registrationToken,
                `Poke alert`,
                "lol"
            );
        }

        return processor;
    });

exports.kittiePokeNotifier = functions.firestore
    .document('kitties/network/{network}/{kittieId}/poke/{pokeId}')
    .onWrite(async (change, context) => {
        console.log('**Executing kittie poke notifier**');
        const network = context.params.network;
        const kittieId = context.params.kittieId;
        const pokeId = context.params.pokeId;
        console.log(`Context params: Network - ${network}, kittieId: ${kittieId}, pokeId: ${pokeId}`);

        const document = change.after.exists ? change.after.data() : null;
        const oldDocument = change.before.data();

        // promise returned from the function
        let processor = null;

        if(!oldDocument) {
            console.log('New poke received');

            // Get the device messaging token (firebase messaging token)
            const kittie = await firestoreService.getKittie(network, kittieId);
            console.log('kittie', kittie);
            if (!kittie || (kittie && !kittie.owner)) {
                console.error(`Unable to retrieve kittie / owner data for kittie ID ${kittieId}. Exiting early...`);
                return null;
            }

            const {firebaseMessagingToken} = await firestoreService.getAccount(kittie.owner);
            const registrationToken = firebaseMessagingToken;
            if (!registrationToken) {
                console.error(`Unable to retrieve a firebase messaging token for ${kittie.owner}. Exiting early...`);
                return null;
            }

            const {msg, from, stud} = document;
            const fromIcon = (await firestoreService.getAccount(from)).icon;
            processor = notificationService.sendNotification(
                registrationToken,
                `Poke alert`,
                `${msg}`,
                {
                    kittieId,
                    icon: fromIcon,
                    fromAddress: from,
                    stud
                }
            );
        }

        return processor;
    });

exports.kittieSwipeNotifier = functions.firestore
    .document('kitties/network/{network}/{kittieId}/swipeRight/{pokeId}')
    .onWrite(async (change, context) => {
        console.log('**Executing kittie swipe notifier**');
        const network = context.params.network;
        const kittieId = context.params.kittieId;
        const pokeId = context.params.pokeId;
        console.log(`Context params: Network - ${network}, kittieId: ${kittieId}, swipeId: ${pokeId}`);

        const document = change.after.exists ? change.after.data() : null;
        const oldDocument = change.before.data();

        // promise returned from the function
        let processor = null;

        if(!oldDocument) {
            console.log('New swipe received');

            // Get the device messaging token (firebase messaging token)
            const kittie = await firestoreService.getKittie(network, kittieId);
            if (!kittie || (kittie && !kittie.owner && !kittie.owner.address)) {
                console.error(`Unable to retrieve kittie / owner data for kittie ID ${kittieId}. Exiting early...`);
                return null;
            }

            const {firebaseMessagingToken} = await firestoreService.getAccount(kittie.owner.address);
            const registrationToken = firebaseMessagingToken;
            if (!registrationToken) {
                console.error(`Unable to retrieve a firebase messaging token for ${kittie.owner.address}. Exiting early...`);
                return null;
            }

            const {msg, from, stud} = document;
            processor = notificationService.sendNotification(
                registrationToken,
                `[[${network}]] Swipe right on your kitty (${kittieId})`,
                `${msg}`,
                {
                    kittieId,
                    icon: stud.studImg,
                    fromAddress: from,
                    stud: stud.id
                }
            );
        }

        return processor;
    });
