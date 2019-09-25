const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');


class Client {
    constructor() {
        this.paypal_client = '';
        this.paypal_secret = '';

        this.getClient;
        


        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            const { PAYPAL_TEST_CLIENT_ID, PAYPAL_TEST_CLIENT_SECRET } = process.env;

            this.paypal_client = PAYPAL_TEST_CLIENT_ID;
            this.paypal_secret = PAYPAL_TEST_CLIENT_SECRET
        } else {
            const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

            this.paypal_client = PAYPAL_CLIENT_ID;
            this.paypal_secret = PAYPAL_CLIENT_SECRET;
        }

    }



   get client() {
        return this.getClient = new checkoutNodeJssdk.core.PayPalHttpClient(this.environment());
    }


    environment() {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            return new checkoutNodeJssdk.core.SandboxEnvironment(
                this.paypal_client, this.paypal_secret
            );
        }
        return new checkoutNodeJssdk.core.ProductionEnvironment(
            this.paypal_client, this.paypal_secret
        );
    }

    async prettyPrint(jsonData, pre = "") {
        let pretty = "";
        function capitalize(string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
        for (let key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                if (isNaN(key))
                    pretty += pre + capitalize(key) + ": ";
                else
                    pretty += pre + (parseInt(key) + 1) + ": ";
                if (typeof jsonData[key] === "object") {
                    pretty += "\n";
                    pretty += await prettyPrint(jsonData[key], pre + "    ");
                }
                else {
                    pretty += jsonData[key] + "\n";
                }

            }
        }
        return pretty;
    }


}

module.exports = new Client()