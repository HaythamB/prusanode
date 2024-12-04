const execSync = require("child_process").execSync;

const { time } = require("console");
const fs = require("fs");
const path = require('path');

const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;
const slicerPath = "\"C:\\Program Files\\Prusa3D\\PrusaSlicer\\\""


async function sliceModel(input_file) {
    const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;
    const output = execSync(
        `${slicerPath}prusa-slicer-console -g --output ${outputPath} ${filePath}/${input_file} --load settings.ini`,
        { encoding: "utf-8" }
    );

    console.log(`${slicerPath}prusa-slicer-console -g --output ${outputPath} ${filePath}/${input_file} --load settings.ini`);
    async function analyze(outputPath) {
        return new Promise(function (resolve, reject) {
            var duration = "";
            var distance = "";
            fs.readFile(outputPath, { encoding: 'utf-8' }, function (err, data) {
                if (err) {
                    console.log("Error thrown!!! *******************")
                    throw error;
                }
                let dataArray = data.split('\n');
                const keywordDistance = "filament used [mm]";
                const keywordDuration = "; estimated printing time (normal mode) = ";
                let lastIndex = -1;

                for (let index = 0; index < dataArray.length; index++) {
                    if (dataArray[index].includes(keywordDistance)) {
                        lastIndex = index;
                        distance = dataArray[index].substring(dataArray[index].indexOf(" = ") + 3,)
                    }
                    else {
                        if (dataArray[index].includes(keywordDuration)) {
                            lastIndex = index;
                            duration = dataArray[index].substring(dataArray[index].indexOf(" = ") + 3,)
                            break;
                        }
                    }
                }
                console.log(`Slicer duration: ${duration}`)
                let timeArray = duration.split(' ')
                let finalTime = 0
                switch (timeArray.length) {
                    case 4:
                        finalTime = parseInt(timeArray[0].slice(0,-1)) * 60 * 60 * 24 + parseInt(timeArray[1].slice(0,-1)) * 60 * 60 + parseInt(timeArray[2].slice(0,-1)) * 60 + parseInt(timeArray[3].slice(0,-1));
                        break;
                    case 3:
                        finalTime = parseInt(timeArray[0].slice(0,-1)) * 60 * 60 + parseInt(timeArray[1].slice(0,-1)) * 60 + parseInt(timeArray[2].slice(0,-1));
                        break;
                    case 2:
                        finalTime = parseInt(timeArray[0].slice(0,-1)) * 60 + parseInt(timeArray[1].slice(0,-1));
                        break;
                    case 1:
                        finalTime = parseInt(timeArray[0].slice(0,-1))
                        break;
                    default:
                        finalTime = -1;
                }
                resolve({ "printingTime": finalTime, "distance": parseFloat(distance), 'duration': duration })
            }
            );
        })
    }

    // Delete all files

    async function cleanUp() {
        const outputFiles = fs.readdirSync(`${appDir}/outputs/`);
        const modelFiles = fs.readdirSync(`${appDir}/uploads/`);
        for (const file of outputFiles) {
            const filePath = path.join(`${appDir}/outputs/`, file);
            fs.unlinkSync(filePath);
        }
        for (const file of modelFiles) {
            const filePath = path.join(`${appDir}/uploads/`, file);
            fs.unlinkSync(filePath);
        }
    }

    async function getResults() {
        return new Promise(function (resolve, reject) {
            analyze(outputPath).then(response => {
                resolve(response);
            });
        })
    }

    return new Promise(function (resolve, reject) {
        getResults().then(x => {
            resolve(x)
            // cleanUp();
        })
    })
    
};

module.exports = { sliceModel };
