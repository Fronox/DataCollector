const axios = require('axios');
const fs = require('fs');

async function getDataAPI(lat, long) {
    const rawData = await axios.get(`https://api.darksky.net/forecast/08cbb3ae9a4a55d50b2f1f3bc6bf2b56/${lat},${long}`);
    return rawData.data;
}

async function getDataFS(city, counter, path) {
    try {
        const fname = `${path}${city}/${city + counter}.json`;
        console.log(fname);
        const data = await fs.promises.readFile(fname, 'utf8');
        return data
    } catch (e) {
        return 0;
    }
}

const coords = [
    {
        city: 'Tallinn',
        lat: 59.437,
        lng: 24.7536
    },
    {
        city: 'Tartu',
        lat: 58.378,
        lng: 26.729
    },
    {
        city: 'Narva',
        lat: 59.3797,
        lng: 28.1791
    },
    {
        city: 'Helsinki',
        lat: 60.1699,
        lng: 24.9384
    },
    {
        city: 'Riga',
        lat: 56.9496,
        lng: 24.1052
    },
    {
        city: 'Stockholm',
        lat: 59.3293,
        lng: 18.0686
    },
    {
        city: 'Vilnius',
        lat: 54.6872,
        lng: 25.2797
    },
    {
        city: 'Turku',
        lat: 60.4518,
        lng: 22.2666
    },
    {
        city: 'Oslo',
        lat: 59.909620,
        lng: 10.779618
    },
    {
        city: 'Warsaw',
        lat: 52.211218,
        lng: 21.008944
    }
];

const dataSourcePath = '../datasource/';
const dataSinkPath = '../data/';
const stateFilePath = 'statefs.json';

async function execAPI() {
    const conf = JSON.parse(await fs.promises.readFile('state.json'));
    await Promise.all(coords.map(async ({city: city, lat: lat, lng: long}) => {
        const rawData = await getDataAPI(lat, long);
        rawData.city = city;
        const data = JSON.stringify(rawData);
        return fs.promises.writeFile(`${dataSourcePath + city + conf.counter}.json`, data);
    }));

    conf.counter += 1;
    await fs.promises.writeFile('state.json', JSON.stringify(conf));
}

async function execFs(){
    const conf = JSON.parse(await fs.promises.readFile('statefs2.json'));
    let newCounter = conf.counter + 1;
    await Promise.all(coords.map(async ({city: city, lat: lat, long: long}) => {
        let data = await getDataFS(city, conf.counter, dataSourcePath);
        if (data === 0) { //If this file does not exists (counter is out of range)
            newCounter = 1;
            data = await getDataFS(city, newCounter, dataSourcePath);
        }
        return fs.promises.writeFile(`${dataSinkPath + city + Date.now()}.json`, data);
    }));

    console.log(`${conf.counter}`);
    conf.counter = newCounter;
    await fs.promises.writeFile(stateFilePath, JSON.stringify(conf));
}

setInterval(execFs, 1000);
