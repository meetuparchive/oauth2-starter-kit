# Meetup oauth2 sdk starter kit

Prior to doing this, you'll need to get your Meetup Consumer Key at: https://secure.meetup.com/meetup_api/oauth_consumers/
As well, you'll need to test this on a server that resolves to the "Redirect URI" specified on your configured OAuth Consumer

Example usage (for latest working example see index.html)

    <html>
      <head>
        <script type="text/javascript" src="jquery.min.js"></script>
        <script type="text/javascript" src="mu.api.js"></script>
        <script type="text/javascript">
          api = mu.Api({
            clientId: "YOUR_MEETUP_CONSUMER_KEY"
            , onMember: function(member, token) {
              alert("we're in");
            }
          };
          $("#login").click(function(e) {
            e.preventDefault();
            api.login();
            return false;
          })
          $("#logout").click(function(e){
            e.preventDefault();
            api.logout(function(){
              alert("all clear");
            });
            return false;
          });
      });
      </head>
      <body></body>
    </html>
