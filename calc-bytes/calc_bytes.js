


 var unitsToConvertB = ["Bytes","KiB","MiB","GiB","TiB","PiB","EiB"];
 var unitsToConvertD = ["Bytes","kB","MB","GB","TB","PB","EB"];

 var convertUnit = {
  convert : function(){
   var rawDecBytes = document.getElementById("bytes_decimal").value;
   var rawBinBytes = document.getElementById("bytes_binary").value;

   var rawDecUnit = document.getElementById("decimal_unit").value;
   var rawBinUnit = document.getElementById("binary_unit").value;

   //var decUnit = Math.pow(1000,new Number(rawDecUnit));
   //var binUnit = Math.pow(1024,new Number(rawBinUnit));

   if(document.getElementById("dec2bin").checked == true){
    document.getElementById("bytes_decimal").disabled = false;
    document.getElementById("bytes_binary").disabled = true;

    var decUnit = Math.pow(1000,new Number(rawDecUnit));
    var binUnit = Math.pow(1024,new Number(rawBinUnit));

    var decBytes = new Number(rawDecBytes * decUnit);

    document.getElementById("bytes_binary").value = decBytes / binUnit;
   }else if(document.getElementById("bin2dec").checked == true){
    document.getElementById("bytes_decimal").disabled = true;
    document.getElementById("bytes_binary").disabled = false;

    var decUnit = Math.pow(1000,new Number(rawDecUnit));
    var binUnit = Math.pow(1024,new Number(rawBinUnit));

    var binBytes = new Number(rawBinBytes * binUnit);

    document.getElementById("bytes_decimal").value = binBytes / decUnit;
   }
  },
  otherResults : function(){
   document.getElementById("other_results").innerHTML = "";

   var rawDecBytes = document.getElementById("bytes_decimal").value;
   var rawBinBytes = document.getElementById("bytes_binary").value;

   var rawDecUnit = document.getElementById("decimal_unit").value;
   var rawBinUnit = document.getElementById("binary_unit").value;

   var baseBinUnit = Math.pow(1024,new Number(rawBinUnit));
   var baseDecUnit = Math.pow(1000,new Number(rawDecUnit));

   if(document.getElementById("dec2bin").checked == true){
    var resultList = document.createElement("ul");
    resultList.style.listStyleType = "none";
    var binaryUnits = document.getElementById("binary_unit").options.length;

    var enteredUnit = document.createElement("li");
    enteredUnit.appendChild(document.createTextNode(`${rawDecBytes} ${unitsToConvertD[rawDecUnit]} = `));
    resultList.appendChild(enteredUnit);

    for(b=0;b<binaryUnits;b++){
     var rawResult = ((rawDecBytes * baseDecUnit) / Math.pow(1024,b));
     rawResult = (b == 0) ? rawResult : rawResult.toFixed(b * 2);
     var resultItem = document.createElement("li");
     if(b == new Number(rawBinUnit)){resultItem.style.fontWeight = "bold";}
     resultItem.appendChild(document.createTextNode(`${rawResult} ${unitsToConvertB[b]}`));
     resultList.appendChild(resultItem);
    }

   }else if(document.getElementById("bin2dec").checked == true){
    var resultList = document.createElement("ul");
    resultList.style.listStyleType = "none";
    var decimalUnits = document.getElementById("decimal_unit").options.length;

    var enteredUnit = document.createElement("li");
    enteredUnit.appendChild(document.createTextNode(`${rawBinBytes} ${unitsToConvertB[rawBinUnit]} = `));
    resultList.appendChild(enteredUnit);

    for(d=0;d<decimalUnits;d++){
     var rawResult = ((rawBinBytes * baseBinUnit) / Math.pow(1000,d));
     rawResult = (d == 0) ? rawResult : rawResult.toFixed(d * 2);
     var resultItem = document.createElement("li");
     if(d == new Number(rawDecUnit)){resultItem.style.fontWeight = "bold";}
     resultItem.appendChild(document.createTextNode(`${rawResult} ${unitsToConvertD[d]}`));
     resultList.appendChild(resultItem);
    }

   }
   document.getElementById("other_results").appendChild(resultList);
  }
 };