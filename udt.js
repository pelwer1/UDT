// !udt
//
// Produces a tokenmod command to help you see certain edges and abilities in the token name, auras and bubbles
//
// !udt   (update token)
//
// creates cmd line like this:
//     !token-mod --set name|'?{Short Token Name|Mook}  [FSAR2]' statusmarkers|5b-Fear bar3_value|W3 statusmarkers|5-Large:2 
// running this command will prompt you for a new token name and update the default token

//
// 05/08/2020 initial version
// 05/10/2020 added broken code for reach and AP; noticed Size check fails if character has not size value
// 05/20/2020 got everything working
// 05/23/2020 merged in show bio in chat
// 05/23/2022 minor updates
// 06/21/2022 Removed defaulttoken from output
//
// send token mod command line to chat to update default token for selected token
// !udt
//
// creates cmd line like this:
//     !token-mod --set aura1_radius|1 aura1_color|FF0000 aura2_radius|0.5 aura2_color|800080 bar1_value|AR2  bar2_value|x1F  bar3_value|W1H
//
//
// Trick from Aaron to fix "Syntax Error: Unexpected Identifier" - put a ";" at top of script
// The API Server concatenates all the scripts together, which can lead to code that isn't
// correct when a programmer relies on automatic semicolon insertion.
;

on('ready', function() {
    on('chat:message', function(msg) {
       if (msg.type === "api" && msg.content.indexOf("!udt") !== -1) {

         // Make sure there's a selected object
          if (!msg.selected ) {
             sendChat("ERROR", "No Token Selected.");
             return;
          }
    
          // Don't try to set up a drawing or card
          var token = getObj('graphic', msg.selected[0]._id);
          if (token.get('subtype') !== 'token') {
             sendChat("ERROR", "Must select a Token, not a drawing or a card.");
             return;
          }



            var tokenid = msg.selected[0]._id;
            var charid = getObj("graphic", tokenid).get("represents");
            var c = getObj( 'character', charid );
            
            if ( !c ) {
             sendChat("ERROR", "Must select a Token that is linked to a character sheet.");
             return;
            }
           
            
            c.get('bio', function (text) {

                // split on edges
                var re = /edge[s*]/i; // first match only
                var lines = text.split(re);
                

                // declare vars
                var wounds = 1;
                var size = 0;
                var arcResist = '';
                var aura1 = '';
                var aura2 = '';
                var i = 0;
                var attacks = '1';
                var frenzy = '';
                var sweep = '';
                var hardy = '';
                var large = '';
                var fear = '';
                var regexp;
                var sizeValue;
   
                for (i = 1; i < lines.length; i++ ) {
                    // wounds
                    // look for extreme size
                    regexp = /size\s+\+?\s*(\d+)/i;
                    if ( regexp.test(lines[i]) ) {
                       size = lines[i].match(/size\s+\+?\s*(\d+)/i); // size +4 or size 4
                       sizeValue = parseInt(size[1]);
                       // sendChat('','/w gm Size: '+size+'<br>');
                       if ( sizeValue > 3 ) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:2 ';  }
                       if ( sizeValue > 7 ) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:4 '; }
                       if ( sizeValue > 11) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:6 '; }
                       if ( sizeValue > 15) { wounds = wounds + 1;  large = 'statusmarkers|5-Large:6 '; }
                    }
                    regexp = /hardy/i;
                    if ( regexp.test(lines[i]) ) {  hardy = 'H '; }
                    regexp = /resilient/i;
                    if ( regexp.test(lines[i]) ) {  wounds = wounds + 1; }
                    regexp = /v\w*\s+resilient/i;
                    if ( regexp.test(lines[i]) ) {  wounds = wounds + 1; }
                    
                    // fear
                    regexp = /fear/i;
                    if ( regexp.test(lines[i]) ) {  fear = 'statusmarkers|5b-Fear '; }

                    // arcane resistance
                    regexp = /arc\w*\s+resist/i;
                    if ( regexp.test(lines[i]) ) { arcResist = 'AR2 '; }
                    regexp = /imp\w*\s+arc\w*\s+resist/i;
                    if ( regexp.test(lines[i]) ) { arcResist = 'AR4 '; }

                    // attacks
                    regexp = /sweep/i;
                    if ( regexp.test(lines[i]) ) { sweep = 'S'; }
                    regexp = /frenzy/i;
                    if ( regexp.test(lines[i]) ) { frenzy = 'F'; }
                    regexp = /imp\w*\s+frenzy/i;
                    if ( regexp.test(lines[i]) ) { frenzy = 'iF';  }
                    regexp = /claw.*bite/i;
                    if ( regexp.test(lines[i]) ) { attacks = 'F'; }
                    regexp = /bite.*claw/i;
                    if ( regexp.test(lines[i]) ) { attacks = 'F'; }

                    // auras
                    regexp = /(extract|first|counter\s+att)/i;
                    if ( regexp.test(lines[i]) ) { aura1 = "aura1_radius|0.2 aura1_color|FF0000 "; }
                    
                }

                // build the token mod command
                var printOut =  '';
                if ( frenzy || sweep || arcResist ) {
                  printOut = "!token-mod --set name|'?{Current Token Name|Mook} " + " [" + frenzy + sweep + arcResist + "]' " + aura1 + aura2  + fear  + " bar3_value|W" + wounds.toString() + hardy + " " + large;
                }
                else {
                  printOut = "!token-mod --set name|'?{Current Token Name|Mook} " + "' " + aura1 + aura2  + fear  + " bar3_value|W" + wounds.toString() + hardy + " " + large;
                }
                sendChat('', '/w gm <b>Token Mod Command:</b><br>' + printOut + ' <br>');
                
            });
       }
    });
});
