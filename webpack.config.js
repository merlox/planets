const path = require('path')
const htmlPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	mode: process.env.NODE_ENV,
	devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map',
	entry: ['@babel/polyfill', path.join(__dirname, 'src', 'index.js')],
	output: {
		path: path.join(__dirname, 'docs'),
		filename: 'build.js',
	},
	module: {
		rules: [
			{
				loader: 'babel-loader',
				test: /\.jsx?$/,
				exclude: /node_modules/,
				query: {
					presets: ['@babel/preset-env'],
				},
			},
		],
	},
	plugins: [
        new htmlPlugin({
            title: 'Generative arts',
            template: './src/index.ejs',
            hash: true,
        }),
		new CleanWebpackPlugin(), // Removes old build files
		new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/assets',
                    to: 'assets',
                }, {
					from: 'CNAME',
				}
            ]
        }),
    ],
}