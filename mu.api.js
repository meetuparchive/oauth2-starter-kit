window.mu = window.mu || {};

/** Provides a thin layer around an oauth2 follow for authorizing 
 *  a client to access a Meetup member's data
 *  @todo remove jquery dep for making ajax req 
 *  @todo make sure this works in older browsers */
window.mu.Api = (function(win, $) {
    return function(opts) {        

        // if user-agent supports local storage, use that, else just use memory
        var storageFallbacks = function() {
            if('localStorage' in win && win['localStorage'] !== null) {
                return {
                    put: function(k, v) {
                        win.localStorage[k] = v;
                    }
                    , get: function(k) {
                        return win.localStorage[k];
                    }
                    , del: function(k) {
                        win.removeItem(k);
                    }
                };
            } else {
                var db = {};
                return {
                    put: function(k, v) {
                        db[k] = v;
                    }
                    , get: function(k) {
                        return db[k];
                    }
                    , del: function(k) {
                        db[k] = undefined;
                    }
                };
            }
        }

        // assign this to your own client id
        var client_id = opts.clientId || alert("clientId required")

        storage = opts.storage || storageFallbacks()

        // location to redirect member after when Meetup gets their
        // authorization
        , redirectUri = opts.redirectUri || window.location.href

        // function invoked when meetup user denies authorization 
        , onAuthDenial = opts.onAuthDenial || function(err) {
            alert('override onAuthDenial: function(err)...');
        }

        // function invoked when user-agent does not support localStorage
        , onUnsupportedStorage = opts.onUnsupportedStorage || function() {
            alert('override onUnsupportedStorage: function()...');
        }

        // function invoked after a user authorizes and before
        // onMember
        , afterAuth = opts.afterAuth || function(mem, token) {
            
        }

        // function invoked on a page refresh if a user is logged in
        , onMember = opts.onMember || function(mem, token) {
            alert('override onMember: funciton(mem, token) ...');
        }

        // support  for custom permission scopes
        // http://www.meetup.com/meetup_api/auth/#oauth2-scopes
        , scopes = opts.scopes || ['ageless'] 

        // location for auth
        , authorization = "https://secure.meetup.com/oauth2/authorize/?response_type=token&client_id=" +
                client_id + "&scope=" + scopes.join(',') + "&redirect_uri=" + redirectUri

        // api call to get the authorized members data
        , member = "https://api.meetup.com/2/member/self"

        , requestAuthorization = function() {
            var width = 500, height = 350
            , top = (screen.height - height)/2
            , left = (screen.width - width)/2;
            win.open(
                authorization,
                "Meetup",
                ["height=", height, ",width=", width,
                 ",top=", top, ",left=", left].join(''));    
        };

        $(function() {
      
            if(storage) {
                var ls = storage;

                // user authorized client
                win.onMeetupAuth = function(tok) {
                    ls.put('mu_token', tok);
                    $.getJSON(member + "?callback=?", { "access_token": ls.get('mu_token') },
                        function(mem){
                            var simple = {
                                id: mem.id,
                                name: mem.name,
                                link: mem.link,
                                photo: mem.photo
                            }
                            ls.put('mu_member', JSON.stringify(simple));
                            afterAuth(simple, tok);
                            onMember(simple, tok);
                        });
                };

                // user denied client authorization
                win.onMeetupDenial = function(err) {
                    onAuthDenial(err);
                };

                if(!ls.get('mu_token') || !ls.get('mu_member')) { // not "logged in"..
                    var frag = window.location.hash;
                    if(frag) {
                        var fp = frag.substring(1).split('&')
                        , i = fp.length
                        , params = {}
                        , re = /(\S+)=(\S+)/
                        , inject = function(pair) {
                            if(re.test(pair)) {
                                var kv = re.exec(pair).splice(1, 2);
                                params[kv[0]] = kv[1];
                            }
                        };
                        while(i--) { inject(fp[i]); }
                        if(params.access_token) {
                            win.close();
                            win.opener.onMeetupAuth(params.access_token, params.expires_in);
                        } else if(params.error) {
                            win.close();
                            win.opener.onMeetupDenial(params.error);
                        }
                    }

                } else { // we are "logged in"...
                    onMember(JSON.parse(ls.get('mu_member')), ls.get('mu_token'));
                }
            } else {
                onUnsupportedStorage();         
            }
        });
    
        // return a means of logging out and in
        return {
            logout: function(after) {
                win.localStorage.removeItem('mu_auth');
                win.localStorage.removeItem('mu_member');
                if(after) { after(); }
            },
            login: function() {
                requestAuthorization();
            }
        };
    };
})(window, jQuery);
