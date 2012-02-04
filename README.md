# Meetup oauth2 sdk starter key

Example usage

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



