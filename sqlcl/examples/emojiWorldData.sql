drop table emoji
/

create table emoji ( keyword varchar2(30), emoji varchar2(200))
/

script
// read text content from the given URL
function readText(url) {
    // Using JavaImporter to resolve classes
    // from specified java packages within the
    // 'with' statement below

    with (new JavaImporter(java.io, java.net)) {
        // more or less regular java code except for static types
        var is = new URL(url).openStream();
        try {
            var reader = new BufferedReader(
                new InputStreamReader(is));
            var buf = '', line = null;
            while ((line = reader.readLine()) != null) {
                buf += line;
            }
        } finally {
            reader.close();
        }
        return buf;
    }
}


// get the remote URL
var emoji = JSON.parse(readText('https://raw.githubusercontent.com/muan/emoji/gh-pages/javascripts/emojilib/emojis.json'));
var keys = Object.keys(emoji);

ctx.write( "Got :" + keys.length + " emojis \n\n" )

// process the JSON

for (var key in emoji) {
  //ctx.write(key + ">")
  if ( emoji[key] && emoji[key].char ) {
    //ctx.write( emoji[key].char )
    var binds = {};
        binds.keyword = key;
        binds.emoji = emoji[key].char;
        var ret = util.execute("insert into emoji(keyword,emoji) values(:keyword , :emoji)",binds);
  }
}
ctx.write( "\n\n" )
/
select * from emoji order by keyword;
/
