'use strict';

const QRCode = require('qrcode')
    , {
        authenticatedLndGrpc,
        createInvoice,
        subscribeToInvoices
    } = require('ln-service')   
;

(async function () {
    // init credentials
    const cert = '';
    const macaroon = ''
    const socket = ''

    /**
     * @returns 
     */
    async function initClient() {
        return authenticatedLndGrpc({ cert, macaroon, socket});
    }

    /**
     * @param {*} tokens 
     */
    async function generateInvoice(tokens = 0) {
        const {lnd} = await initClient();

        try {
            // Create a zero value invoice
            const invoice = await createInvoice({
                lnd, description: 'Lighting rocks!', tokens
            });

            QRCode.toFile('./invoice.png', invoice.request, {
                color: {
                  dark: '#dd9d2c',  // Blue dots
                //   light: '#0000' // Enable for transparent background
                }
              }, function (err) {
                if (err) throw err
                console.log('done')
              });
            
              return invoice;
        } catch (err) {
            console.log(err)
        }

    }

    async function testSubscribeToInvoices() {
        const {lnd} = authenticatedLndGrpc({ cert, macaroon, socket });

        try {
            const {once} = require('events');
            const sub = subscribeToInvoices({lnd});
            const [lastUpdatedInvoice] = await once(sub, 'invoice_updated');
            console.log(lastUpdatedInvoice)
        } catch (err) {
            console.log(err);
        }
    }

    console.log('Lighting invoice object:')
    const invoice = await generateInvoice();
    console.log(invoice)

    console.log("\n");
    console.log('Start listening for invoice changes..');
    console.log(await testSubscribeToInvoices());
})()
