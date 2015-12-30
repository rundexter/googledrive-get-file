var google = require('googleapis'),
    util = require('./util.js');

var service = google.drive('v3');

var pickInputs = {
        'fileId': { key: 'fileId', validate: { req: true } },
        'acknowledgeAbuse': { key: 'acknowledgeAbuse', type: 'boolean' }
    },
    pickOutputs = {
        'id': 'id',
        'name': 'name',
        'description': 'description',
        'parents': 'parents',
        'createdTime': 'createdTime',
        'owners': { keyName: 'owners', fields: ['emailAddress'] },
        'size': 'size',
        'indexableText': 'contentHints.indexableText'
    };

var fieldsFromApi = 'appProperties,capabilities,contentHints,createdTime,description,explicitlyTrashed,fileExtension,folderColorRgb,fullFileExtension,headRevisionId,iconLink,id,imageMediaMetadata,kind,lastModifyingUser,md5Checksum,mimeType,modifiedByMeTime,modifiedTime,name,originalFilename,ownedByMe,owners,parents,permissions,properties,quotaBytesUsed,shared,sharedWithMeTime,sharingUser,size,spaces,starred,thumbnailLink,trashed,version,videoMediaMetadata,viewedByMe,viewedByMeTime,viewersCanCopyContent,webContentLink,webViewLink,writersCanShare';

module.exports = {

    /**
     * Get auth data.
     *
     * @param step
     * @param dexter
     * @returns {*}
     */
    authOptions: function (step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2();

        if(!dexter.environment('google_access_token')) {

            this.fail('A [google_access_token] environment variable is required for this module');
            return false;
        } else {

            oauth2Client.setCredentials({
                access_token: dexter.environment('google_access_token')
            });

            return oauth2Client;
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth = this.authOptions(step, dexter),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (!auth)
            return;

        if (validateErrors)
            return this.fail(validateErrors);

        inputs.fields = fieldsFromApi;
        // set credential
        google.options({ auth: auth });
        service.files.get(inputs, function (error, data) {
            if (error)
                this.fail(error);
             else
                this.complete(util.pickOutputs(data, pickOutputs));
        }.bind(this));
    }
};
