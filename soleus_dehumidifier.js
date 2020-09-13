
var request = require('request'), zlib = require('zlib');
var requestPromise = require('request-promise');



class Dehumidifier {
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Chigo/1.0.180305 (iPhone; iOS 12.1.2; Scale/3.00)',
        'Accept-Language': 'en-US;q=1'
    }
    auth_header = {
        'authorization': 'auth_token '
    }
    config = {
        "email": "",
        "password": "",
        "device_id": "",
        "app_id": "",
        "app_secret": ""
    }
    signInOptions = {// these options get passed to RequestPromise library
        headers: this.headers,
        uri: 'https://user-field.aylanetworks.com/users/sign_in.json',
        method: 'POST',
        json: {
            "user":
            {
                "email": this.config.email,
                "application":
                {
                    "app_id": this.config.app_id,
                    "app_secret": this.config.app_secret
                },
                "password": this.config.password
            }
        }
        // json: true //Automatically stringfys the body to json
    };
    features = { // these keys are used to identify the device property map.... which we pull into device_properties = {}
        datetime_updated: "",
        speed: {
            key: '136934050',
            value: 1
        },
        pump: {
            key: '136934077',
            name: 't_waterpump',
            value: 1 //1 is on and 0 is off
        },
        state: {
            key: '136934053',
            name: 't_power',
            value: 1 // 1 is on and 0 off
        },
        humidity: {
            key: '136934055',
            name: 'f_e_waterfull',
            value: 50 //default value //min 30 max 60
        },
        waterLvl: {
            key: '136934079',
            value: 0
        },
        filterHealth: {
            key: '136934066',
            name: 't_health_clean',
            value: 0
        },
        mode: {
            key: '136934051 ',
            name: 't_work_mode',
            value: 3
        }
    }

    devicePropsOptions = {// these options get passed to RequestPromise library
        headers: this.header,
        uri: 'https://ads-field.aylanetworks.com/apiv1/dsns/' + this.config.device_id + '/properties.json',
        json: true
    }
    device_properties = {} //should be a map of maps after getProps is called because these people are using graphql most likely
    featurePayload = { // the payload to include with the corresponding options variable in the json variables
        'datapoint': {
            'value': 0 //off
        }
    }
    speedOptions = { // these options get passed to RequestPromise library
        uri: 'https://ads-field.aylanetworks.com/apiv1/properties/' + this.features.speed.key + '/datapoints.json',
        method: 'POST',
        json: this.featurePayload
    }
    pumpOptions = { // these options get passed to RequestPromise library
        uri: 'https://ads-field.aylanetworks.com/apiv1/properties/' + this.features.pump.key + '/datapoints.json',
        method: 'POST',
        json: this.featurePayload
    }
    stateOptions = {// these options get passed to RequestPromise library
        uri: 'https://ads-field.aylanetworks.com/apiv1/properties/' + this.features.state.key + '/datapoints.json',
        method: 'POST',
        json: this.featurePayload
    }
    async signIn() { // fetches the access_token
        try {
            const parsedBody = await requestPromise(this.signInOptions);
            this.access_token = parsedBody.access_token;
            this.refresh_token = parsedBody.refresh_token;
            this.auth_header.authorization = 'auth_token ' + parsedBody.access_token
            return requestPromise
        }
        catch (err) {
            console.log("We hit a snag logging in %s", err);
        }
    }
    async getProps() {// This function literally gets the properties for all state and features
        try {
            Object.assign(this.headers, this.auth_header);
            this.devicePropsOptions.headers = this.headers;
            const parsedBody = await requestPromise(this.devicePropsOptions);
            this.device_properties = parsedBody
        }
        catch (err) {
            console.log("We hit a retrieving properties %s", err);
        }
    }
    async setSpeed(speed) {
        // Returns true if the speed is saved and false otherwise
        try {
            Object.assign(this.headers, this.auth_header);
            this.speedOptions.headers = this.headers;
            if (await speed != this.speedOptions.json.datapoint.value) {
                switch (await speed.toLowerCase()) {
                    case await 'low': {
                        this.speedOptions.json.datapoint.value = 1;
                        break;
                    }
                    case await 'med': {
                        this.speedOptions.json.datapoint.value = 2;
                        break;
                    }
                    case await 'high': {
                        this.speedOptions.json.datapoint.value = 3;
                        break;
                    }
                    default: {
                        this.speedOptions.json.datapoint.value = 0;
                        break;
                    }
                }
                console.log(this.speedOptions.headers)
                console.log(this.speedOptions)
                const parsedBody = await requestPromise(this.speedOptions);
                try { return this.speed = await parsedBody.datapoint.value }
                catch { return nil } // cache the state
            }
            return nil
        }
        catch (err) {
            console.log("We hit a retrieving properties %s", err);
        }
    }
    async setState(state) {
        try {
            Object.assign(this.headers, this.auth_header);
            this.stateOptions.headers = this.headers;
            // convert on/off to 1/0
            this.stateOptions.json.datapoint.value = ((await state.toLowerCase() == 'on') ? 1 : 0);
            var parsedBody = await requestPromise(this.stateOptions); // make call to 
            try { return this.state = ((await parsedBody.datapoint.value > 0) ? true : false) }
            catch { return this.state = false; } // cache the state
            return false
        }
        catch (err) {
            console.log("We hit a retrieving properties %s", err);
            // console.log(err.response)
        }
    }
    async setPump(state) {
        try {
            Object.assign(this.headers, this.auth_header);
            this.pumpOptions.headers = this.headers;
            // convert on/off to 1/0
            this.pumpOptions.json.datapoint.value = ((await state.toLowerCase() == 'on') ? 1 : 0);
            var parsedBody = await requestPromise(this.pumpOptions); // make call to 
            try { return this.pump = ((await parsedBody.datapoint.value > 0) ? true : false) }
            catch { return this.pump = false; }// cache the state 
            return false
        }
        catch (err) {
            console.log("We hit a retrieving properties %s", err);
            // console.log(err.response)
        }
    }
    async getProperty(property) { //returns 

    }
}


// var test = new Dehumidifier();
// var tempState = 'on';
// var tempPump = tempState;
// var tempSpeed = 'low'
// function temp() {
//     test.signIn()
//         .then(function () {
//             console.log('signing in') //Test signing in
//             console.log(test.access_token);
//             test.getProps() //test getting the device properties
//                 .then(function () {
//                     console.log('getting properties')
//                     // console.log(test.device_properties)
//                 }).then(function () { //STATE
//                     // if (test.state == 'off') {
//                     //     tempState = 'on';
//                     // }
//                     // else {
//                     //     tempState = 'off';
//                     // }
//                     test.setState(tempState) // Test On/Off
//                         .then(function () {
//                             console.log('Turning device %s', tempState)
//                             console.log(test.state)
//                         })
//                         .then(function () {// Test Pump On/Off
//                             // if (test.pump == 'on') {
//                             //     tempPump = 'on';
//                             // }
//                             // else {
//                             //     tempPump = 'off';
//                             // }
//                             test.setPump(tempPump)
//                                 .then(function () {
//                                     console.log('Turning pump %s', tempPump)
//                                     console.log(test.pump)
//                                 })
//                         })
//                         .then(function () {// Test Fan Speed

//                             test.setSpeed(tempSpeed)
//                                 .then(function () {
//                                     console.log('Turning speed to %s', tempSpeed)
//                                     console.log(test.speed)
//                                 })
//                         })
//                 })
//         }
//         )

// }
// temp();
