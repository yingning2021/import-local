'use strict';
const path = require('path');
const resolveCwd = require('resolve-cwd');
const pkgDir = require('pkg-dir');

module.exports = filename => {
	const globalDir = pkgDir.sync(path.dirname(filename));
	const relativePath = path.relative(globalDir, filename);
	const pkg = require(path.join(globalDir, 'package.json'));
	const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));
	const localNodeModules = path.join(process.cwd(), 'node_modules');

	const filenameInLocalNodeModules = !path.relative(localNodeModules, filename).startsWith('..')
		// On Windows, if `localNodeModules` and `filename` are on different partitions, `path.relative()` returns the value of `filename`, resulting in `filenameInLocalNodeModules` incorrectly becoming `true`.
		&& path.parse(localNodeModules).root === path.parse(filename).root;

	// Use `path.relative()` to detect local package installation,
	// because __filename's case is inconsistent on Windows
	// Can use `===` when targeting Node.js 8
	// See https://github.com/nodejs/node/issues/6624
	return !filenameInLocalNodeModules && localFile && path.relative(localFile, filename) !== '' && require(localFile);
};
