
var drawPos = "cal_table";
var drawPosMon = "cal_monthname";
var drawWidth = "15em";
var drawHeight = "3em";
var drawPadding = "0.125em";
var fSize = "0.875em";

var d_drawWidth = "15em";
var d_drawHeight = "1.2em";
var d_drawPadding = "0.5em";
var d_fSize = "3.25em";

var baseLat = 37.5667;
var baseLong = 126.9667;

var calYearRangeMin = -10000;
var calYearRangeMax = 10000;


var koreanSolarPublicHolidays = [101,301,505,606,815,1003,1009,1225];

var koreanNationalDays = [301,815,1003,1009];

var koreanSolarPublicHolidayNames = {
 101 : "신정",
 301 : "3.1절",
 505 : "어린이날",
 606 : "현충일",
 815 : "광복절",
 1003 : "개천절",
 1009 : "한글날",
 1225 : "성탄절 (기독탄신일)"
};

var koreanProvisionalHolidays = {
 20220309 : "20대 대통령 선거",
 20220601 : "8차 지방선거"
};

var weekdayName = ["일","월","화","수","목","금","토"];

// 페이지의 특정 부분 숨기기/보이기
function togglehide(obid){
 var styleob=document.getElementById(obid).style;
 if(styleob.display != "none"){styleob.display="none";}
 else{styleob.display="inline-block";}
}

function commonEraYears(year){
 if(year <= 0){return "기원전 "+Math.abs(year-1)+"년";}
 else{return year+"년";}
}

function drawCalendarTable(year,month,drawPositionTable,drawPositionMonth){

 var today = new Date();
 var todayYear = today.getFullYear();
 var todayMonth = today.getMonth();
 var todayDate = today.getDate();

 if(year < calYearRangeMin || year > calYearRangeMax){
  document.getElementById(drawPositionTable).innerHTML = "표시 가능한 범위를 벗어났습니다.";
  document.getElementById(drawPositionMonth).innerHTML = "";
  return false;
 }

 var firstDay = new Date(year,month,1);
 var firstWeekday = firstDay.getDay();

 var monthChecksum = (year * 100)+month;
 var dateOffset = Math.floor(year / 100)-Math.floor(year / 400)-2;

 if(monthChecksum <= 158209){firstWeekday=jwday(solar2JD(year,month+1,1));}

 var lastDayByMonth = [31,0,31,30,31,30,31,31,30,31,30,31];

 if(year <= 2100){
 var lunarholiday_01 = lunar2solar(year,1,1,0);
 var d_lunarholiday_01 = yeardays(lunarholiday_01[0],lunarholiday_01[1],lunarholiday_01[2]);
 var lunarholiday_02 = lunar2solar(year,4,8,0);
 var d_lunarholiday_02 = yeardays(lunarholiday_02[0],lunarholiday_02[1],lunarholiday_02[2]);
 var lunarholiday_03 = lunar2solar(year,8,15,0);
 var d_lunarholiday_03 = yeardays(lunarholiday_03[0],lunarholiday_03[1],lunarholiday_03[2]);
 }else{}

 if(year > 1582){
  if(((year % 4 == 0) && (year % 100 !== 0)) || (year % 400 == 0)){lastDayByMonth[1] = 29;}
  else{lastDayByMonth[1] = 28;}
 }else{
  if(year % 4 == 0){lastDayByMonth[1] = 29;}
  else{lastDayByMonth[1] = 28;}
 }

 var lastDay = lastDayByMonth[month];

 // 그레고리력이 처음으로 적용된 달(양력 1582년 10월)의 날짜 수
 if(year == 1582 && month == 9){lastDay = 21;}

 var rows = Math.ceil(new Number(firstWeekday+lastDay) / 7);

 var tableText = document.createElement("table");

 tableText.style.margin = "auto";
 tableText.style.width = drawWidth;
 tableText.style.fontSize = fSize;

 var weekdayRow = document.createElement("tr");
 var d = 0;

 for(d=0;d<7;d++){
  var weekdayDisplay = document.createElement("th");
  var weekdayText = document.createTextNode(weekdayName[d]);
  weekdayDisplay.appendChild(weekdayText);
  weekdayRow.appendChild(weekdayDisplay);
 }
 
 tableText.appendChild(weekdayRow);

 var day = 1;
 var dateChecksum = 0;
 var lunarDateChecksum = 0;
 
 for(p=1;p<=rows;p++){
  var dateRow = document.createElement("tr");
  dateRow.style.height = drawHeight;
  for(q=1;q<=7;q++){
   var dateDisplay = document.createElement("td");
   if(q == 1){dateDisplay.style.color="#FF0000";}
   if(q == 7){dateDisplay.style.color="#0000FF";}
   dateDisplay.style.height = drawHeight;
   dateDisplay.style.padding = drawPadding;
   if((p == 1 && q <= firstWeekday) || day > lastDay){
    dateDisplay.appendChild(document.createTextNode(" "));
   }else{
    if((year == 1582 && month == 9) && day > 4){dateDisplay.appendChild(document.createTextNode(day+10));}
    else{dateDisplay.appendChild(document.createTextNode(day));}
    dateChecksum = ((month + 1) * 100)+day;
    var lunarDate = solar2lunar(year,month+1,day);
    var lunarLeap = lunarDate[3];
    dayCount = yeardays(year,month+1,day);
    if(lunarDate != false){
     var lunarDisplay = document.createElement("sub");
     lunarDisplay.style.fontSize = "60%";
     if(lunarDate[3] == 1){lunarDisplay.appendChild(document.createTextNode("(윤)"+lunarDate[1]+"."+lunarDate[2]));}
     else{lunarDisplay.appendChild(document.createTextNode(lunarDate[1]+"."+lunarDate[2]));}
     dateDisplay.appendChild(document.createElement("br"));
     dateDisplay.appendChild(lunarDisplay);
    }

    if(year == todayYear && month == todayMonth && day == todayDate){dateDisplay.style.backgroundColor="#EEEEAA";}

    // 한국 공휴일 처리
    if(year >= 1948){
     let holidayDate = day;
     let holidayChecksum = ((month + 1) * 100)+day;
     // 일반 공휴일
     if(koreanSolarPublicHolidays.indexOf(holidayChecksum) != -1){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = koreanSolarPublicHolidayNames[holidayChecksum];
      dateDisplay.addEventListener("click",function(){alert(`${month+1}월 ${holidayDate}일 : ${koreanSolarPublicHolidayNames[holidayChecksum]}`);});
     }
     // 공휴일의 대체휴일 처리 (공휴일이면서 국경일인 경우에만 해당)
     if((koreanNationalDays.indexOf(holidayChecksum-1) != -1 || koreanNationalDays.indexOf(holidayChecksum-2) != -1) && q == 2){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = "대체휴일";
      dateDisplay.addEventListener("click",function(){alert(`${month+1}월 ${holidayDate}일 : 대체휴일`);});
     }
     // 주요 선거(대통령/국회의원/지자체) 등의 법정 공휴일
     let holidayChecksumEx = (year * 10000)+((month + 1) * 100)+day;
     if((holidayChecksumEx in koreanProvisionalHolidays) === true){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = koreanProvisionalHolidays[holidayChecksumEx];
      dateDisplay.addEventListener("click",function(){alert(`${year}년 ${month+1}월 ${holidayDate}일 : ${koreanProvisionalHolidays[holidayChecksumEx]}`);});
     }
    }
     let lunarHolidayDate = day;
     if(dayCount >= d_lunarholiday_01-1 && dayCount <= d_lunarholiday_01+1 && lunarDate[3] !== 1){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = "설날";
      dateDisplay.addEventListener("click",function(){alert(`${month+1}월 ${lunarHolidayDate}일 : 설날`);});
     }
     if(dayCount == d_lunarholiday_02 && lunarDate[3] !== 1){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = "석가탄신일";
      dateDisplay.addEventListener("click",function(){alert(`${month+1}월 ${lunarHolidayDate}일 : 석가탄신일`);});
     }
     if(dayCount >= d_lunarholiday_03-1 && dayCount <= d_lunarholiday_03+1 && lunarDate[3] !== 1){
      dateDisplay.style.color="#FF0000";
      dateDisplay.style.cursor = "help";
      dateDisplay.style.fontWeight = "bold";
      dateDisplay.title = "추석";
      dateDisplay.addEventListener("click",function(){alert(`${month+1}월 ${lunarHolidayDate}일 : 추석`);});
     }
    day++;
   }
   dateRow.appendChild(dateDisplay);
  }
  tableText.appendChild(dateRow);
 }

 document.getElementById(drawPositionTable).innerHTML = "";
 document.getElementById(drawPositionMonth).innerHTML = "";

 var monthDisplay = document.createElement("div");
 monthDisplay.style.fontWeight = "bold";
 monthDisplay.style.fontSize = "1.375em";
 monthDisplay.style.margin = "0.5em";
 monthDisplay.appendChild(document.createTextNode(commonEraYears(year)+" "+(month+1)+"월"));

 document.getElementById(drawPositionMonth).appendChild(monthDisplay);
 document.getElementById(drawPositionTable).appendChild(tableText);
}

function seekTable(months){
 var y = new Number(document.getElementById("year_now").value);
 var m = new Number(document.getElementById("month_now").value);

 var yearAdjust = 0;
 var monthAdjust = 0;

 if(months <= 12){
  if((m+months) > 11){
   yearAdjust = y+1;
   monthAdjust = (m+months) % 12;
  }else if((m+months) < 0){
   yearAdjust = y-1;
   monthAdjust = 12-Math.abs(m+months);
  }else{
   yearAdjust = y;
   monthAdjust = (m+months);
  }
 }else{return false;}

 document.getElementById("year_now").value = yearAdjust;
 document.getElementById("month_now").value = monthAdjust;

 document.getElementById("in_year").value = yearAdjust;
 document.getElementById("in_month").selectedIndex = monthAdjust;

 drawCalendarTable(yearAdjust,monthAdjust,drawPos,drawPosMon);
}

function seekTableYears(years){
 var y = new Number(document.getElementById("year_now").value);
 var m = new Number(document.getElementById("month_now").value);

 var yearAdjust = y+years;

 document.getElementById("in_year").value = yearAdjust;
 document.getElementById("year_now").value = yearAdjust;
 
 drawCalendarTable(yearAdjust,m,drawPos,drawPosMon);
}

function showTable(){
 var year = new Number(document.getElementById("in_year").value);
 var month = new Number(document.getElementById("in_month").selectedIndex);

 document.getElementById("year_now").value = year;
 document.getElementById("month_now").value = month;
 
 drawCalendarTable(year,month,drawPos,drawPosMon);
}

function showDateTimeNow(){
 var dateNow = new Date();
 var yearNow = dateNow.getFullYear();
 var monthNow = dateNow.getMonth()+1;
 var dayNow = dateNow.getDate();
 var weekdayNow = dateNow.getDay();
 var hourNow = dateNow.getHours();
 var minNow = dateNow.getMinutes();
 var secNow = dateNow.getSeconds();
 var timezoneNow = dateNow.getTimezoneOffset();
 var timezoneHours = Math.abs(timezoneNow / 60);
 var timezoneMins = Math.abs(timezoneNow) % 60;
 timezoneMins = ((timezoneMins < 10) ? "0"+timezoneMins : timezoneMins);
 var timezoneDisplay = ((timezoneNow < 0) ? "+" : "-")+timezoneHours+":"+timezoneMins;

 var lunarDateNow = solar2lunar(yearNow,monthNow,dayNow);
 var lunarYearNow = lunarDateNow[0];
 var lunarMonthNow = lunarDateNow[1];
 var lunarDayNow = lunarDateNow[2];
 var isLunarLeap = (lunarDateNow[3] == 1) ? "(윤)" : "";
 var sbYearNow = kstems[lunarDateNow[5]]+kbranches[lunarDateNow[6]]+"("+hstems[lunarDateNow[5]]+hbranches[lunarDateNow[6]]+")년";
 var sbMonthNow = kstems[lunarDateNow[7]]+kbranches[lunarDateNow[8]]+"("+hstems[lunarDateNow[7]]+hbranches[lunarDateNow[8]]+")월";
 var sbDayNow = kstems[lunarDateNow[9]]+kbranches[lunarDateNow[10]]+"("+hstems[lunarDateNow[9]]+hbranches[lunarDateNow[10]]+")일";

 var dailyCalTable = document.createElement("table");
 dailyCalTable.style.margin = "auto";
 dailyCalTable.style.width = d_drawWidth;
 dailyCalTable.textAlign = "center";

 var monthNameRow = document.createElement("tr");
 var dayRow = document.createElement("tr");
 var weekdayRow = document.createElement("tr");
 var lunarDateRow = document.createElement("tr");
 var timeRow = document.createElement("tr");

 var monthNameDisplay = document.createElement("td");
 monthNameDisplay.style.fontSize = "1.2em";
 monthNameDisplay.style.padding = d_drawPadding;
 monthNameDisplay.appendChild(document.createTextNode(yearNow+"년 "+monthNow+"월"));
 monthNameRow.appendChild(monthNameDisplay);
 
 var dayDisplay = document.createElement("td");
 dayDisplay.style.height = d_drawHeight;
 dayDisplay.style.fontSize = d_fSize;
 dayDisplay.style.padding = d_drawPadding;
 dayDisplay.appendChild(document.createTextNode(dayNow));
 dayRow.appendChild(dayDisplay);

 var weekdayDisplay = document.createElement("td");
 weekdayDisplay.style.fontSize = "1.2em";
 weekdayDisplay.appendChild(document.createTextNode(weekdayName[weekdayNow]+"요일"));
 weekdayRow.appendChild(weekdayDisplay);

 dailyCalTable.appendChild(monthNameRow);
 dailyCalTable.appendChild(dayRow);
 dailyCalTable.appendChild(weekdayRow);

 var lunarDateDisplay = document.createElement("td");
 lunarDateDisplay.style.fontSize = "1.2em";
 lunarDateDisplay.appendChild(document.createTextNode("음. "+isLunarLeap+" "+lunarMonthNow+"월 "+lunarDayNow+"일"));
 lunarDateDisplay.style.cursor = "help";
 lunarDateDisplay.title = `${sbYearNow} ${sbMonthNow} ${sbDayNow}`;
 lunarDateDisplay.addEventListener("click",function(){alert(`음력 간지 : ${sbYearNow} ${sbMonthNow} ${sbDayNow}`);});

 lunarDateRow.appendChild(lunarDateDisplay);

 dailyCalTable.appendChild(lunarDateRow);

 var timeDisplay = document.createElement("td");
 timeDisplay.appendChild(document.createTextNode(`${onedights(hourNow)}:${onedights(minNow)}:${onedights(secNow)} (GMT${timezoneDisplay})`));
 timeRow.appendChild(timeDisplay);

 dailyCalTable.appendChild(timeRow);

 document.getElementById("datetime_now").innerHTML = "";
 document.getElementById("datetime_now").appendChild(dailyCalTable);
}

function getCoordInfo(){

 var dateNow = new Date();
 var yearNow = dateNow.getFullYear();
 var monthNow = dateNow.getMonth()+1;
 var dayNow = dateNow.getDate();
 var weekdayNow = dateNow.getDay();
 var hourNow = dateNow.getHours();
 var minNow = dateNow.getMinutes();
 var secNow = dateNow.getSeconds();
 var timezoneNow = dateNow.getTimezoneOffset();

 var curLat = baseLat;
 var curLong = baseLong;
 var coordTimestamp,coordYear,coordMonth,coordDay,coordHour,coordMin,coordSec,coordTimestampDisplay;
 var risetInfo_S;
 var risetInfo_M;
 var coordLink_G,coordDetails;
 var coordLink_N,coordLink_K;

 if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(function(p){
   curLat = p.coords.latitude;
   curLong = p.coords.longitude;
   
   coordTimestamp = new Date(p.timestamp);
   coordYear = coordTimestamp.getFullYear();
   coordMonth = coordTimestamp.getMonth()+1;
   coordDay = coordTimestamp.getDate();
   coordHour = coordTimestamp.getHours();
   coordMin = coordTimestamp.getMinutes();
   coordSec = coordTimestamp.getSeconds();
   coordTimestampDisplay = coordYear+"-"+onedights(coordMonth)+"-"+onedights(coordDay)+" "+onedights(coordHour)+":"+onedights(coordMin)+":"+onedights(coordSec);
   
   risetInfo_S = getSunriseSunset(yearNow,monthNow,dayNow,curLat,curLong,0,-(timezoneNow / 60),false);
   risetInfo_M = findMoonRiset(yearNow,monthNow,dayNow,-(timezoneNow / 60),curLong,curLat);
   coordDisplay = latLong(curLat,curLong);

   document.getElementById("coordinates_info").innerHTML = "<b>위치</b>: ";
   document.getElementById("coordinates_info").innerHTML += ((curLat > 0) ? "북위" : "남위")+" "+coordDisplay[0][1]+"&deg; "+coordDisplay[0][2]+"&prime; "+coordDisplay[0][3]+"&Prime;, ";
   document.getElementById("coordinates_info").innerHTML += ((curLong > 0) ? "동경" : "서경")+" "+coordDisplay[1][1]+"&deg; "+coordDisplay[1][2]+"&prime; "+coordDisplay[0][3]+"&Prime;<br />";
   document.getElementById("coordinates_info").innerHTML += "(정확도: 반경 약 "+Math.round(p.coords.accuracy)+"m 이내)"
   
   document.getElementById("coordinates_links").innerHTML = "";

   coordLink_G = document.createElement("a");
   coordLink_G.href = "https://www.google.com/maps/place/"+curLat+","+curLong;
   coordLink_G.appendChild(document.createTextNode("[구글 지도에서 이 위치 보기]"));
   document.getElementById("coordinates_links").appendChild(coordLink_G);

   document.getElementById("coordinates_links").innerHTML += "&nbsp;";

   var a = new XMLHttpRequest();

   a.onreadystatechange = function(){
    if(a.readyState == 4 && a.status == 200){
     var cc = (JSON.parse(a.responseText)).country_code.toLowerCase();
     if((cc == "kr") && (curLat >= 32.875 && curLat <= 43.125) && (curLong >= 124 && curLong <= 132)){ // 위치 정보가 한반도 위치 범위 내이고 IP 주소 상 위치가 대한민국으로 잡힐 경우
      document.getElementById("coordinates_links").innerHTML += "<br />";

      var r = new XMLHttpRequest();
      r.onreadystatechange = function(){
       if(r.readyState == 4){
        if(r.status == 200){
         document.getElementById("coordinates_address").innerHTML = "<b>주소지</b>: ";
         var s = JSON.parse(r.responseText);
         if((typeof s.address_full != "undefined") && (s.address_full != null)){document.getElementById("coordinates_address").innerHTML += `${s.address_full} 인근`;}
         else{document.getElementById("coordinates_address").innerHTML += "(자료 없음)";}
        }else{
         alert(`정보를 불러오던 도중 오류가 발생하였습니다. [${r.status}]\n잠시 후 다시 시도해보세요.`);
         if(r.status == 404){document.getElementById("coordinates_address").innerHTML += "(자료 없음)";}
        }
       }
      };

      coordLink_N = document.createElement("a");
      coordLink_N.href = "https://map.naver.com/";
      coordLink_N.appendChild(document.createTextNode("[네이버 지도 앱 열기]"));
      document.getElementById("coordinates_links").appendChild(coordLink_N);
      document.getElementById("coordinates_links").innerHTML += "&nbsp;";

      coordLink_K = document.createElement("a");
      coordLink_K.href = "https://map.kakao.com/";
      coordLink_K.appendChild(document.createTextNode("[카카오맵 앱 열기]"));
      document.getElementById("coordinates_links").appendChild(coordLink_K);
      document.getElementById("coordinates_links").innerHTML += "<br />";

      document.getElementById("coordinates_address").innerHTML = "<b>주소지</b>: 불러오는 중..."
      r.open("GET",`https://api.yukinaserver.net/geolookup/local?coord_lat=${curLat}&coord_long=${curLong}`);
      r.send();
     }else{ // 그 이외의 경우
      var r = new XMLHttpRequest();
      r.onreadystatechange = function(){
       if(r.readyState == 4){
        if(r.status == 200){
         document.getElementById("coordinates_address").innerHTML = "<b>현재 지역</b>: ";
         var s = JSON.parse(r.responseText);
         if((typeof s.address_full != "undefined") && (s.address_full != null)){document.getElementById("coordinates_address").innerHTML += `${s.address_full} 인근`;}
         else{document.getElementById("coordinates_address").innerHTML += "(자료 없음)";}
        }else{
         alert(`정보를 불러오던 도중 오류가 발생하였습니다. [${r.status}]\n잠시 후 다시 시도해보세요.`);
         if(r.status == 404){document.getElementById("coordinates_address").innerHTML += "(자료 없음)";}
         else if(r.status == 500){document.getElementById("coordinates_address").innerHTML += "(일시적인 오류)";}
        }
       }
      };

      document.getElementById("coordinates_links").innerHTML += "<br />";
      document.getElementById("coordinates_address").innerHTML = "<b>현재 지역</b>: 불러오는 중..."
      r.open("GET",`https://api.yukinaserver.net/geolookup/global?coord_lat=${curLat}&coord_long=${curLong}`);
     }
    }
   };

   document.getElementById("coordinates_details").innerHTML = "고도: "+((p.coords.altitude != null) ? "약 "+Math.round(p.coords.altitude)+"m" : "N/A")+", 속도: "+((p.coords.heading != null) ? ((isNaN(p.coords.heading) != true) ? "" : degrees2direction(p.coords.heading)) : "")+" "+((p.coords.speed != null) ? Math.round(p.coords.speed * 3.6)+"km/h" : "N/A")+"<br />";
   document.getElementById("coordinates_details").innerHTML += "최근 확정: "+coordTimestampDisplay;

   document.getElementById("sunriset_info").innerHTML = "<b>일출</b>: "+risetInfo_S[1]+", <b>남중</b>: "+risetInfo_S[5]+", <b>일몰</b>: "+risetInfo_S[3]+"<br />(낮의 길이 "+risetInfo_S[6]+")";
   document.getElementById("moonriset_info").innerHTML = "<b>월출</b>: "+risetInfo_M[0]+", <b>월몰</b>: "+risetInfo_M[1]+"";

   a.open("GET","https://get.geojs.io/v1/ip/geo.json"); // IP 주소 정보 불러오기
   a.send();
  },function(e){
   alert("위치정보 수집을 허용하지 않았거나 오류가 발생하였습니다.");
   document.getElementById("coordinates_info").innerHTML = "위치정보를 얻어올 수 없습니다.";
   document.getElementById("coordinates_links").innerHTML = "";
   document.getElementById("sunriset_info").innerHTML = "";
   document.getElementById("moonriset_info").innerHTML = "";
   console.error(e);
  },
  {enableHighAccuracy: true, maximumAge: 0, timeout: Infinity});
  return;
 }else{document.getElementById("coordinates_info").innerHTML = "위치정보가 제공되지 않습니다. 브라우저에서 해당 기능을 지원하지 않습니다.";} // 브라우저가 위치정보 API를 지원하지 않을 경우
}

function coordAutoRefresh(){
 var isAutoRefresh = document.getElementById("coords_autorefresh").checked;
 if(isAutoRefresh == true){
  getCoordInfo();
  document.getElementById("autorefresh_id").value = setInterval("getCoordInfo();",10000);
 }else{
  clearInterval(document.getElementById("autorefresh_id").value);
  document.getElementById("autorefresh_id").value = 0;
 }
}

function initTable(){

 var dateNow = new Date();
 var yearNow = dateNow.getFullYear();
 var monthNow = dateNow.getMonth();

 document.getElementById("year_now").value = yearNow;
 document.getElementById("month_now").value = monthNow;

 document.getElementById("in_year").value = yearNow;
 document.getElementById("in_month").selectedIndex = monthNow;


 document.getElementById("year_range").innerHTML = commonEraYears(calYearRangeMin)+" ~ "+commonEraYears(calYearRangeMax);
 getCoordInfo();
 showTable();
 setInterval("showDateTimeNow();",200);
}

function resetTable(){
 var dateNow = new Date();
 var yearNow = dateNow.getFullYear();
 var monthNow = dateNow.getMonth();

 document.getElementById("year_now").value = yearNow;
 document.getElementById("month_now").value = monthNow;

 document.getElementById("in_year").value = yearNow;
 document.getElementById("in_month").selectedIndex = monthNow;
 
 document.getElementById("year_range").innerHTML = commonEraYears(calYearRangeMin)+" ~ "+commonEraYears(calYearRangeMax);
 showTable();
}


