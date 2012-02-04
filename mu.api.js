window.mu = window.mu || {};

window.mu.Api = (function(win, $) {
    return function(opts) {
  
        // assign this to your own client id
        var client_id = opts.clientId || alert("clientId required")

        // function invoked when meetup user denies authorization 
        , onAuthDenial = opts.onAuthDenial || function(err) {
            console.log('override onAuthDenial: function(err)...');
        }

        , onUnsupportedStorage = onUnsupportedStorage || function() {
            console.log('override onUnsupportedStorage: function()...');
        }

        , afterAuth = opts.afterAuth || function(mem, token) {
            console.log('override afterAuth: function(mem, token)...');
        }

        , onMember = opts.onMember || function(mem, token) {
            console.log('override onMember: funciton(mem, token) ...');
        }

        // we support custom permission scopes
        //http://www.meetup.com/meetup_api/auth/#oauth2-scopes
        , scopes = opts.scopes || ['ageless'] 

        // uri for auth
        , authorization = function(redirectUri) {
            return "https://secure.meetup.com/oauth2/authorize/?response_type=token&client_id=" +
                client_id + "&scope=" + scopes.join(',') + "&redirect_uri=" + redirectUri;
        }

        // basic call to get the authorized members data
        , member = "https://api.meetup.com/2/member/self";

        $(function() {
      
            // this demo stores authorization in local storage
            if('localStorage' in win && win['localStorage'] !== null) {
                var ls = win.localStorage;

                win.onMeetupAuth = function(tok) { // user okay'd auth request
                    // cache the token for later use
                    ls['mu_token'] = tok;
                    $.getJSON(member + "?callback=?", { "access_token": ls['mu_token'] },
                        function(mem){
                            var simple = {
                                id: mem.id,
                                name: mem.name,
                                link: mem.link,
                                photo: mem.photo
                            }
                            // cache a simple, more compact, representation of the authorized user
                            ls['mu_member'] = JSON.stringify(simple);
                            afterAuth(simple, ls['mu_token']);
                            onMember(simple, ls['mu_token']);
                        });
                }

                win.onMeetupDenial = function(err) { // user denied auth request
                    onAuthDenial(err);
                };

                if(!ls['mu_token'] || !ls['mu_member']) { // if we are not "logged in"..
              
                    // oauth2 tokens are passed back to the redirect url in the form of
                    // a url fragment set of params
                    if(window.location.hash) {
                        var fp = window.location.hash.substring(1).split('&')
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

                    var width = 500, height = 350
                    , top = (screen.height - height)/2
                    , left = (screen.width - width)/2;
                    // in a popup...
                    // 1) redirect the user to meetup & tell meetup where to redirect afterwards
                    // 2) set some window title
                    // 3) set popup args (centering window)
                    win.open(
                        authorization(window.location.href), // 1
                        "Meetup",                             // 2
                        ["height=", height, ",width=", width, // 3
                         ",top=", top, ",left=", left].join(''));
                } else { // we are "logged in"...
                    onMember(JSON.parse(ls['mu_member']), ls['mu_token']);
                    console.log('call api.logout(funciton() ...) to logout');
                }
            } else {
                onUnsupportedStorage();         
            }
        });
    
        // return a means of logging out
        return {
            logout: function(after) {
                win.localStorage.removeItem('mu_auth');
                win.localStorage.removeItem('mu_member');
                after();
            }
        };
    };
})(window, jQuery);
