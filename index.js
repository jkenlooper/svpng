const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

const template = path.join(__dirname, "template", "index.html.ejs");
const render = ejs.compile(`${fs.readFileSync(template)}`);

/**
 * Creates a PNG from an SVG with rendering based on passed options.
 *
 * @param {String} src - Path to source SVG file
 * @param {String} dest - Path to save generated PNG
 * @param {Object} options - Rendering options
 * @return {String} - Path to generated PNG
 */
const convertSvgToPng = async (src, dest, options) => {
	// Merge passed options with defaults
	options = {
		...convertSvgToPng.DEFAULTS,
		...options,
	};

	// Force omitBackground to false if backgroundColor is set
	if (options.backgroundColor) {
		options.omitBackground = false;
	}

	// Confirm source file exists
	if (!fs.existsSync(src)) {
		throw new Error(`SVG file not found at "${src}".`);
	}

	// Throw if destination file exists and overwrite option is false
	if (fs.existsSync(dest) && !options.overwrite) {
		throw new Error(`File exists at "${dest}".`);
	}

	// Use fallback svg length in case size cannot be determined
	let info = {
		width: options.defaultSvgLength,
		height: options.defaultSvgLength,
	};

	// Retrieve contents of SVG file
	const svg = `${fs.readFileSync(src, "utf8")}`;

	// Create an HTML page with the SVG embedded
	const markup = render({
		svg: svg,
		backgroundColor: options.backgroundColor,
	});

	// Launch a puppeteer instance
	const browser = await puppeteer.launch(
		{defaultViewport: {width: 1920, height: 1080}}
	);

	// Create a puppeteer browser
	const page = await browser.newPage();

	// Load the generated HTML markup into the browser
	await page.setContent(markup);

	// Set width and height based on passed options
	let { width, height } = options;


	// Set the size of the browser viewport to match
	// the computed dimensions of the SVG
	await page.setViewport({
		width: width,
		height: height,
		deviceScaleFactor: 1,
	});

	// Take a screenshot of the browser, saving output to
	// destination location, with optional transparent background
	await page.screenshot({
		omitBackground: options.omitBackground,
		path: dest,
	});

	// Close browser instance
	await browser.close();

	// Return the path to the screenshot
	return dest;
};

convertSvgToPng.DEFAULTS = {
	defaultSvgLength: 1000,
	backgroundColor: null,
	omitBackground: true,
	overwrite: false,
	height: null,
	width: null,
	trim: false,
};

module.exports = convertSvgToPng;
