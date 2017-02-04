/*
 * Ghost Storage Module
 * for Google Cloud Storage
 *
 * @author: Troy Kelly <troy.kelly@aicial.com> (https://aicial.com)
 * @date: 4 February 2017
 */
'use strict';

var Promise = require('bluebird'),
	util = require('util'),
	baseStore = require('../../core/server/storage/base'),
	errors = require('../../core/server/errors'),
	options = {},
	bucket;

var ghostStorageGoogleCloud = function(config) {
	baseStore.call(this);
	options = config || {};

	if (options.projectId === undefined && process.env.GCLOUD_PROJECT !== undefined) options.projectId = process.env.GCLOUD_PROJECT;
	if (options.bucket === undefined) options.bucket = options.projectId + '.appspot.com';

	if (options.projectId !== undefined && options.bucket !== undefined) {
		var gcsOptions = {
			projectId: options.projectId
		};

		if (options.key !== undefined) {
			gcsOptions.keyFilename = options.key
		};

		var gcs = require('@google-cloud/storage')(gcsOptions);
		bucket = gcs.bucket(options.bucket);
	}
}

util.inherits(ghostStorageGoogleCloud, baseStore);

ghostStorageGoogleCloud.prototype.save = function(image) {
	var _self = this;
	if (!options) return Promise.reject('missing configuration for google cloud storage');
	if (options.bucket === undefined || options.bucket === null) return Promise.reject('must supply a bucket name for google cloud storage');

	var targetFilename;
	var targetDir = _self.getTargetDir();

	if (options.customURL !== undefined) {
		var storageURL = options.customURL.replace(/\/+$/, '') + '/';
	} else {
		var storageURL = 'https://' + options.bucket + '.storage.googleapis.com/';
	}

	return this.getUniqueFileName(this, image, targetDir).then(function(filename) {
		targetFilename = filename
		var bucketUploadOptions = {
			destination: targetDir + targetFilename,
			validation: 'crc32c',
			public: true,
			metadata: {
				articleID: articleID
			}
		};
		return new Promise(function(resolve, reject) {
			bucket.upload(image.path, bucketUploadOptions, function(err, file) {
				if (err) {
					reject(err);
					return;
				}
				resolve(file);
				return;
			});
		})
	}).then(function() {
		return storageURL + targetDir + targetFilename;
	}).catch(function(e) {
		errors.logError(e);
		return Promise.reject(e);
	});
}

ghostStorageGoogleCloud.prototype.serve = function() {
	// An absolute URL has alrady been returned. no-op
	return function(req, res, next) {
		next();
	};
};

ghostStorageGoogleCloud.prototype.exists = function(filename) {
	return new Promise(function(resolve) {
		var file = this.bucket.file(filename);
		file.exists().then(function(data) {
			var exists = data[0];
			resolve(exists);
		});
	});
};

ghostStorageGoogleCloud.prototype.delete = function(filename) {
	return new Promise(function(resolve, reject) {
		var file = this.bucket.file(filename);
		file.delete(function(err, apiResponse) {
			if (err) {
				return reject(err);
			}
			resolve(apiResponse);
		});
	});
};

module.exports = ghostStorageGoogleCloud;
