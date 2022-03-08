/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [github-action-ftp-upload-file] /index.js
 * @create:      2022-03-08 10:35:33.077
 * @modify:      2022-03-08 15:49:21.201
 * @version:     1.0.1
 * @times:       10
 * @lines:       223
 * @copyright:   Copyright © 2022 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

const { existsSync, renameSync, statSync } = require("fs");
const { join, dirname, basename } = require("path");

const core = require("@actions/core");
const github = require("@actions/github");

const { FileSize, TrimStart } = require("kaven-basic");
const FTPClient = require("ftp");


function logJson(data) {
    console.log(JSON.stringify(data, undefined, 2));
}

/**
 * 
 * @param {String[]} files 
 * @param {FTPClient.Options} config
 * @param {String} cwd 
 * @returns 
 */
async function upload(
    files,
    config,
    cwd,
) {
    return new Promise((resolve, reject) => {
        const start = performance.now();

        // https://github.com/mscdex/node-ftp
        const ftpClient = new FTPClient();
        ftpClient
            .on("ready", () => {
                const put = async () => {
                    try {
                        let count = 0;
                        let totalSize = 0;

                        for (const fileName of files) {
                            const exist = existsSync(fileName);
                            if (!exist) {
                                core.warning(`file not exists: ${fileName}`);
                                continue;
                            }

                            const fileSize = statSync(fileName).size;
                            totalSize += fileSize;
                            console.log(`upload file: ${fileName}, size: ${FileSize(fileSize)}`);

                            const destName = basename(fileName);
                            await new Promise((r, j) => {
                                ftpClient.put(fileName, destName, err => {
                                    if (err) {
                                        j(err);
                                    } else {
                                        r(fileName);
                                    }
                                });
                            });

                            count++;
                        }

                        const ms = performance.now() - start;
                        console.log(`${count} files, ${(ms / 1000).toFixed(2)}s, total size: ${FileSize(totalSize)}, speed: ${FileSize(totalSize * 1000 / ms)}/s`);

                        resolve(files);
                    } catch (ex) {
                        console.error(ex);
                        reject(ex);
                    } finally {
                        ftpClient.end();
                    }
                };

                if (cwd) {
                    ftpClient.cwd(cwd, err => {
                        if (err) {
                            reject(err);
                        } else {
                            put();
                        }
                    });
                } else {
                    put();
                }
            })
            .on("greeting", (welcome) => {
                console.log(welcome);
            })
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                console.log("ftp end");
            });


        ftpClient.connect(config);
    });
}

async function main() {
    try {
        // inputs defined in action metadata file
        const debug = core.getBooleanInput("debug");

        let host = core.getInput("host");
        const port = Number(core.getInput("port"));

        const user = core.getInput("user");
        const password = core.getInput("password");

        const secure = core.getBooleanInput("secure");
        const cwd = core.getInput("cwd");

        const files = core.getInput("files");

        let file = core.getInput("file");
        let fileExists = true;
        let newFile = core.getInput("rename-file-to");

        const connTimeout = Number(core.getInput("connTimeout"));
        const pasvTimeout = Number(core.getInput("pasvTimeout"));
        const keepalive = Number(core.getInput("keepalive"));

        const fileSet = new Set();

        if (debug) {
            logJson(process.env);
            console.log(__dirname, __filename);
        }

        if (!existsSync(file)) {
            if (debug) {
                file = __filename;
            } else {
                core.warning(`file not exists: ${file}`);
                fileExists = false;
            }
        }

        if (fileExists) {
            if (newFile) {

                const dir = dirname(file);
                newFile = join(dir, newFile);

                renameSync(file, newFile);
                console.log(`rename ${file} to ${newFile}`);

                file = newFile;
            }

            fileSet.add(file);
        }

        try {
            const json = JSON.parse(files);

            if (debug) {
                console.log(json);
            }

            for (const item of json) {
                if (existsSync(item)) {
                    fileSet.add(item);
                } else {
                    core.warning(`file not exists: ${item}`);
                }
            }
        } catch (e) {
            console.warn(files, e);
        }

        // server address can't include "ftp://" prefix
        host = TrimStart(host, "ftp://");
        host = TrimStart(host, "ftps://");

        /**
         * @type {FTPClient.Options}
         */
        const config = {
            host,
            password,
            port,
            user,
            secure,
            connTimeout,
            pasvTimeout,
            keepalive,
            secureOptions: {
                rejectUnauthorized: false,
            },
        };

        await upload([...fileSet], config, cwd);

        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
        // console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
