//Set the keys on ./conf.js

var request = require('request');

// Public client interface
function Client(options) {

        this.COCOAFISH_APPLICATION_KEY = options.applicationkey;
        this.CURRENT_USER = null;
        this.ENDPOINT = "https://api.cloud.appcelerator.com/v1/"; 

	console.log(JSON.stringify(this));

};

/*
 *
 */


/**
 *var params = {
		"httpMethod" : "POST",
		"baseUrl" : "users/create.json",
		"params" : {
			"email" : args.email,
			"username" : args.username || null,
			"password" : args.password || null,
			"password_confirmation" : args.password_confirmation || null,
			"first_name" : args.first_name || null,
			"last_name" : args.last_name || null,
			//"photo" : args.photo || null,
			//"photo_id" : args.photo_id || null,
			//"tags" : args.tags || null,
			//"role" : args.role || null,
		}
	}
	that.APICall(params, callback);
*/

Client.prototype.createUser = function(args, callback){
    var that = this;
    
    var args = {
        "baseUrl" : "users/create.json",
        "httpMethod" : "POST",
        "params" : args
    };
    that.APICall(args, function(d) {
        callback(d);
    });
    
}

Client.prototype.doLogin = function(_args, _callback) {

	var that = this;

	if(false && that.CURRENT_USER !== null) {
            _callback({
                success: false,
                response:'User already logged in.'
            })
            return;
	}

	var args = {
		"baseUrl" : "users/login.json",
		"httpMethod" : "POST",
		"params" : _args
	};
	that.APICall(args, function(_d) {
		if(_d.success === true) {
                    that.CURRENT_USER = _d.response.users[0];
		}
		_callback(_d);

	});
};

/**
 * email address to set the updated password to
 */
Client.prototype.doResetUserPassword = function(_email, _callback) {
	var that = this;
	var args = {
		"httpMethod" : "GET",
		"baseUrl" : "users/request_reset_password.json",
		"params" : {
			"email" : _email
		}
	};
	that.APICall(args, function(_d) {
            console.log('Loggin out')
		if(_d.success === true) {
			//that.CURRENT_USER = _d.response.users[0];
		}
		_callback(_d);

	});
}

Client.prototype.showMe = function(_callback) {
	var that = this;
	var args = {
		"baseUrl" : "users/show/me.json",
		"httpMethod" : "GET"
	};
	that.APICall(args, function(data){
            if(data.success===true)
                _callback(data);
        });
}

/***
 * logs the current user out of the system
 */
Client.prototype.doLogoutUser = function(_callback) {
	var that = this;
	var args = {
		"baseUrl" : "users/logout.json",
		"httpMethod" : "GET"
	};
	that.APICall(args, function(data){
            if(data.success===true)
                that.CURRENT_USER = null;
            _callback(data);
        });
}
/**
 * deletes a user from the system
 */
Client.prototype.doDeleteUser = function(keep_photo, callback) {
	var that = this;
	var args = {
		"httpMethod" : "GET",
		"baseUrl" : "users/delete.json",
		"params" : {
			"keep_photo" : keep_photo || false
		}
	};
	that.APICall(args, callback);
}
/**
 * gets a users location by the IP address of the device
 */
Client.prototype.doGeolocateAClient = function(callback) {
	var that = this;
	var args = {
		"httpMethod" : "GET",
		"baseUrl" : "clients/geolocate.json"
	};
	that.APICall(args, callback);
}
/**
 * make the API call to get the photos. they can be searched by user_id or
 * a place id. Anything else and you should use the query endpoint
 */
Client.prototype.doSearchPhotos = function(_args, _callback) {

	var that = this;

	var args = {
		"baseUrl" : "photos/search.json",
		"httpMethod" : "GET",
		"params" : _args
	};
	that.APICall(args, _callback);

}
//
//
//
Client.prototype.doUpdatePhoto = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "PUT",
		"baseUrl" : "users/update.json",
		"params" : {
			"collection_id" : args.collection_id,
			"photo" : args.photo,
			"tags" : args.tags || null,
			"custom_data_fields" : args.custom_data_fields || null,
		}
	}
	that.APICall(params, callback);
}
//
//
//
Client.prototype.doQueryPhotos = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "photos/query.json",
		"params" : {
			//"limit" : args.limit || "100",
			//"skip" : args.skip || null,
			"page" : args.page || 1,
			"where" : args.where || null,
			//"order" : args.order || null,
			"per_page" : args.per_page || 100
		}
	};
	that.APICall(params, callback);
}
/**
 * deletes a photo from the system
 */
Client.prototype.doDeletePhoto = function(photo_id, callback) {
	var that = this;
	var args = {
		"httpMethod" : "DELETE",
		"baseUrl" : "photos/delete.json",
		"params" : {
			"photo_id" : photo_id
		}
	};
	that.APICall(args, callback);
}
//
//
//
Client.prototype.doCreatePhoto = function(args, callback) {
	var that = this;

	that.APICall({
		"baseUrl" : "photos/create.json",
		"httpMethod" : "POST",
		"params" : args
	}, callback);

}
//
//
//
Client.prototype.doShowPhotoInfo = function(photo_id, callback) {
	var that = this;
	var args = {
		"httpMethod" : "GET",
		"baseUrl" : "photos/show.json",
		"params" : {
			"photo_id" : photo_id
		}
	};
	that.APICall(args, callback);
}
//
//
//
Client.prototype.getPhotoInformation = function(id) {
	alert("NO-OP");
}
//
//
//
Client.prototype.getPhotoSubcollections = function(args, _callback) {
	var that = this;
	that.APICall({
		"httpMethod" : "GET",
		"baseUrl" : "collections/show/subcollections.json",
		"params" : {
			"collection_id" : args.collection_id,
			"page" : args.page || 1,
			"per_page" : args.per_page || 10
		}
	}, _callback);
}
//
//
//
Client.prototype.getPhotoCollection = function(args, _callback) {
	var that = this;
	that.APICall({
		"httpMethod" : "GET",
		"baseUrl" : "collections/show/photos.json",
		"params" : {
			"collection_id" : args.collection_id,
			"page" : args.page || 1,
			"per_page" : args.per_page || 10
		}
	}, _callback);
}


/**
 * Custom Objects
 */

Client.prototype.getCustomObjects = function(args, callback){
    var that = this;
    if(!args || !args.class_name){
        callback({
            success : false,
            response : 'Need to specify the class name to query.'
        });
        return;
    }
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "objects/"+args.class_name+"/query.json",
        "params":{
            "per_page":args.per_page,
            "page": args.page
        }

    }, callback);   
}

Client.prototype.queryObject = function(args, callback){
    var that = this;
//    console.log('************')
//    console.log(args)
    if(!args || !args.class_name){
        callback({
            success : false,
            response : 'Missing class_name '
        });
        return;
    } 
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "objects/"+args.class_name+"/query.json",
        "params": args
    }, callback); 
}

Client.prototype.deleteCustomObjects = function(args, callback){
    var that = this;
    if(!args || !args.class_name){
        callback({
            success : false,
            response : 'Need to specify the class name to query.'
        });
        return;
    }
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "objects/"+args.class_name+"/delete.json",
        "params": args

    }, callback);
    
}

/**
 * Input : 
 * @@params: args.class_name {String} [required] 
 * @@params: args.custom_object {Object} [required] 
 */
Client.prototype.createCustomObject = function(args, callback){
    var that = this;
    if(!args || !args.class_name){
        callback({
            success : false,
            response : 'Need to specify the class name to query.'
        });
        return;
    } else if(!args.custom_object){
        callback({
            success : false,
            response : 'Body is empty.'
        });
        return;
    }
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "objects/"+args.class_name+"/create.json",
        "params":{
            "class_name" : args.class_name,
            "fields" : args.custom_object
        }
    }, callback); 
}

Client.prototype.getCustomObjectById = function(args, callback){
    var that = this;
    if(!args || !args.class_name){
        callback({
            success : false,
            response : 'Missing class_name '
        });
        return;
    } else if(! args.id){
        callback({
            success : false,
            response : 'Missing Object ID '
        });
        return;
    }
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "objects/"+args.class_name+"/query.json",
        "params":{
            "where" : '{"location_id":"'+args.id+'"}'
        }
    }, callback); 
}

/*
 * PLACES --------------------------------------------------------
 */

Client.prototype.getPlaces = function(args, callback){
    var that = this;
    //console.log(JSON.stringify(args));
    //return;
    if(!args){
        that.APICall({
            "httpMethod" : "GET",
            "baseUrl" : "places/query.json"
        }, callback);
    } else {
        that.APICall({
            "httpMethod" : "GET",
            "baseUrl" : "places/query.json",
            "params":{
                "per_page":args.per_page || 10,
                "page": args.page || 1
            }
            
        }, callback);
    }
    
}

Client.prototype.getPlace = function(id,callback){
    var that = this;
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl" : "places/show.json",
        params: {
            place_id: id
        }
    }, callback);
}

// It will update a place if args.place_id is present, 
// it will create a new place otherwise
Client.prototype.createUpdatePlace = function(args, callback){
    var that = this;
    that.APICall({
        "httpMethod" : "POST",
        "baseUrl":'places/create.json',
        "params": args
    }, callback)    
}

Client.prototype.updatePlace = function(args, callback){
    var that = this;
    that.APICall({
        "httpMethod" : "POST",
        "baseUrl":'places/update.json',
        "params": args
    }, callback)    
}

Client.prototype.queryPlaces = function(args, callback){
    var that = this;
    if(!args){
        that.APICall({
            "httpMethod" : "GET",
            "baseUrl" : "places/query.json"
        }, callback);
    } else {
        that.APICall({
            "httpMethod" : "GET",
            "baseUrl" : "places/query.json",
            "params" : {
                "page" : args.page || 1,
                "per_page" : args.per_page || 15,
                "where" : args.where || null,
                "order" : args.order || null
            }
        }, callback);
    }
    
}

/*
 * Getting all posts
 */
Client.prototype.getPosts = function(_callback) {
	var that = this;
	that.APICall({
		"httpMethod" : "GET",
		"baseUrl" : "posts/query.json"
	}, _callback);
}

/*
 * Getting a single posts
 */
Client.prototype.getPost = function(id,_callback) {
	var that = this;
	that.APICall({
		"httpMethod" : "GET",
		"baseUrl" : "posts/show.json",
                params: {
                    post_id: id
                }
	}, _callback);
}

/*
 * Create/Update post
 * It will update a post if args.place_id is present, 
 * it will create a new opst otherwise
 */

Client.prototype.createUpdatePost = function(args, callback) {
    var that = this;
    that.APICall({
        "httpMethod" : "POST",
        "baseUrl":'posts/create.json',
        "params": args
    }, callback)
}

/*
 * Remove user
 */

Client.prototype.deletePost = function(args, callback){
    var that = this;
    that.APICall({
        "httpMethod" : "GET",
        "baseUrl":'posts/delete.json',
        "params": args
    }, callback)
}

//
//
//
Client.prototype.createPhotoCollection = function(args, _callback) {
	var that = this;
	that.APICall({
		"httpMethod" : "POST",
		"baseUrl" : "collections/create.json",
		"params" : {
			"name" : args.name,
			"parent_collection_id" : args.parent_collection_id,
			"cover_photo_id" : args.cover_photo_id
		}
	}, _callback);
}
/**
 *
 */
Client.prototype.doShowUserProfile = function(callback, user_id) {
	var that = this;
	var args = {
		"httpMethod" : "GET",
		"baseUrl" : user_id ? "users/show.json" : "users/show/me.json",
		"params" : {
			"user_id" : user_id || null,
		}
	}
	that.APICall(args, callback);
}
//
//
//
Client.prototype.doCreateUser = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "users/create.json",
		"params" : {
			"email" : args.email,
			"username" : args.username || null,
			"password" : args.password || null,
			"password_confirmation" : args.password_confirmation || null,
			"first_name" : args.first_name || null,
			"last_name" : args.last_name || null,
			//"photo" : args.photo || null,
			//"photo_id" : args.photo_id || null,
			//"tags" : args.tags || null,
			//"role" : args.role || null,
		}
	}
	that.APICall(params, callback);
}
//
//
//

Client.prototype.findUserById = function(id, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "users/show.json",
		"params" : {
			"user_id" : id
		}
	};
	that.APICall(params, callback);
}

Client.prototype.doSearchUsers = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "users/search.json",
		"params" : {
			"q" : args.q || null,
			"page" : args.page || 1,
			"per_page" : args.per_page || 10
		}
	};
	that.APICall(params, callback);
}
//
//
//
Client.prototype.doQueryUsers = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "users/query.json",
		"params" : {
			
			"page" : args.page || 1,
                        "per_page" : args.per_page || 10,
			"where" : args.where || null,
			"order" : args.order || null
		}
	};
	that.APICall(params, callback);
}
//
//
//
Client.prototype.doUpdateUser = function(args, callback) {
	var that = this;
	var params = {
            "httpMethod" : "PUT",
            "baseUrl" : "users/update.json",
            "params" : {
                    "email" : args.email,
                    "username" : args.username || null,
                    "password" : args.password || null,
                    "password_confirmation" : args.password_confirmation || null,
                    "first_name" : args.first_name || null,
                    "last_name" : args.last_name || null,
                    "photo" : args.photo || undefined,
                    "photo_id" : args.photo_id || undefined,
                    "tags" : args.tags || null,
                    "role" : args.role || null
            }
	}
	that.APICall(params, callback);
}

//
// Actual API call
//
Client.prototype.APICall = function(args, callback) {
        var that = this;
        
        //console.log(JSON.stringify(args.params));
        //args.params
        if(args.httpMethod == 'PUT' || args.httpMethod == 'POST') {
            request.post({
                url:that.ENDPOINT + args.baseUrl + "?key=" + that.COCOAFISH_APPLICATION_KEY,
                form:args.params
            }, function(error, response, body){
                    
                    var resp = JSON.parse(body);
                    if(resp.meta.status=='fail'){
                        console.log('Error: '+resp.meta.message);
                        callback({
                            success:false,
                            response: 'Error: '+resp.meta.message
                        })
                    }
                    else{
                        callback({
                            success: true,
                            response: JSON.parse(body).response,
                            meta: JSON.parse(body).meta
                        });
                    }

            })
		
	} else {
            var body = that.ENDPOINT + args.baseUrl + "?key=" + that.COCOAFISH_APPLICATION_KEY + "&";
            var paramMap = args.params || {};
            for(var a in paramMap) {
                    body += encodeURIComponent(a) + '=' + (paramMap[a] ? encodeURIComponent(paramMap[a]) : "") + '&';
            }
            console.log(body);
            request.get({
				url : body,
                }, function(error, response, body) {
                    //console.log(body);
                    var resp = JSON.parse(body);
                    if(resp.meta.status=='fail'){
                        console.log('Error: '+resp.meta.message);
                        callback({
                            success:false,
                            response: 'Error: '+resp.meta.message
                        })
                    }
                    else{
                        callback({
                            success: true,
                            response: JSON.parse(body).response,
                            meta: JSON.parse(body).meta
                        });
                    }
                });
        }
    
        return ;
	
}

Client.prototype.APICall2 = function(url, method, data, callback, useSecure) {
        var authType = utils.getAuthType(this);
        if(authType == utils.unknown) {
                callback(utils.noAppKeyError);
                return;
        }
       
        var isSecure = true;
        if(arguments.length == 4) {
                isSecure = true;
        } else if(arguments.length == 5) {
                isSecure = useSecure;
        } else {
                callback(utils.invalidArgumentError);
                return;
        }
       
        var protocal = "http://";
        if(isSecure) {
                protocal = "https://";
        }
       
        var port = this.apiPort;
        if(!port) {
                if(isSecure){
                        port = 443;
                } else {
                        port = 80;
                }
        }
       
        //build request url
        var reqURL = '';
        reqURL += "/" + utils.version + "/" + url;
       
        if(authType == utils.app_key) {
                if(reqURL.indexOf("?") != -1) {
                        reqURL += "&" + utils.keyParam + '=' + this.appKey;
                } else {
                        reqURL += "?" + utils.keyParam + '=' + this.appKey;
                }
        }
       
        if(data == null)
                data = {};
       
        var apiMethod = method ? method.toUpperCase() : utils.get_method;
        data[utils.suppressCode] = 'true';
        sessionId = this.session_id;
       
        if (sessionId) {
                if(reqURL.indexOf("?") != -1) {
                        reqURL += "&" + utils.sessionId + '=' + sessionId;
                } else {
                        reqURL += "?" + utils.sessionId + '=' + sessionId;
                }
        }
       
        data = utils.cleanInvalidData(data);
       
        var fileObj = utils.getFileObject(data);
        if(fileObj) {
                //send request with file
                var fileName = '';
                var filePath = '';
                if(typeof fileObj == 'string') {
                        filePath = fileObj;
                        fileName = path.basename(fileObj);
                } else if(typeof fileObj == 'object') {
                        if(fileObj.path && fileObj.name) {
                                filePath = fileObj.path;
                                fileName = fileObj.name;
                        } else {
                                callback(utils.fileTypeError);
                                return;
                        }
                }
               
                try {
                        var binary = fs.readFileSync(filePath);
                        if(binary) {
                                var filePropName = 'file';
                                if(data['file']) {
                                        delete data['file'];
                                } else if(data['photo']) {
                                        delete data['photo'];
                                        filePropName = 'photo';
                                }
                               
                                var mimeType = mime.lookup(fileName);
                                if(!mimeType) {
                                        mimeType = 'text/plain';
                                }
                               
                                var header = {};
                                if(authType == utils.oauth) {
                                        var message = {
                                                method: apiMethod,
                                                parameters: []
                                        };
                                       
                                        if(port != 443 && port != 80) {
                                                message['action'] = protocal + this.apiBaseURL + ":" + port + reqURL;
                                        } else {
                                                message['action'] = protocal + this.apiBaseURL + reqURL;
                                        }
                                        utils.populateOAuthParameters(message.parameters, this.oauthKey);
                                        OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
                                        header[utils.oauth_header] = OAuth.getAuthorizationHeader("", message.parameters);
                                }
                               
                                utils.sendRequestWithFile(this.apiBaseURL, port, reqURL, apiMethod, data, header, isSecure, callback, this, filePropName, fileName, binary, mimeType);
                        } else {
                                callback(utils.fileLoadError);
                                return;
                        }
                } catch(e) {
                        callback(utils.fileLoadError);
                        return;
                }      
        } else {
                //send request without file
                var header = {};
                if(authType == utils.oauth) {
                        var message = {
                                method: apiMethod,
                                parameters: []
                        };
                       
                        if(port != 443 && port != 80) {
                                message['action'] = protocal + this.apiBaseURL + ":" + port + reqURL;
                        } else {
                                message['action'] = protocal + this.apiBaseURL + reqURL;
                        }
                       
                        for (prop in data) {
                                if (!data.hasOwnProperty(prop)) {
                                        continue;
                                }
                                message.parameters.push([prop, data[prop]]);
                        }
                        utils.populateOAuthParameters(message.parameters, this.oauthKey);
                        OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
                        header[utils.oauth_header] = OAuth.getAuthorizationHeader("", message.parameters);
                }
               
                utils.sendRequest(this.apiBaseURL, port, reqURL, apiMethod, data, header, isSecure, callback, this);
        }
};


//
// FRIENDS
//
//
//
//
Client.prototype.doAddFriends = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "friends/add.json",
		"params" : {
			"user_ids" : args.user_ids,
			"approval_required" : args.approval_required || true
		}
	};

	that.APICall(params, callback);
}
/**
 *
 */
Client.prototype.doShowFriendRequests = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "friends/request.json",
		"params" : {}
	};

	that.APICall(params, callback);
}
//
//
//
Client.prototype.doApproveFriends = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "friends/approve.json",
		"params" : {
			"user_ids" : args.user_ids
		}
	};

	that.APICall(params, callback);
}
//
//
//
Client.prototype.doRemoveFriends = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "friends/remove.json",
		"params" : {
			"user_ids" : args.user_ids
		}
	};

	that.APICall(params, callback);
}
//
//
//
Client.prototype.doSearchFriends = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "friends/search.json",
		"params" : {
			"user_id" : args.user_id || null,
			"q" : args.q || null,
			"page" : args.page || 1,
			"per_page" : args.per_page || 10
		}
	};

	that.APICall(params, callback);
}
//
// EMAIL
//
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doSendEmails = function(args, callback) {
    var that = this;
    var params = {
        "httpMethod" : "POST",
        "baseUrl" : "custom_mailer/email_from_template.json",
        "params" : {
            "template" : args.template,
            "recipients" : args.recipients,
            "from" : args.from || null
        }
    };
    
    if( args.dynamic_fields ){
        for (var x in args.dynamic_fields){
            params.params[x] = args.dynamic_fields[x]
        }
    }

    that.APICall(params, callback);
}
//
// Social Integration
//
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doLoginExternalAccount = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "friends/remove.json",
		"params" : {
			"id" : args.id,
			"type" : args.type,
			"token" : args.token
		}
	};

	that.APICall(params, callback);
}
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doLinkExternalAccount = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "POST",
		"baseUrl" : "users/external_account_link.json",
		"params" : {
			"id" : args.id,
			"type" : args.type,
			"token" : args.token
		}
	};

	that.APICall(params, callback);
}
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doUnlinkExternalAccount = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "DELETE",
		"baseUrl" : "users/external_account_unlink.json",
		"params" : {
			"id" : args.id,
			"type" : args.type
		}
	};

	that.APICall(params, callback);
}
/** ---------------------------------------------------------------------------
 *
 *
 * --------------------------------------------------------------------------- */
Client.prototype.doFindFacebookFriends = function(args, callback) {
	var that = this;
	var params = {
		"httpMethod" : "GET",
		"baseUrl" : "social/facebook/search_friends.json",
		"params" : {}
	};

	that.APICall(params, callback);
}
//
//
//
Client.prototype.doCreateFile = function(args, callback) {
	var that = this;
	var params = {
		"baseUrl" : "files/create.json",
		"httpMethod" : "POST",
		"params" : args
	};
	that.APICall(params, callback);

}
/**
 * make the API call to get the photos. they can be searched by user_id or
 * a place id. Anything else and you should use the query endpoint
 */
Client.prototype.doSearchFiles = function(_args, _callback) {

	var that = this;

	var args = {
		"baseUrl" : "files/search.json",
		"httpMethod" : "GET",
		"params" : _args
	};
	that.APICall(args, _callback);

}

/*
 * Push notifications
 */

Client.prototype.pushSuscribe = function(args, callback){
    var that = this;

	var args = {
		"baseUrl" : "push_notification/subscribe.json",
		"httpMethod" : "POST",
		"params" : _args
	};
	that.APICall(args, _callback);
}

// Create Global "extend" method
//
var extend = function(obj, extObj) {
	if(arguments.length > 2) {
		for(var a = 1; a < arguments.length; a++) {
			extend(obj, arguments[a]);
		}
	} else {
		for(var i in extObj) {
			obj[i] = extObj[i];
		}
	}
	return obj;
};

exports.Client = Client;