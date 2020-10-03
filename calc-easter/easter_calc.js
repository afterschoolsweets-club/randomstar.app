
// 정수가 아닌 실수에 대해 나머지를 구하는 함수
function dmod(x,y){return x-(y * Math.floor(x / y));}

// 음의 정수에 대해 옳은 나머지를 구하는 함수
function gmod(x,y){return ((x % y)+y) % y;}

function amod(x,y){return dmod(x-1,y)+1;}

var weekdayStr = new Array("일","월","화","수","목","금","토");
var dLetterStr = new Array("G","F","E","D","C","B","A","AG","GF","FE","ED","DC","CB","BA"); // 주일 문자
var dLetterDesc = new Array(
"월요일로 시작하는 평년",
"화요일로 시작하는 평년",
"수요일로 시작하는 평년",
"목요일로 시작하는 평년",
"금요일로 시작하는 평년",
"토요일로 시작하는 평년",
"일요일로 시작하는 평년",
"일요일로 시작하는 윤년",
"월요일로 시작하는 윤년",
"화요일로 시작하는 윤년",
"수요일로 시작하는 윤년",
"목요일로 시작하는 윤년",
"금요일로 시작하는 윤년",
"토요일로 시작하는 윤년"
);


var kLetterStr = new Array("가해-나해","나해-다해","다해-가해");

var yearEarliestGregorian = 1583; // 1582년 그레고리력 도입 이후
var yearEarliestJulian = 326; // 325년 제1차 니케아 공의회 이후

var yearLatestLunar = 2100; // 음력 계산을 지원하는 마지막 해

var easterCalc = {

 // 입력된 양력년도가 윤년(366일 -- 2월 29일이 있는 해)인지 검사
 isLeap : function(year,ctype){
  if(ctype == 0){return ((year % 4) == 0);}
  else if(ctype == 1){return ((((year % 100) % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0))));}
 },

 // 양력 날짜를 율리우스 적일로 변환
 solar2JD : function(year,month,day){
  if(month <= 2){
   year--;
   month+=12;
  }
  var b;
  var checksum=(year * 10000)+(month * 100)+day;
  var a=Math.floor(year / 100);
  if(checksum >= 15821015){b=2-a+Math.floor(a / 4);}
  else if(checksum <= 15821004){b=0;}
  else{return -1;}
  return Math.floor(365.25 * (year+4716))+Math.floor(30.6001 * (month+1))+day+(b-1524.5);
 },

 // 율리우스 적일을 양력 날짜로 변환
 JD2solar : function(jd){
  var numdays=Math.floor(jd+0.5);
  var a;
  if(numdays < 2299161){a=numdays;}
  else{
   var alpha=Math.floor((numdays-1867216.25) / 36524.25);
   a=numdays+1+(alpha-Math.floor(alpha / 4));
  }
  var b=a+1524;
  var c=Math.floor((b-122.1) / 365.25);
  var d=Math.floor(c * 365.25);
  var e=Math.floor((b-d) / 30.6001);
  
  var month=(e < 14) ? (e-1) : (e-13);
  var year=(month > 2) ? (c-4716) : (c-4715);
  var day=b-d-Math.floor(30.6001 * e);
  return new Array(year,month,day);
 },
 
 // 율리우스 적일로 요일을 구함
 getWeekday : function(jd){return dmod(Math.floor(jd+1.5),7);},
 weekdayBefore : function(weekday,JD){return JD-this.getWeekday(JD-weekday);},
 searchWeekday : function(weekday,JD,d,o){return this.weekdayBefore(weekday,JD+(d * o));},
 prevWeekday : function(weekday,JD){return this.searchWeekday(weekday,JD,-1,1);},
 nextWeekday : function(weekday,JD){return this.searchWeekday(weekday,JD,1,7);},
 numOfWeeks : function(weekday,JD,nthweek){
  var k = (nthweek * 7);
  if(nthweek > 0){k += this.prevWeekday(weekday,JD);}
  else{k += this.nextWeekday(weekday,JD);}
  return k;
 },

 // 년,월,일로부터 연중 일수 계산
 yearDays : function(year,month,day,ctype){
  var leapadj = this.isLeap(year,ctype) ? 1 : 2;
  return Math.floor((275 * month) / 9)-(leapadj * Math.floor((month+9) / 12))+day-30;
 },

 daysDate : function(year,dayCount,ctype){
  var leapadj = this.isLeap(year,ctype) ? 1 : 0;
   if(dayCount < 1){
    var mon = Math.floor((dayCount+leapadj-3) / 30.6)+3;
    var alpha = Math.floor((dayCount+leapadj-3) / 30.6);
    var day = Math.floor(dayCount+leapadj-3-(30.6 * alpha))+1;
   }else if(dayCount > 0){
    var mon = Math.floor((dayCount+30) / 30.6)+2;
    var day = Math.floor(dayCount+183-(30.6 * (mon+3)))+1;
   }
  return new Array(mon,day);
 },

 // 그레고리력(현대 서방 교회)
 calcEaster : function(year){
  var a = gmod(year,19);
  var golden = a+1;
  var b = Math.floor(year / 100);
  var c = gmod(year,100);
  var d = Math.floor(b / 4);
  var e = gmod(b,4);
  var f = Math.floor((b+8) / 25);
  var g = Math.floor((b-f+1) / 3);
  var h = gmod(((a * 19)+b-d-g+15),30);
  var i = Math.floor(c / 4);
  var k = gmod(c,4);
  var l = gmod((32+(e * 2)+(i * 2)-h-k),7);
  var m = Math.floor((a+(h * 11)+(l * 22)) / 451);
  
  var ep = gmod(((11 * a)+8-b+d+Math.floor(((8 * b)+13) / 25)),30);
  if(ep <= 23){var fullMoonArg = 136-ep;}
  else if((ep == 24) || (ep == 25)){var fullMoonArg = 141;}
  else if((ep == 25) && (golden > 11)){var fullMoonArg = 140;}
  else if(ep >= 26){var fullMoonArg = 166-ep;}

  var monFullMoon = Math.floor(fullMoonArg / 31);
  var dayFullMoon = gmod(fullMoonArg,31)+1;
  
  var easterArg = (h+l-(m * 7)+114);

  var monEaster = Math.floor(easterArg / 31);
  var dayEaster = gmod(easterArg,31)+1;

  var solCycle = gmod((year+8),28)+1;
  var s = gmod((6+Math.floor((year * 5) / 4)-Math.floor(year / 100)+Math.floor(year / 400)),7);
  var leapadj = (this.isLeap(year,1) == false) ? 0 : 1;
  var dLetterArg = s+(leapadj * 7);

  return new Array(monEaster,dayEaster,monFullMoon,dayFullMoon,easterArg,fullMoonArg,dLetterArg);
 },
 
 // 율리우스력(현대 동방 교회, 1582년 및 그 이전의 서방 교회)
 calcEasterJulian : function(year){
  var a = gmod(year,4);
  var b = gmod(year,7);
  var c = gmod(year,19);
  var golden = c+1;
  var d = gmod((c * 19)+15,30);
  if(golden == 1){d++;}
  var e = gmod((a * 2)+(b * 4)-d+6,7);
  var fullMoonArg = 113+d;
  var easterArg = fullMoonArg+e+1;

  var monFullMoon = Math.floor(fullMoonArg / 31);
  var dayFullMoon = gmod(fullMoonArg,31)+1;
  
  var monEaster = Math.floor(easterArg / 31);
  var dayEaster = gmod(easterArg,31)+1;
  
  var solCycle = gmod((year+8),28)+1;
  var s = gmod(4+Math.floor((year * 5) / 4),7);
  var leapadj = (this.isLeap(year,0) == false) ? 0 : 1;
  var dLetterArg = s+(leapadj * 7); 

  return new Array(monEaster,dayEaster,monFullMoon,dayFullMoon,easterArg,fullMoonArg,dLetterArg);
 },

 // 유월절(유다 달력) 계산
 calcPassover : function(year){
  var a = gmod((year * 12)+12,19);
  var b = gmod(year,4);
  var s = ((((1979335-(year * 313)) * 5)+(a * 765433)) / 492480)+(b / 4);
  var q = Math.floor(s);
  var r = s-q;
  var c = gmod((q+(year * 3)+(b * 5)+1),7);
  var solarOffset = (Math.floor(year / 100)-Math.floor(year / 400)-2);
  var passoverArg = q+solarOffset+92;
  var p = 0;

  if((c == 2) || (c == 4) || (c == 6)){p = 1;}
  else if((c == 1) && (a > 6) && (r > (1366 / 2160))){p = 2;}
  else if((c == 0) && (a > 11) && (r > (23268 / 25920))){p = 1;}
  passoverArg = passoverArg+p;
  if(year < 1583){passoverArg=passoverArg-solarOffset;}
  var monPassover = Math.floor((passoverArg-62) / 30.6);
  var dayPassover = Math.floor(passoverArg-62-(monPassover * 30.6))+1;
  monPassover = monPassover+2;
  var hebrewYear = year+3760;
  var weekdayPassover = this.getWeekday(this.solar2JD(year,monPassover,dayPassover));

  return new Array(year,hebrewYear,monPassover,dayPassover,weekdayPassover);
 },

 calcFeasts : function(){
  var yr = new Number(document.getElementById("cal_year").value);
  if(yr >= yearEarliestGregorian){var eDate = this.calcEaster(yr);}
  else if(yr < yearEarliestGregorian){var eDate = this.calcEasterJulian(yr);}
  var leapadj = (this.isLeap(yr,1) == false) ? 0 : 1;

  var d3 = (31 * (eDate[0]-3))+eDate[1];
  var d_abs = this.yearDays(yr,eDate[0],eDate[1],1);

  var dlArg = eDate[6];

  var daysFrom = 0;
  var daysText = "";
  
  if(dlArg == 6 || dlArg == 7){var epiphany = -58-leapadj;}
  else if(dlArg == 5 || dlArg == 13){var epiphany = -57-leapadj;}
  else if(dlArg == 4 || dlArg == 12){var epiphany = -56-leapadj;}
  else if(dlArg == 3 || dlArg == 11){var epiphany = -55-leapadj;}
  else if(dlArg == 2 || dlArg == 10){var epiphany = -54-leapadj;}
  else if(dlArg == 1 || dlArg == 9){var epiphany = -53-leapadj;}
  else if(dlArg == 0 || dlArg == 8){var epiphany = -52-leapadj;}

  if(dlArg == 6 || dlArg == 13){var advent = 278;}
  else if(dlArg == 5 || dlArg == 12){var advent = 272;}
  else if(dlArg == 4 || dlArg == 11){var advent = 273;}
  else if(dlArg == 3 || dlArg == 10){var advent = 274;}
  else if(dlArg == 2 || dlArg == 9){var advent = 275;}
  else if(dlArg == 1 || dlArg == 8){var advent = 276;}
  else if(dlArg == 0 || dlArg == 7){var advent = 277;}


  /* 매년 날짜가 변경되는 축일 */
  daysFrom = epiphany; // 주님 공현 대축일 (주현절)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_epiphany").innerHTML = daysText+"일";}
  else{document.getElementById("date_epiphany").innerHTML = "--\n";}

  daysFrom = epiphany+7; // 주님 세례 축일 (첫번째 연중시기 시작)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_baptismfeast").innerHTML = daysText+"일";}
  else{document.getElementById("date_baptismfeast").innerHTML = "--\n";}

  daysFrom = d3-46; // 재의 수요일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_ashwednesday").innerHTML = daysText+"일";}
  else{document.getElementById("date_ashwednesday").innerHTML = "--\n";}
  
  daysFrom = d3-42; // 사순 제1주일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_quadragesima").innerHTML = daysText+"일";}
  else{document.getElementById("date_quadragesima").innerHTML = "--\n";}

  daysFrom = d3-21; // 사순 제4주일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_midlentsunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_midlentsunday").innerHTML = "--\n";}
  
  daysFrom = d3-7; // 성지 주일 (성주간 시작)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_palmsunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_palmsunday").innerHTML = "--\n";}

  daysFrom = d3-3; // 주님 만찬 성 목요일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_holythursday").innerHTML = daysText+"일";}
  else{document.getElementById("date_holythursday").innerHTML = "--\n";}

  daysFrom = d3-2; // 주님 수난 성 금요일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_goodfriday").innerHTML = daysText+"일";}
  else{document.getElementById("date_goodfriday").innerHTML = "--\n";}

  daysFrom = d3-1; // 성 토요일 -- 부활 성야
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_holysaturday").innerHTML = daysText+"일";}
  else{document.getElementById("date_holysaturday").innerHTML = "--\n";}
  
  daysFrom = d3; // 주님 부활 대축일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_eastersunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_eastersunday").innerHTML = "--\n";}

  daysFrom = d3+21; // 성소 주일 (부활 제4주일)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_easter4thsunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_easter4thsunday").innerHTML = "--\n";}

  daysFrom = d3+42; // 주님 승천 대축일 (부활 제7주일)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_ascensionsunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_ascensionsunday").innerHTML = "--\n";}

  daysFrom = d3+49; // 성령 강림 대축일 (두번째 연중시기 시작)
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_pentecost").innerHTML = daysText+"일";}
  else{document.getElementById("date_pentecost").innerHTML = "--\n";}

  daysFrom = d3+56; // 삼위일체 대축일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_trinitysunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_trinitysunday").innerHTML = "--\n";}

  daysFrom = d3+63; // 성체 성혈 대축일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_corpuschristi").innerHTML = daysText+"일";}
  else{document.getElementById("date_corpuschristi").innerHTML = "--\n";}

  daysFrom = d3+68; // 예수 성심 대축일
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_sacredheart").innerHTML = daysText+"일";}
  else{document.getElementById("date_sacredheart").innerHTML = "--\n";}

  daysFrom = advent-7; // 그리스도 왕 대축일
  if(yr == 1582 && (daysFrom >= (d3+173))){daysFrom = daysFrom-4;} // 1582년 한정 그레고리력 첫 도입에 따른 날짜 차이 반영
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_christtheking").innerHTML = daysText+"일";}
  else{document.getElementById("date_christtheking").innerHTML = "--\n";}

  daysFrom = advent; // 대림 제1주일 (전례력 새해)
  if(yr == 1582 && (daysFrom >= (d3+173))){daysFrom = daysFrom-4;}
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_adventsunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_adventsunday").innerHTML = "--\n";}

  daysFrom = advent+21; // 대림 제4주일
  if(yr == 1582 && (daysFrom >= (d3+173))){daysFrom = daysFrom-4;}
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_lastadvent").innerHTML = daysText+"일";}
  else{document.getElementById("date_lastadvent").innerHTML = "--\n";}

  daysFrom = advent+28; // 성탄 팔일축제 내 주일
  if(yr == 1582 && (daysFrom >= (d3+173))){daysFrom = daysFrom-4;}
  daysText = this.daysDate(yr,daysFrom,1).join("월 ");
  if(yr >= yearEarliestJulian){document.getElementById("date_christmasoctavesunday").innerHTML = daysText+"일";}
  else{document.getElementById("date_christmasoctavesunday").innerHTML = "--\n";}


  /* 날짜가 고정된 축일 */
  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,1,1))]; // 천주의 성모 마리아 대축일
  document.getElementById("weekday_101").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,1,1,1)-d_abs;}
  else if(yr >= yearEarliestJulian){daysFrom = this.yearDays(yr,1,1,0)-d_abs;}
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_101").innerHTML = daysText;}
  else{document.getElementById("easteroffset_101").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,3,19))]; // 복되신 동정 마리아의 배필 성 요셉 대축일
  document.getElementById("weekday_319").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,3,19,1)-d_abs;}
  else if(yr >= yearEarliestJulian){daysFrom = this.yearDays(yr,3,19,0)-d_abs;}
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_319").innerHTML = daysText;}
  else{document.getElementById("easteroffset_319").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,6,29))]; // 성 베드로와 바오로 사도 대축일
  document.getElementById("weekday_629").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,6,29,1)-d_abs;}
  else if(yr >= yearEarliestJulian){daysFrom = this.yearDays(yr,6,29,0)-d_abs;}
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_629").innerHTML = daysText;}
  else{document.getElementById("easteroffset_629").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,8,15))]; // 성모 승천 대축일
  document.getElementById("weekday_815").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,8,15,1)-d_abs;}
  else if(yr >= yearEarliestJulian){daysFrom = this.yearDays(yr,8,15,0)-d_abs;}
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_815").innerHTML = daysText;}
  else{document.getElementById("easteroffset_815").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,9,29))]; // 성 미카엘 가브리엘 라파엘 대천사 축일
  document.getElementById("weekday_929").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,9,29,1)-d_abs;}
  else if(yr >= yearEarliestJulian){daysFrom = this.yearDays(yr,9,29,0)-d_abs;}
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_929").innerHTML = daysText;}
  else{document.getElementById("easteroffset_929").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,11,1))]; // 모든 성인 대축일
  document.getElementById("weekday_1101").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,11,1,1)-d_abs;}
  else if(yr >= yearEarliestJulian){
   daysFrom = this.yearDays(yr,11,1,0)-d_abs;
   if(yr == 1582){daysFrom = daysFrom-10;}
  }
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_1101").innerHTML = daysText;}
  else{document.getElementById("easteroffset_1101").innerHTML = "--";}

  wday = weekdayStr[this.getWeekday(this.solar2JD(yr,12,25))]; // 주님 성탄 대축일
  document.getElementById("weekday_1225").innerHTML = wday;
  if(yr >= yearEarliestGregorian){daysFrom = this.yearDays(yr,12,25,1)-d_abs;}
  else if(yr >= yearEarliestJulian){
   daysFrom = this.yearDays(yr,12,25,0)-d_abs;
   if(yr == 1582){daysFrom = daysFrom-10;}
  }
  daysText = (daysFrom < 0) ? Math.abs(daysFrom)+"일 전" : Math.abs(daysFrom)+"일 후";
  if(yr >= yearEarliestJulian){document.getElementById("easteroffset_1225").innerHTML = daysText;}
  else{document.getElementById("easteroffset_1225").innerHTML = "--";}

  document.getElementById("year_detail").innerHTML = yr+ "년";
  if(yr >= yearEarliestGregorian){document.getElementById("year_type").innerHTML = this.isLeap(yr,1) ? "윤년 (366일)" : "평년 (365일)";}
  else if(yr >= yearEarliestJulian){document.getElementById("year_type").innerHTML = this.isLeap(yr,0) ? "윤년 (366일)" : "평년 (365일)";}

  if(yr >= yearEarliestJulian){
   document.getElementById("full_moon").innerHTML = eDate[2]+"월 "+eDate[3]+"일";
   document.getElementById("lunar_age").innerHTML = 14+(eDate[4]-eDate[5])+"일";
   document.getElementById("korean_yearletter").innerHTML = kLetterStr[gmod(yr-1,3)];
   document.getElementById("julianday_easter").innerHTML = "제 "+(this.solar2JD(yr,eDate[0],eDate[1])+0.5)+"일";
  }else{
   document.getElementById("full_moon").innerHTML = "--";
   document.getElementById("lunar_age").innerHTML = "--";
   document.getElementById("korean_yearletter").innerHTML = "--";
   document.getElementById("julianday_easter").innerHTML = "--";
  }

  document.getElementById("dominical_yearletter").innerHTML = dLetterStr[dlArg]+" ("+dLetterDesc[dlArg]+")";
  document.getElementById("solar_offset").innerHTML = (Math.floor(yr / 100)-Math.floor(yr / 400)-2)+"일";

  var passoverDate = this.calcPassover(yr);
  document.getElementById("date_passover").innerHTML = passoverDate[2]+"월 "+passoverDate[3]+"일 ("+weekdayStr[passoverDate[4]]+"요일)<br />(유다력 제 "+passoverDate[1]+"년)";

  lunarCalc.easterLunar();
  lunarCalc.feastsLunar();

 },
 setToYearNow : function(){
  var dt = new Date();
  var yr = dt.getFullYear();
  document.getElementById("cal_year").value = yr;
  this.calcFeasts();
 },
 adjustYear : function(dir){
  var year = new Number(document.getElementById("cal_year").value);
  var setTo = year+dir;
  document.getElementById("cal_year").value = setTo;
  this.calcFeasts();
 }
};

/* 음력 계산 부분 시작 */

var DAY0000=1721424.5; // 서기 기원전 1년 12월 31일에 해당하는 율리우스 적일
var SOLAR_EPOCH=1721425.5; // 서기 1년 1월 1일에 해당하는 율리우스 적일
var YEAR_MIN=1583; // 최소 허용연도
var YEAR_MAX=2100; // 최대 허용연도
var LUNAR_EPOCH=2299261.5;
var LOWER_LIMIT=LUNAR_EPOCH;
var UPPER_LIMIT=2488461.5;

var daysPerMonth=new Array(31,0,31,30,31,30,31,31,30,31,30,31); // 월별 날 수 (2월은 28 혹은 29)

var lunarMonthTab=new Array(
          [1, 5, 1, 2, 1, 1, 2, 1, 2, 2, 2, 2],  /* 1583 */
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2, 1],  /* 1585 */
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 4, 1, 1, 2, 1, 2, 2, 2, 2, 1],  /* 1591 */
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 5, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],  /* 1595 */
          [2, 2, 1, 2, 2, 1, 2, 3, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2],
          [1, 1, 2, 3, 2, 2, 1, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],  /* 1600 */
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],  /* 1601 */ // 0
          [2, 5, 1, 2, 1, 1, 2, 2, 1, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 5, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],  /* 1605 */ 
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],  /* 1611 */ // 10
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 4, 1],
          [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 5, 2, 1, 2, 1],
          [2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 6, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],  /* 1621 */ //20
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 4, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 4, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 5, 2],  /* 1631 */ //30
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 6, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [5, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],  /* 1641 */ //40
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 5, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 3, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],  /* 1651 */ //50
          [1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 4, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 5, 2, 2, 1, 2, 1],  /* 1661 */ //60
          [2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
          [2, 4, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],  /* 1671 */ //70
          [1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
          [1, 2, 2, 2, 4, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1, 2],
          [1, 2, 3, 2, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],  /* 1681 */ //80
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [1, 2, 2, 4, 1, 2, 2, 1, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 5, 1, 2, 1, 2, 2],  /* 1691 */ //90
          [2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 3, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1, 2],
          [2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],  /* 1701 */ //100
          [2, 1, 2, 2, 1, 5, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 5, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 5, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],  /* 1711 */ //110
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 5, 2, 2, 1, 2, 2, 1, 1],
          [2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 1, 2, 1, 2, 1, 4, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 4, 1, 2, 1, 2, 1, 2],  /* 1721*/ //120
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 4, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],  /* 1731 */ // 130
          [2, 1, 2, 1, 4, 1, 2, 2, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 4, 1, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 5, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 5, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],  /* 1741 */ //140
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 5, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],
          [1, 2, 5, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [1, 2, 1, 2, 2, 1, 6, 1, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2, 2],  /* 1751 */ //150
          [2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 5, 2, 1, 2, 1, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 1, 2, 2, 1, 5, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 1, 2, 1, 2, 4, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2],  /* 1761 */ //160
          [2, 1, 2, 2, 3, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 4, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1],
          [1, 2, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1],
          [1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 3, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],  /* 1771 */ //170
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 5, 2, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 5, 2, 1],
          [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 5, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1],
          [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],  /* 1781 */ //180
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],  /* 1791 */ //190
          [1, 2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 5, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 3, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
          [2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2, 1],
          [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],  /* 1801 */ //200
          [1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1],
          [2, 3, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 3, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 5, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 1, 5, 2, 1, 2, 2, 1, 2, 2, 1, 2],  /* 1811 */ //210
          [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 5, 2, 1, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 5, 2, 2, 1, 2, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],  /* 1821 */ //220
          [2, 1, 5, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 4, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],  /* 1831 */ //230
          [1, 2, 1, 2, 1, 1, 2, 1, 5, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 5, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],   /* 1841 */ //240
          [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2],   /* 1851 */ // 250
          [2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
          [1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1861 */
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1871 */
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
          [1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],   /* 1881 */
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
          [2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
          [1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
          [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
          [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
          [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
          [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
          [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
          [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
          [1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
          [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
          [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
          [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
          [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
          [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
          [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1],
          [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
          [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
          [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
          [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
          [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
          [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],  /* 2033 -- 윤달을 7월로 정할 것인가 11월로 정할 것인가에 대한 문제가 있음. 파일 윗부분 주석 내 URL 참고 */
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
          [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
          [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
          [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 2043 */
          [2, 1, 2, 1, 1, 2, 3, 2, 1, 2, 2, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [2, 1, 2, 2, 4, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
          [1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],  /* 2051 */
          [1, 2, 1, 1, 2, 1, 1, 5, 2, 2, 2, 2],
          [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
          [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 4, 1, 1, 2, 1, 2, 1],
          [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1],
          [2, 1, 2, 4, 2, 1, 2, 1, 2, 2, 1, 1],
          [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1],
          [2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 2, 1],   /* 2061 */
          [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
          [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
          [1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 5, 1, 2, 1, 2, 2, 2, 1, 2],
          [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
          [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],   /* 2071 */
          [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
          [2, 1, 2, 2, 1, 5, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
          [2, 1, 2, 3, 2, 1, 2, 2, 2, 1, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
          [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2],   /* 2081 */
          [1, 2, 2, 2, 1, 2, 3, 2, 1, 1, 2, 2],
          [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
          [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 6, 1, 2, 2, 1, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
          [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
          [1, 2, 1, 5, 1, 2, 1, 1, 2, 2, 2, 1],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
          [2, 2, 2, 1, 2, 1, 1, 5, 1, 2, 2, 1],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],   /* 2091 */
          [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
          [1, 2, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1],
          [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
          [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
          [2, 1, 2, 3, 2, 1, 1, 2, 2, 2, 1, 2],
          [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
          [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 5, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2],
          [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1]
          );


var lunarCalc = {
 solar2lunar : function(year,month,day){

  var m,mm,p,q;
  var i,j;
  var dt=new Array();
  var daysLunar;
  var absoluteDay1=LUNAR_EPOCH-DAY0000;
  var edays=easterCalc.solar2JD(year,month,day);
  var gyear=((year >= YEAR_MIN) && (year <= YEAR_MAX)) ? year : 0;
  if(gyear == 0){return false;}
  daysPerMonth[1]=(easterCalc.isLeap(gyear,1)) ? 29 : 28;
  var y=gyear-1;
  var absoluteDay2=easterCalc.solar2JD(year,month,day)-DAY0000;
  var absoluteDay=absoluteDay2-absoluteDay1+1;
  for(i=0;i<=gyear-1583;i++){
   dt[i]=0;
   for(j=0;j<12;j++){
   switch(lunarMonthTab[i][j]){
 	 case 1: daysLunar=29;
     break;
 	 case 2: daysLunar=30;
 	 break;
     case 3: daysLunar=58; // 29+29
	 break;
     case 4: daysLunar=59; // 29+30
	 break;
	 case 5: daysLunar=59; // 30+29
	 break;
	 case 6: daysLunar=60; //30+30
	 break;
	 }
 	dt[i]+=daysLunar;
    }
  }

   var p=0;
   do{
    if(absoluteDay > dt[p]){
     absoluteDay+=-dt[p];
     p++;
    }else{break;}
   }while(true);
   var q=0;
   var leap=0;
   do{
    if(lunarMonthTab[p][q] <= 2){
     m0=lunarMonthTab[p][q]+28;
 	 if(absoluteDay > m0){
 	  absoluteDay+=-m0;
 	  q++;
	 }else{break;}
   }else{
  switch(lunarMonthTab[p][q]){
	 case 3:
	  var m1=29;
	  var m2=29;
	 break;
	 case 4:
	  var m1=29;
	  var m2=30;
	 break;
	 case 5:
	  var m1=30;
	  var m2=29;
	 break;
	 case 6:
	  var m1=30;
	  var m2=30;
	 break;

	}

  if(absoluteDay > m1){
	 absoluteDay+=-m1;
	 if(absoluteDay > m2){
	  absoluteDay+=-m2;
	  q++;
	 }else{
	  leap=1;
	  break;
	 }
	}else{break;}
   }
  }while(true);
  p+=1583;
  q++;
  var r=absoluteDay;
  var lyear=p;
  var lmonth=q;
  var lday=r;
  
  var nDays=easterCalc.solar2JD(year,month,day); // 양력 날짜에 해당하는 율리우스 적일
  var syear=(lyear+6) % 10;
  var byear=(lyear-4) % 12;
  var sbmonth=((lyear * 12)+lmonth+13) % 60;
  var smonth=sbmonth % 10;
  var bmonth=sbmonth % 12;
  var sday=Math.floor(nDays) % 10;
  var bday=(Math.floor(nDays)+2) % 12;
  if(nDays < LUNAR_EPOCH){return false;}
  return new Array(lyear,lmonth,lday,leap,nDays,syear,byear,smonth,bmonth,sday,bday);
 },


// 음력을 양력으로 변환
 lunar2solar : function(year,month,day,leap){
   var lyear=((year >= YEAR_MIN) && (year <= YEAR_MAX)) ? year : 0;
   if(lyear == 0){return false;}
   var y=lyear-1583;
   var m=month-1;
   var mm;
   var y2;
   var yleap=0;
   if(lunarMonthTab[y][m] > 2){
    if(leap == 1){
     yleap=1;
     switch(lunarMonthTab[y][m]){
      case 3:
      case 5:
      mm=29;
      break;
      case 4:
      case 6:
      mm=30;
      break;
     }
    }else{
      switch(lunarMonthTab[y][m]){
      case 1:
      case 3:
      case 4:
       mm=29;
      case 2:
      case 5:
      case 6:
       mm=30;
      }
    }
   }
   lday=day;
   var absoluteDay=0;
   for(i=0;i<y;i++){
    for(j=0;j<12;j++){
    switch(lunarMonthTab[i][j]){
 	 case 1: absoluteDay+=29;
 	 break;
 	 case 2: absoluteDay+=30;
 	 break;
 	 case 3: absoluteDay+=58; // 29+29
 	 break;
 	 case 4: absoluteDay+=59; // 29+30
 	 break;
 	 case 5: absoluteDay+=59; // 30+29
 	 break;
 	 case 6: absoluteDay+=60; // 30+30
 	 break;
 	  }
    }   
   }
   for(j=0;j<m;j++){
    switch(lunarMonthTab[y][j]){
    case 1: absoluteDay+=29;
    break;
    case 2: absoluteDay+=30;
    break;
    case 3: absoluteDay+=58; // 29+29
    break;
    case 4: absoluteDay+=59; // 29+30
    break;
    case 5: absoluteDay+=59; // 30+29
    break;
    case 6: absoluteDay+=60; // 30+30
    break;
    }
   }

  if(yleap == 1){
   switch(lunarMonthTab[y][m]){
    case 3:
    case 4:
    absoluteDay+=29;
    break;
    case 5:
    case 6:
     absoluteDay+=30;
    break;
   }
  }
   absoluteDay+=lday+23;
   y=1582;
   do{
    y++;
    if(easterCalc.isLeap(y,1)){y2=366;}
    else{y2=365;}
    if(absoluteDay <= y2){break;}
    else{absoluteDay+=-y2;}
   }while(true);
   gyear=y;
   daysPerMonth[1]=y2-337;
   m=0;
   do{
    m++;
    if(absoluteDay <= daysPerMonth[m-1]){break;}
    else{absoluteDay+=-daysPerMonth[m-1];}
   }while(true);
   var gmonth=m;
   var gday=absoluteDay;
   y=gyear-1;
   var nDays=easterCalc.solar2JD(gyear,gmonth,gday); // 양력 날짜에 해당하는 율리우스 적일
   var syear=(year+6) % 10;
   var byear=(year-4) % 12;
   var sbmonth=((year * 12)+month+13) % 60;
   var smonth=sbmonth % 10;
   var bmonth=sbmonth % 12;
   var sday=Math.floor(nDays) % 10;
   var bday=(Math.floor(nDays)+2) % 12;
 
   if(nDays < LUNAR_EPOCH){return false;}
    
  return new Array(gyear,gmonth,gday,yleap,nDays,syear,byear,smonth,bmonth,sday,bday);
 },
 easterLunar : function(){
  var year = new Number(document.getElementById("cal_year").value);
  var edate = easterCalc.calcEaster(year);
  var edateLunar = this.solar2lunar(year,edate[0],edate[1]);
  if(year >= yearEarliestGregorian && year <= yearLatestLunar){document.getElementById("lunar_easter").innerHTML = edateLunar[1]+"월 "+edateLunar[2]+"일 ("+((edateLunar[3] == 0) ? "평달" : "윤달")+")";}
  else{document.getElementById("lunar_easter").innerHTML = "--";}
 },
 feastsLunar : function(){
  var year = new Number(document.getElementById("cal_year").value);
  var newyearLunar = this.lunar2solar(year,1,1,0);
  var thanksgivingLunar =  this.lunar2solar(year,8,15,0);
  var weekday_newyearLunar = weekdayStr[easterCalc.getWeekday(newyearLunar[4])];
  var weekday_thanksgivingLunar = weekdayStr[easterCalc.getWeekday(thanksgivingLunar[4])];

  if(year >= yearEarliestGregorian && year <= yearLatestLunar){
   document.getElementById("lunar_newyear").innerHTML = newyearLunar[1]+"월 "+newyearLunar[2]+"일";
   document.getElementById("lunar_thanksgiving").innerHTML = thanksgivingLunar[1]+"월 "+thanksgivingLunar[2]+"일";
   document.getElementById("weekday_lunarnewyear").innerHTML = weekday_newyearLunar;
   document.getElementById("weekday_lunarthanksgiving").innerHTML = weekday_thanksgivingLunar;
  }else{
   document.getElementById("lunar_newyear").innerHTML = "--";
   document.getElementById("lunar_thanksgiving").innerHTML = "--";
   document.getElementById("weekday_lunarnewyear").innerHTML = "--";
   document.getElementById("weekday_lunarthanksgiving").innerHTML = "--";
  }
 }
};


function initPage(){
 var dt = new Date();
 var yr = dt.getFullYear();
 document.getElementById("cal_year").value = yr;
 easterCalc.calcFeasts();
}

