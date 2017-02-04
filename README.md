# Ghost Storage Plugin for Google Cloud Storage
Adds support for Google Cloud Storage. Designed for use within App Engine with zero configuration.

Can be used outside of App Engine with a security json file.

## Installation

    npm i @aicial/ghost-storage-google-cloud --save

## Create storage module

As well as installing the NPM package, you will need to create a storage plugin within Ghost. From the root of your Ghost blog:

    mkdir -p ./content/storage/gcs
    echo -en \''use strict'\'';\nmodule.exports = require('\''ghost-storage-google-cloud'\'');\n' > ./content/storage/gcs/index.js

If you don't want to do it that way - you need to end up with the content below in "content/storage/gcs/index.js"

    'use strict';
    module.exports = require('ghost-storage-google-cloud');

## Configuration

If you are using App Engine and have the default bucket created - you can use the minimal configuration below. If you are outside of App Engine or want more control over the configuration - build something from the second example.

Add `storage` block to file `config.js` in each environment as below (minimal):

    storage: {
        active: 'gcs',
        'gcs': {}
    },

If you want more control:

    storage: {
        active: 'gcs',
        'gcs': {
          projectId: 'my-project-id',
          bucket: 'bucket-name.appspot.com',
          key: 'server-to-server-auth-key.json',
          customURL: 'https://mycustom.domain/'
        }
    },

You can create a bucket via the Console - https://console.cloud.google.com/storage/browser

Credentials (the server-to-server key) are created here - https://console.cloud.google.com/apis/credentials
