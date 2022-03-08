/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [github-action-ftp-upload-file] /.eslintrc.js
 * @create:      2021-11-18 20:56:44.405
 * @modify:      2022-03-08 10:28:30.880
 * @version:     1.0.1
 * @times:       4
 * @lines:       32
 * @copyright:   Copyright © 2021-2022 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "@wenkai.wu/eslint-config",
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
    },
};
