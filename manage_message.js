'use strict';

const config = require('dotenv').config()
    , process = require('process')
    , {
        authenticatedLndGrpc,
        signMessage,
        verifyMessage
    } = require('ln-service')
;

function getParameter(key) {
    return config.parsed[key];
}

(async function () {
    const cert = getParameter('CERT');
    const macaroon = getParameter('MACAROON')
    const socket = getParameter('SOCKET')
    const messageToSign = process.argv[2] ? process.argv[2] : 'hello world'

    async function initClient() {
        return authenticatedLndGrpc({ cert, macaroon, socket});
    }

    async function init2Client() {
        const cert = getParameter('CERT2');
        const macaroon = getParameter('MACAROON2')
        const socket = getParameter('SOCKET2')

        return authenticatedLndGrpc({ cert, macaroon, socket});
    }

    async function signMessageMethod() {
        try {
            const { lnd } = await init2Client();

            const { signature } = await signMessage({ lnd, message: messageToSign });

            return { signature }
        } catch (err) {
            console.error('error occur:')
            console.error(err)
        }

    }

    async function verifyMessageMethod(signature, message) {
        const { lnd } = await initClient();

        try {
            return (await verifyMessage({lnd, message, signature})).signed_by;
        } catch (err) {
            console.error('error occur:')
            console.error(err)
        }

    }

    const { signature } = await signMessageMethod();
    console.info('Signature: ' + signature);
    console.info('Message: ' + messageToSign);

    const signedBy = await verifyMessageMethod(signature, messageToSign);
    console.info('Signed by:', signedBy);
})()
