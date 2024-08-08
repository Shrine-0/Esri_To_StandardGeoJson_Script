const express = require('express');
const app = express();
const fs = require('fs').promises;
const path = require('path');

const arcgisToGeoJSON = require('@terraformer/arcgis').arcgisToGeoJSON;

const folderPaths = [
    '/users/nischal/downloads/Region_5_Branch_boundaries',
    '/users/nischal/downloads/Region_6_Branch_boundaries',
    '/users/nischal/downloads/Region_7_Branch_boundaries',
    // '/users/nischal/downloads/Region_4_Branch_boundaries'
];

const fileRead = async (folderPath) => {
    let standardGeoJsonFile = [];
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fs.lstat(filePath);
            if (stats.isFile()) {
                const data = await fs.readFile(filePath, 'utf-8');
                standardGeoJsonFile.push(arcgisToGeoJSON(JSON.parse(data)));
            }
        }
    } catch (err) {
        console.error({ "Error": err });
        return [err];
    }
    return standardGeoJsonFile;
}

const fileWrite = async (standardGeoJsonGFiles, folderName) => {
    try {
        console.info(`writing for folder: region-${folderName}`);
        let i = 1;
        for (file of standardGeoJsonGFiles) {
            const folderPath = `./files/region-${folderName}`;
            const filePath = `${folderPath}/region-${folderName}-Branch-Boundaries-${i}.json`;
            if (await folderExists(folderPath)) {
                await fs.writeFile(filePath, JSON.stringify(file));
            } else {
                await fs.mkdir(folderPath, { recursive: true });
                await fs.writeFile(filePath, file);
            }
            i++;
        }
    } catch (err) {
        console.error({ 'error': err });
    }
}

const fileAppend = async (standardGeoJsonGFiles, folderName) => {
    try {
        console.info(`writing for folder: region-${folderName}`);
        for (file of standardGeoJsonGFiles) {
            const folderPath = `./files/region-${folderName}`;
            const filePath = `${folderPath}/region-${folderName}-Branch-Boundaries.json`;
            if (await folderExists(folderPath)) {
                await fs.appendFile(filePath, JSON.stringify(file.features[0]) + ',');
            } else {
                await fs.mkdir(folderPath, { recursive: true });
                await fs.appendFile(filePath, JSON.stringify(file.features[0]));
            }
        }
    } catch (err) {
        console.error({ 'error': err });
    }
};

const folderExists = async (folderPath) => {
    try {
        const stats = await fs.stat(folderPath);
        return true;
    } catch (err) {
        return false;
    }
}

const main = async () => {
    let standardGeoJsonFileOuter = [];

    for (const fpath of folderPaths) {
        const arr = await fileRead(fpath);
        standardGeoJsonFileOuter.push(arr);
    }

    for (let [index, file] of standardGeoJsonFileOuter.entries()) {//entries() is like enumerate in python 
        await fileAppend(file, index + 5);
    }
}

main();
