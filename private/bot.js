var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var sendTextTg=function(tokentg, chatId, text) {
  var xhttp = new XMLHttpRequest();
  var url = 'https://api.telegram.org/bot' + tokentg + '/sendMessage?chat_id=' + chatId + '&text=' + text;

  xhttp.open("GET", url);
  xhttp.send();

};

var sendFileTg=function(tokentg, chatId, pdfBinary) {
  const request = require('request');
  const fs = require('fs');
  var cripted;

  const url = 'https://api.telegram.org/bot'+tokentg+'/sendDocument';

  let r = request(url, (err, res, body) => {
      if(err) console.log(err);

      else {
        fs.unlink("./temp/tmp-"+cripted+".pdf", (err) => {
          if (err) {
          console.error(err);
          return;
          }
      
          //file removed
        });
      }
      console.log(body);
  });

  let f = r.form();
  f.append('chat_id', chatId);

  var pdfB64 = pdfBinary.split(" ").join("+");

  var crypto = require('crypto');

  cripted=crypto.randomBytes(4).readUInt32LE(0);
  var filename = './temp/tmp-'+cripted+".pdf";

  fs.writeFileSync(filename, (Buffer.from(pdfB64, 'base64').toString('binary')));

  f.append('document', fs.createReadStream(filename)); 
};


module.exports={
  sendTextTg : sendTextTg,
  sendFileTg: sendFileTg
};