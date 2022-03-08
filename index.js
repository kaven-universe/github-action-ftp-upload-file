/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [github-action-ftp-upload-file] /index.js
 * @create:      2022-03-08 10:35:33.077
 * @modify:      2022-03-08 13:23:10.643
 * @version:     1.0.1
 * @times:       6
 * @lines:       211
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
 * @param {String} serverHost 
 * @param {Number} serverPort 
 * @param {String} serverUserName 
 * @param {String} serverUserPassword 
 * @param {Boolean} secure
 * @param {String} cwd 
 * @returns 
 */
async function upload(
    files,
    serverHost,
    serverPort,
    serverUserName,
    serverUserPassword,
    secure,
    cwd,
) {
    return new Promise((resolve, reject) => {

        // https://github.com/mscdex/node-ftp
        const ftpClient = new FTPClient();
        ftpClient
            .on("ready", () => {
                const put = async () => {
                    try {
                        for (const fileName of files) {
                            const exist = existsSync(fileName);
                            if (!exist) {
                                core.warning(`file not exists: ${fileName}`);
                                continue;
                            }

                            const fileSize = statSync(fileName).size;
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
                        }

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

        // server address can't include "ftp://" prefix
        serverHost = TrimStart(serverHost, "ftp://");
        serverHost = TrimStart(serverHost, "ftps://");

        const config = {
            host: serverHost,
            password: serverUserPassword,
            port: serverPort,
            user: serverUserName,
            secure: secure,
            secureOptions: {
                rejectUnauthorized: false,
            },
        };

        ftpClient.connect(config);
    });
}

async function main() {
    try {
        // inputs defined in action metadata file
        const debug = core.getBooleanInput("debug");

        const server = core.getInput("server");
        const port = Number(core.getInput("port"));

        const username = core.getInput("username");
        const password = core.getInput("password");

        const secure = core.getBooleanInput("secure");
        const cwd = core.getInput("cwd");

        const json_stringify_data = core.getInput("json_stringify_data");

        let file = core.getInput("file");
        let fileExists = true;
        let newFile = core.getInput("rename-file-to");

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
            const json_form_data = JSON.parse(json_stringify_data);

            if (debug) {
                console.log(json_form_data);
            }

            for (const item of json_form_data) {
                if (existsSync(item)) {
                    fileSet.add(item);
                } else {
                    core.warning(`file not exists: ${item}`);
                }
            }
        } catch (e) {
            console.warn(json_stringify_data, e);
        }

        await upload([...fileSet], server, port, username, password, secure, cwd);

        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
        // console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
