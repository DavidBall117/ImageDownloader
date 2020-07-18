const fs = require(`fs`);
const axios = require(`axios`);
const yargs = require(`yargs`);
const path = require(`path`);

const options = yargs
  .usage(
    `Usage: -b <baseUrl> -i <imageType> -c <count> -f <folder> -si <startIndex>`
  )
  .option(`b`, {
    alias: `baseUrl`,
    describe: `Base URL for images you want to download`,
    type: `string`,
    demandOption: true,
  })
  .option(`i`, {
    alias: `imageType`,
    describe: `Extension for the images you are downloading (e.g. .png, .jpg)`,
    type: `string`,
    demandOption: true,
  })
  .option(`c`, {
    alias: `count`,
    describe: `The number of images to download (starts at 1)`,
    type: `number`,
    demandOption: true,
  })
  .option(`f`, {
    alias: `folder`,
    describe: `Path that images will be saved to (default is ./downloaded-images/)`,
    type: `string`,
  })
  .option(`si`, {
    alias: `startIndex`,
    describe: `The number to start at when downloading images (default is 1)`,
    type: `number`,
  }).argv;

const BASE_URL = options.baseUrl;
const IMAGE_TYPE = options.imageType;
const COUNT = options.count;
const FOLDER = options.folder || `./downloaded-images/`;
const START_INDEX = options.startIndex || 1;

const writeStreamErrorHandler = (err) => {
  console.log(
    `LOCAL ERROR OCCURED WHILE SAVING ${counter}${IMAGE_TYPE} to directory ${FOLDER}`
  );
  console.log(err);
};

const downloadImage = async (counter) => {
  const url = `${BASE_URL}${counter}${IMAGE_TYPE}`;
  try {
    const res = await axios({ url, method: `GET`, responseType: `stream` });
    if (res.status >= 200 && res.status < 300) {
      const directory = path.join(FOLDER, `${counter}${IMAGE_TYPE}`);
      const ws = fs.createWriteStream(directory, {
        flags: `w`,
      });
      ws.on(`error`, writeStreamErrorHandler);
      res.data.pipe(ws);
      console.log(`Successfully downloaded image at ${url}`);
    }
  } catch (err) {
    console.log(`NETWORK ERROR OCCURED RETRIEVING DATA FROM ${url}`);
    console.log(`Status: ${err.response.status}`);
  }
};

(async () => {
  if (!fs.existsSync(FOLDER)) {
    fs.mkdirSync(FOLDER);
  }
  for (let i = START_INDEX; i < START_INDEX + COUNT; i++) {
    await downloadImage(i);
  }
})();
