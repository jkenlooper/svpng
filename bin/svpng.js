#!/usr/bin/env node
'use strict';

const program = require('commander');
const pkg = require('../package.json');
const convert = require('..');

program
	.version(pkg.version)
	.description(pkg.description)
	.arguments('<source> <output>')
	.helpOption('-H, --help', 'output usage information')
	.requiredOption('-h, --height <number>', 'set the height of the output image')
	.requiredOption('-w, --width <number>', 'set the width of the output image')
	.option('-b, --backgroundColor <color>', 'set the background color of the output image as any valid CSS color')
	.option('-f, --defaultSvgLength <number>', 'width and height to render output if SVG dimensions are invalid', convert.DEFAULTS.defaultSvgLength)
	.option('-y, --overwrite', 'overwrite output file if exists', false)
	.option('-t, --trim', 'trim the output image to the bounds of the SVG', false)
	.option('-o, --opaque', 'save the output image with an opaque background', false)
	.action(async (source, dest, options) => {
		const hrstart = process.hrtime();

		options.width = parseInt(options.width);
		options.height = parseInt(options.height);

		try {
			await convert(source, dest, options);
		} catch (error) {
			console.error(error.message || error);
			process.exit(1);
		}

		const hrend = process.hrtime(hrstart);
		console.log(`PNG written to "${dest}" in ${(hrend[0] + (hrend[1] / 1e9)).toFixed(4)}s`);
	});

if (process.argv.slice(2).length === 0) {
	program.outputHelp();
	process.exit();
}

program.parse(process.argv);
