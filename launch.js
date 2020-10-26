const shell = require('shelljs');
const signale = require('signale');
const path = require('path');
const appInfo = require('./public/appinfo.json');
const device = 'UJ7260';

const package = `ares-package ./public -o ./dist`;
const install = `ares-install --device ${device} ./dist/${appInfo.id}_${appInfo.version}_all.ipk`;
const remove = `ares-install --device ${device} --remove ${appInfo.id}`;
const launch = `ares-launch --device ${device} ${appInfo.id}`;
const inspect = `ares-inspect --device ${device} --app ${appInfo.id} --open`;

signale.start(`Remove package ${appInfo.id} on ${device}`);
signale.info(remove);
shell.exec(remove);
signale.complete('Remove package\n');

signale.start(`Packaging ${appInfo.id}`);
signale.info(package);
shell.exec(package);
signale.complete();


signale.start(`Install package ${appInfo.id} on ${device}`);
signale.info(install);
shell.exec(install);
signale.complete('Install package\n');

signale.start(`Launch package ${appInfo.id} on ${device}`);
signale.info(launch);
shell.exec(launch);
signale.complete('Launch package\n');

signale.start(`Inspect ${appInfo.id} on ${device}`);
signale.info(inspect);
shell.exec(inspect);
signale.complete('Inspect\n');
