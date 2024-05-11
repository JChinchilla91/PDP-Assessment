const glob = require("glob");
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const sass = require("sass");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { PurgeCSS } = require("purgecss");

const mode = process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development" ? "development" : "production";

// Build entries array, ignoring `.class.js` files
const entries = glob.sync("./src/scripts/**/*.js").reduce((acc, path) => {
	if (!path.includes(".class.js")) {
		const entry = path.replace(/^.*[\\/]/, "").replace(".js", "");
		acc[entry] = `./${path}`;
	}
	return acc;
}, {});

module.exports = {
	mode: mode,
	watch: true,
	entry: entries,
	output: {
		filename: "[name].js",
		chunkFilename: "[name].chunk.[chunkhash:5].js",
		path: path.resolve(__dirname, "assets"),
		clean: false,
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		new ESLintPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: "src/styles/**/*.*",
					to: "[name].css",
					globOptions: {
						ignore: ["src/styles/global/**"],
					},
					transform(content, path) {
						const purge = async (content, path) => {
							const result = sass.compile(path, {
								style: "compressed",
							});

							const css = result.css.toString();

							/**
							 * If production mode, purge CSS and return
							 * ?NOTE: Check the snippet purgecss-exceptions.liquid to add classes to avoid purging
							 */
							if (mode === "production") {
								const purgeCSSResult =
									await new PurgeCSS().purge({
										content: [
											// LIQUID Files (HTML Equivalent)
											"layout/**/*.liquid",
											"templates/**/*.liquid",
											"sections/**/*.liquid",
											"snippets/**/*.liquid",
											// JavaScript Files (Look for dynamically added classes)
											"src/scripts/**/*.js",
											"node_modules/bootstrap/**/*.js",
											"node_modules/flickity/**/*.js",
											// ADD ANY OTHER 3RD PARTY PACKAGE HERE
										],
										css: [{ raw: css }],
									});

								return purgeCSSResult[0]["css"];
							} else {
								// If development mode, skip purge CSS, return unpurged, compiled & compressed CSS
								return css;
							}
						};

						return Promise.resolve(purge(content, path));
					},
				},
				// Feed the Shopify /assets folder
				{
					from: "src/assets/*.*",
					to: path.resolve(__dirname, "assets", "[name][ext]"),
				},
			],
		}),
	],
	module: {
		rules: [
			{
				test: /.s?css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/env"],
				},
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
		],
	},
	watchOptions: {
		poll: true,
		ignored: /node_modules/,
	},
};