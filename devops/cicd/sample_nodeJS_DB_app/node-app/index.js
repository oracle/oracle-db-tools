var fetch = require('node-fetch');
var btoa = require('btoa');
function runit(sql,callback){
    fetch( "https://ADB-HOSTNAME/ords/nodejsapp/_/sql",{
        method: "POST",
        headers: {
            "Content-Type": "application/sql",
            "Authorization": "Basic " + btoa("nodejsapp" + ":" +"PASSWORD")
        },
        body: sql
    } )
    .then(res => res.json())
    .then(function(json){
             callback(json);
    }).catch(function(e){
        console.log(e);
    });
}
runit('select * from emp',function(data) {
 console.log(data.items[0]); 
});