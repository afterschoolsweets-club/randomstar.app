


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

   

  }
 };