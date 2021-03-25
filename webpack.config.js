const path = require('path');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = (_, { mode}) => ({
	context: path.join(__dirname, 'src'),
	entry: [ './index.tsx' ],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'js/[name].[hash].js',
		chunkFilename: 'js/[name].[hash].bundle.js',
		publicPath: '/',
		clean: true
	},
	resolve: {
		extensions: [ '.ts', '.tsx', '.js', '.jsx' ],
		plugins: [ new TsConfigPathsPlugin() ]
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
							modules: {
								localIdentName: '[name]__[hash:base64:5]'
							}
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					}
				]
			},
			{
				test: /\.(png|jpg|gif|woff2?|ttf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[path][name].[hash].[ext]'
						}
					}
				]
			},
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader'
			}
		]
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
			minSize: 0,
			cacheGroups: {
				default: {
					minChunks: 1
				}
			}
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'gtin musicline scanner',
			inject: 'head'
		}),
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: 'defer'
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].[hash].css',
			chunkFilename: 'css/[name].[hash].bundle.css'
		})
	],

	devServer:
		mode === 'development'
			? {
					port: 3000,
					clientLogLevel: 'info',
					historyApiFallback: true,
					proxy: {
						'/api': {
							target: 'https://musicline.de/api/search',
							changeOrigin: true,
							ignorePath: true
						}
					}
				}
			: undefined
});
