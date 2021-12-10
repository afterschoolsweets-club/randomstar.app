/**************************************************
* covered version of function library for positional astronomy v0.1b
* based on astro.js by John Walker (fourmilab.ch)
* because the original file is in public domain, notices for copyright are not available in this file.
* revised by Senarin <themunyang21 at naver dot com> from February 2011 to November 2015
**************************************************/
var J2000=2451545; // 2000년 1월 1일에 해당하는 율리우스 적일
var J1970=2440587.5; // 1970년 1월 1일에 해당하는 율리우스 적일
var J1900=2415020; // 1899년 12월 31일 정오에 해당하는 율리우스 적일
var J1582=2299159.5; // 그레고리력 시행에 해당하는 율리우스 적일
var J1601=2305812.5; // 1601년 1월 1일에 해당하는 율리우스 적일
var J1904=2416480.5; // 1904년 1월 1일에 해당하는 율리우스 적일
var TROPICAL_YEAR=365.24219878; // 1899년 12월 31일 기준 태양년의 길이 (일 단위)
var SIDEREAL_YEAR=365.25636301; // 2000년 1월 1일 기준 항성년의 길이 (일 단위)
var ANOMALISTIC_YEAR=365.25963575; // 근점년의 길이 (일 단위)
var JULIAN_CENTURY=36525; //율리우스 세기의 길이
var JULIAN_MILLENNIUM=JULIAN_CENTURY * 10; // 율리우스 천년기(millennium)의 길이 (일)
var ASTRO_UNIT=149597870.7; // 천문 단위 (km 단위)
var geoRad=6378.14; // 지구의 반지름 (km)
var lunarRad=1738.50; // 달의 반지름 (km)
var sunRad=696000; // 태양의 반지름 (km)
var gravityConst=6.67384e-11; // 만유인력 상수 (단위: m^2/kg^2)
var massSun=1.9891e30; // 태양의 질량 (kg)
var massEarth=5.9736e24; // 지구의 질량 (kg)
var siderealDayRatio=0.99726968; // 태양일(Solar Day)에 대한 항성일(Sidereal Day)의 비율
var machSpeed=340.39; // 마하 1; 섭씨 15도에서의 음속(音速)

var brightnessRatio=Math.pow(10,0.4); // 1등급과 2등급의 밝기 차이 = 대략 2.51
var baseBrightness=2.54e-6; // 0등성의 밝기 (lux)
var sunBrightness=baseBrightness * Math.pow(brightnessRatio,26.74); // 1AU 거리에서의 태양의 밝기 (lux)




/********** Common functions **********/

// 정수가 아닌 실수에 대해 나머지를 구하는 함수
function dmod(x,y){return x-(y * Math.floor(x / y));}

// 음의 정수에 대해 옳은 나머지를 구하는 함수
function gmod(x,y){return ((x % y)+y) % y;}

//Modulus function which returns numerator if modulus is zero.
function amod(x,y){return dmod(x-1,y)+1;}

// 도 단위를 라디안(호도) 단위로 변환
function deg2rad(d){return d * (Math.PI / 180);}

// 위와 반대
function rad2deg(r){return r * (180 / Math.PI);}

// 도단위 각에 대한 사인함수
function dsin(d){return Math.sin(deg2rad(d));}

// 도단위 각에 대한 코사인함수
function dcos(d){return Math.cos(deg2rad(d));}

// 도단위 각에 대한 탄젠트함수
function dtan(d){return Math.tan(deg2rad(d));}

// Reduce an range of angle (in degrees)
function fixangle(a){return dmod(a,360);}

// Reduce an range of angle (in radians)
function fixangr(a){return dmod(a,Math.PI * 2);}


// 어떤 수의 부호를 판별하는 함수
function sgn(x){
 if(x > 0){return 1;}
 else if(x < 0){return -1;}
 else{return 0;}
}



// 어떤 수를 소수점 아래 특정 자리까지 구함
function roundTo(num,dights){return Math.round(num * Math.pow(10,dights)) / Math.pow(10,dights);}

// 어떤 수에 대한 상용로그
function log10(x){return Math.log(x) / Math.LN10;}

// 어떤 수의 제곱
function square(x){return Math.pow(x,2);}

// 도 단위 수를 도,분,초로 변환
function dms(degrees){
 var sDegrees=Math.abs(degrees);
 var deg=Math.floor(sDegrees);
 var mins=(sDegrees-deg) * 60;
 var min=Math.floor(mins);
 var secs=(mins-min) * 60;
 var sec=roundTo(secs,3);
 if(sec == 60){
  min++;
  sec=0;
  if(min == 60){
   deg++;
   min=0;
  }
 }
 deg=(degrees < 0) ? -deg : deg;
 if(degrees > -1 && degrees < 0){deg="-"+deg;}
 sec=fracpadzero(sec,3);
 return new Array(deg,min,sec);
}

function latLong(latitude0,longitude0){
 var sLat=Math.abs(latitude0);
 var sLong=Math.abs(longitude0);
 
 var latitudeDeg=Math.floor(sLat);
 var latitudeMins=(sLat-latitudeDeg) * 60;
 var latitudeMin=Math.floor(latitudeMins);
 var latitudeSecs=(latitudeMins-latitudeMin) * 60;
 var latitudeSec=Math.floor(latitudeSecs * 10) / 10;
 var latitudeSide=(latitude0 >= 0) ? "N" : "S";

 var longitudeDeg=Math.floor(sLong);
 var longitudeMins=(sLong-longitudeDeg) * 60;
 var longitudeMin=Math.floor(longitudeMins);
 var longitudeSecs=(longitudeMins-longitudeMin) * 60;
 var longitudeSec=Math.floor(longitudeSecs * 10) / 10;
 var longitudeSide=(longitude0 >= 0) ? "E" : "W";
 
 return new Array(
 new Array(latitudeSide,latitudeDeg,latitudeMin,latitudeSec),
 new Array(longitudeSide,longitudeDeg,longitudeMin,longitudeSec)
 );
}

// 도 단위를 시,분,초로 변환
function fracpadzero(num,setdights){
 var i=0;
 var numfrag=num.toString().split(".");
 if(numfrag.length == 1){
  numfrag+=".";
  for(i=1;i<=setdights;i++){numfrag+="0";}
  return numfrag;
 }
 var fracdights=numfrag[1].toString().length;
 if(fracdights < setdights){
  for(i=0;i<setdights-fracdights;i++){numfrag[1]+="0";}
 }
 var res=numfrag.join(".");
 return res;
}

function deg2hms(degrees){
 var hours=Math.abs(degrees / 15);
 var hour=Math.floor(hours);
 var mins=(hours-hour) * 60;
 var min=Math.floor(mins);
 var secs=(mins-min) * 60;
 var sec=roundTo(secs,3);
 if(sec == 60){
  min++;
  sec=0;
  if(min == 60){
   hour++;
   min=0;
  }
 }
 sec=fracpadzero(sec,3);
 var direction=(degrees >= 0) ? "+" : "-";
 return new Array(hour,min,sec,direction);
}

function deg2hmsrounded(degrees){
 var hours=Math.abs(degrees / 15);
 var hour=Math.floor(hours);
 var mins=(hours-hour) * 60;
 var min=Math.floor(mins);
 var secs=(mins-min) * 60;
 var sec=Math.floor(secs);
 var direction=(degrees >= 0) ? "+" : "-";
 return new Array(hour,min,sec,direction);
}

function hms(hours){
 var h=Math.floor(hours);
 var m=((hours-h) * 60);
 var s=((hours-h) * 3600) % 60;
 h=(h < 10) ? "0"+h : h;
 m=(m < 10) ? "0"+m : m;
 s=(s < 10) ? "0"+s : s;
 return (h+":"+m+":"+s);
}

function degrees2direction(degs){

 degs = fixangle(degs);
 
 if(degs < 5 || degs >= 355){return "N";}
 else if(degs >= 5 && degs < 40){return "N-NE";}
 else if(degs >= 40 && degs < 50){return "NE";}
 else if(degs >= 50 && degs < 85){return "NE-E";}
 else if(degs >= 85 && degs < 95){return "E";}
 else if(degs >= 95 && degs < 130){return "E-SE";}
 else if(degs >= 130 && degs < 140){return "SE";}
 else if(degs >= 140 && degs < 175){return "S-SE";}
 else if(degs >= 175 && degs < 185){return "S";}
 else if(degs >= 185 && degs < 220){return "S-SW";}
 else if(degs >= 220 && degs < 230){return "SW";}
 else if(degs >= 230 && degs < 265){return "W-SW";}
 else if(degs >= 265 && degs < 275){return "W";}
 else if(degs >= 275 && degs < 310){return "W-NW";}
 else if(degs >= 310 && degs < 320){return "NW";}
 else if(degs >= 320 && degs < 355){return "N-NW";}
 else{return "-";}
}

// 입력된 양력년도가 윤년(366일 -- 2월 29일이 있는 해)인지 검사
function leap_solar(year){return ((((year % 100) % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0))));}

// 양력 날짜를 율리우스 적일로 변환
function solar2JD(year,month,day){
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
}

// 율리우스 적일을 양력 날짜로 변환
function JD2solar(jd){
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
}

// 양력 날짜를 수정 율리우스 적일(Modified Julian Day, MJD)로 변환
function solar2MJD(year,month,day){
 var JD=solar2JD(year,month,day);
 return JD-2400000.5;
}

// 수정 율리우스 적일(Modified Julian Day, MJD)을 양력 날짜로 변환
function MJD2solar(numdays){
 var JD=numdays+2400000.5;
 return JD2solar(JD);
}

// 년,월,일로부터 연중 일수 계산
function yeardays(year,month,day){
 var leapadj=leap_solar(year) ? 1 : 2;
 return Math.floor((275 * month) / 9)-(leapadj * Math.floor((month+9) / 12))+day-30;
}

// 율리우스 적일로부터 연중 일수 계산
function yeardaysfromJD(JD){
 var adate=JD2solar(JD);
 return yeardays(adate[0],adate[1],adate[2]);
}

// 율리우스 적일로 요일을 구함
function jwday(jd){return dmod(Math.floor(jd+1.5),7);}


var weekdayFS = {
 weekdayBefore : function(weekday,JD){return JD-jwday(JD-weekday);},
 searchWeekday : function(weekday,JD,d,o){return this.weekdayBefore(weekday,JD+(d * o));},
 prevWeekday : function(weekday,JD){return this.searchWeekday(weekday,JD,-1,1);},
 nextWeekday : function(weekday,JD){return this.searchWeekday(weekday,JD,1,7);},
 numOfWeeks : function(weekday,JD,nthweek){
  var k = (nthweek * 7);
  if(nthweek > 0){k += this.prevWeekday(weekday,JD);}
  else{k += this.nextWeekday(weekday,JD);}
  return k;
 }
};



function weekdays2JD(year,week,day){
 return day+(weekdayFS.numOfWeeks(0,solar2JD(year-1,12,28),week));
}

function annualweekdaysfromJD(JD){
 var year = JD2solar(JD-3)[0];
 
 if(JD >= weekdays2JD(year+1,1,1)){year++;}
 var week = Math.floor((JD-weekdays2JD(year,1,1)) / 7)+1;
 var day0 = jwday(JD);
 var day = (day0 == 0) ? 7 : day0;
 
 return new Array(week,day);
}


function jhms(jd){
 jd+=0.5;
 var k=((jd-Math.floor(jd)) * 86400)+0.5;
 
 return new Array(dmod(Math.floor(k / 3600),24),Math.floor((k / 60) % 60),Math.floor(k % 60));
}

function jhmsrounded(daynum,sdights){
 daynum+=0.5;
 var k=((daynum-Math.floor(daynum)) * 86400)+0.5;
 var hrs=Math.floor(k / 3600);
 var mins=Math.floor(dmod((k / 60),60));
 var secs=roundTo(dmod(k,60),sdights);
 var secsdisp=fracpadzero(secs,sdights);
 return new Array(hrs,mins,secsdisp);
}


function getUnixTime(jd){return ((jd-J1970) * 86400);}



// deltaT - 특정 날짜의 지구시(Dynamical Time)와 세계시(Universal Time)의 차를 구한다
// 미 항공우주국 일.월식 홈페이지(영어)에 있는 자료를 참고해 작성함. ( http://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html )
function dyear(year,month){return year+((month-0.5) / 12);}

function deltaT(JD){
 var year0=JD2solar(JD)[0];
 var month0=JD2solar(JD)[1];
 var decyear=dyear(year0,month0);
 var dt=0;
 
 if(year0 <= -500 || year0 > 2150){
  var u=(year0-1820) / 100;
  dt=-20+(32 * square(u));
 }else if(year0 <= 500){
  var u=decyear / 100;
  dt=10583.6+(-1014.41 * u)+(33.78311 * square(u))+(-5.952053 * Math.pow(u,3));
  dt+=(-0.1798452 * Math.pow(u,4))+(0.022174192 * Math.pow(u,5))+(0.0090316521 * Math.pow(u,6));
 }else if(year0 <= 1600){
  var u=(decyear-1000) / 100;
  dt=1574.2+(-556.01 * u)+(71.23472 * square(u))+(0.319781 * Math.pow(u,3));
  dt+=(-0.8503463 * Math.pow(u,4))+(-0.005050998 * Math.pow(u,5))+(0.0083572073 * Math.pow(u,6));
 }else if(year0 <= 1700){
  var t=decyear-1600;
  dt=120+(-0.9808 * t)+(-0.01532 * square(t))+(Math.pow(t,3) / 7129);
 }else if(year0 <= 1800){
  var t=decyear-1700;
  dt=8.83+(0.1603 * t)+(-0.0059285 * square(t))+(0.00013336 * Math.pow(t,3));
  dt+=Math.pow(t,4) / 1174000;
 }else if(year0 <= 1860){
  var t=decyear-1800;
  dt=13.72+(-0.332447 * t)+(0.0068612 * square(t))+(0.0041116 * Math.pow(t,3));
  dt+=(-0.00037436 * Math.pow(t,4))+(0.0000121272 * Math.pow(t,5))+(-0.0000001699 * Math.pow(t,6));
  dt+=0.000000000875 * Math.pow(t,7);
 }else if(year0 <= 1900){
  var t=decyear-1860;
  dt=7.62+(0.5737 * t)+(-0.251754 * square(t))+(0.01680668 * Math.pow(t,3));
  dt+=(-0.0004473624 * Math.pow(t,4))+(Math.pow(t,5) / 233174);
 }else if(year0 <= 1920){
  var t=decyear-1900;
  dt=-2.79+(1.494119 * t)+(-0.0598939 * square(t))+(0.0061966 * Math.pow(t,3));
  dt+=-0.000197 * Math.pow(t,4);
 }else if(year0 <= 1941){
  var t=decyear-1920;
  dt=21.20+(0.84493 * t)+(-0.0761 * square(t))+(0.0020936 * Math.pow(t,3));
 }else if(year0 <= 1961){
  var t=decyear-1950;
  dt=29.07+(0.407 * t)+(-square(t) / 233)+(Math.pow(t,3) / 2547);
 }else if(year0 <= 1986){
  var t=decyear-1975;
  dt=45.45+(1.067 * t)+(-square(t) / 260)+(-Math.pow(t,3) / 718);
 }else if(year0 <= 2005){
  var t=decyear-2000;
  dt=63.86+(0.3345 * t)+(-0.060374 * square(t))+(0.0017275 * Math.pow(t,3));
  dt+=(0.000651814 * Math.pow(t,4))+(0.00002373599 * Math.pow(t,5));
 }else if(year0 <= 2050){
  var t=decyear-2000;
  dt=62.92+(0.32217 * t)+(0.005589 * square(t));
 }else{dt=-20+(32 * square((decyear-1820) / 100))+(-0.5628 * (2150-decyear));}

 if(year0 < 1955 || year0 > 2005){dt+=-0.000012932 * square(decyear-1955);}
 return dt; 
}

/* 장동(章動, nutation) 계산 함수 */



function calNutation(JD){
 var t0=(JD-J1900) / JULIAN_CENTURY;
 var t2=square(t0);

 var NP={
 L0 : fixangle(279.6967+(36000.76889 * t0)+(0.000303 * t2)),
 D1 : fixangle(270.4342+(481267.88316 * t0)+(-0.001133 * t2)),
 M0 : fixangle(358.4758+(35999.049802 * t0)+(-0.00015 * t2)),
 M1 : fixangle(296.1046+(477198.84924 * t0)+(0.009192 * t2)),
 N1 : fixangle(259.1833+(-1934.1420001 * t0)+(0.002078 * t2))
 };
 
 var dPsi=(-17.2327+(-0.01737 * t0)) * dsin(NP.N1);
 dPsi+=((-1.2729+(-0.00013 * t0)) * dsin(2 * NP.L0))+(0.2088 * dsin(2 * NP.N1));
 dPsi+=(-0.2037 * dsin(2 * NP.D1))+((0.1261+(-0.00031 * t0)) * dsin(NP.M0));
 dPsi+=(0.0675 * dsin(NP.M1))+((-0.0497+(-0.00012 * t0)) * dsin((2 * NP.L0)+NP.M0));
 dPsi+=(-0.0342 * dsin((2 * NP.D1)-NP.N1))+(-0.0261 * dsin((2 * NP.D1)+NP.M1));
 dPsi+=(0.0214 * dsin((2 * NP.L0)-NP.M0))+(-0.0149 * dsin((2 * NP.L0)-(2 * NP.D1)+(2 * NP.M1)));
 dPsi+=(0.0124 * dsin((2 * NP.L0)-NP.N1))+(0.0114 * dsin((2 * NP.D1)-NP.M1));
 
 var dEpsilon=(9.21+(0.00091 * t0)) * dcos(NP.N1);
 dEpsilon+=((0.5522+(-0.00022 * t0)) * dcos(2 * NP.L0))+(-0.0904 * dcos(2 * NP.N1));
 dEpsilon+=(0.0884 * dcos(2 * NP.D1))+(0.0216 * dcos((2 * NP.L0)+NP.M0));
 dEpsilon+=(0.0183 * dcos((2 * NP.D1)-NP.N1))+(0.0113 * dcos((2 * NP.D1)+NP.M1));
 dEpsilon+=(-0.0093 * dcos((2 * NP.L0)-NP.M0))+(-0.0066 * dcos((2 * NP.L0)-NP.N1));
 
 var deltaPsi=dPsi / 3600;
 var deltaEpsilon=dEpsilon / 3600;
 
 return new Array(deltaPsi,deltaEpsilon);
}


/********** Solar position functions **********/



// Get information on position of Sun in selected a julian date.
function solarPos(td){
 var T=(td-J2000) / JULIAN_CENTURY;
 var T2=Math.pow(T,2);
 var T3=Math.pow(T,3);

 var TM=(td-J2000) / (JULIAN_CENTURY * 100);
 var TM2=Math.pow(TM,2);
 var TM3=Math.pow(TM,3);
 var TM5=Math.pow(TM,5);
 var TM7=Math.pow(TM,7);

 var L0=280.46646+(36000.76983 * T)+(0.0003032 * T2);
 L0=fixangle(L0);
 var M=357.52911+(35999.05029 * T)+(-0.0001537 * T2);
 M=fixangle(M);
 var e=0.016708634+(-0.000042037 * T)+(-0.0000001267 * T2);
 var C=((1.914602+(-0.004817 * T)+(-0.000014 * T2)) * dsin(M));
 C+=((0.019993-(0.000101 * T)) * dsin(2 * M));
 C+=(0.000289 * dsin(3 * M));
 var solarLong=L0+C;
 solarLong=fixangle(solarLong);
 var solarAnomaly=M+C;
 solarAnomaly=fixangle(solarAnomaly);
 var solarArgPeriapsis=solarLong-solarAnomaly;
 solarArgPeriapsis=fixangle(solarArgPeriapsis);
 
 var eccAnomaly=rad2deg(Math.atan2(Math.sqrt(1-Math.pow(e,2)) * dsin(solarAnomaly),e+dcos(solarAnomaly)));
 eccAnomaly=fixangle(eccAnomaly);
 
 var sunR=(1.000001018 * (1-Math.pow(e,2))) / (1+(e * dcos(solarAnomaly)));
 var Omega=125.04452-(1934.136 * T);
 var Lambda=solarLong+(-0.00569)+(-0.00478 * dsin(Omega));
 Lambda=fixangle(Lambda);
 var esecs=21.448+(-4680.93 * TM)+(-1.55 * TM2)+(1999.25 * TM3);
 esecs+=(-51.38 * Math.pow(TM2,2))+(-249.67 * TM5)+(-39.05 * Math.pow(TM3,2))+(7.12 * TM7);
 esecs+=(27.87 * Math.pow(TM2,4))+(5.79 * Math.pow(TM3,3))+(2.45 * Math.pow(TM2,5));
 var epsilon0=23+((26+(esecs / 60)) / 60);
 var epsilon=epsilon0+(0.00256 * dcos(Omega));
 var Alpha=rad2deg(Math.atan2(dcos(epsilon0) * dsin(solarLong),dcos(solarLong)));
 Alpha=fixangle(Alpha);
 var Delta=rad2deg(Math.asin(dsin(epsilon0) * dsin(solarLong)));
 var AlphaApp=rad2deg(Math.atan2(dcos(epsilon) * dsin(Lambda),dcos(Lambda)));
 AlphaApp=fixangle(AlphaApp);
 var DeltaApp=rad2deg(Math.asin(dsin(epsilon) * dsin(Lambda)));
 return new Array(
 L0,             // [0] Geometric mean longitude of the Sun / 태양의 지심(地心) 평균황경
 M,              // [1] Mean anomaly of the Sun / 태양의 평균 근점이각
 e,              // [2] Eccentricity of the Earth's orbit / 지구 공전궤도의 이심률
 C,              // [3] Sun's equation of the Centre / 태양의 중심차(中心差)
 solarLong,       // [4] Sun's true longitude / 태양의 진(眞)  황경
 solarAnomaly,    // [5] Sun's true anomaly / 태양의 진(眞) 근점이각
 sunR,          // [6] Sun's radius vector in AU / 태양의 동경(動經) 벡터
 Lambda,        // [7] Sun's apparent longitude at true equinox of the date / 태양의 겉보기 황경
 epsilon0,        // [8] Mean obliquity of ecliptic / 평균 황도경사각
 epsilon,         // [9] Apparent obliquity of ecliptic / 겉보기 황도경사각
 Alpha,          // [10] Sun's true right ascension / 태양의 진 적경(赤經)
 Delta,          // [11] Sun's true declination / 태양의 진 적위(赤緯)
 AlphaApp,       // [12] Sun's apparent right ascension / 태양의 겉보기 적경
 DeltaApp,        // [13] Sun's apparent declination  / 태양의 겉보기 적위
 solarArgPeriapsis, // [14] Argument of Periapsis / 근점의 경도
 eccAnomaly      // [15] Eccentric anomaly / 이심 근점이각
 );
}

// 균시차 구하기
function equationOfTime(jd){
 var L0=solarPos(jd)[0];
 var M=solarPos(jd)[1];
 var e=solarPos(jd)[2];
 var epsilon=solarPos(jd)[9];
 var y=dtan(epsilon / 2);
 
 var eqTime0=(Math.pow(y,2) * dsin(2 * L0))-
 (2 * e * dsin(M))+
 (4 * e * Math.pow(y,2) * dsin(M) * dcos(2 * L0))-
 (0.5 * Math.pow(y,4) * dsin(4 * L0))-
 (1.25 * Math.pow(e,2) * dsin(2 * M));
 var eqTime=rad2deg(eqTime0);
 eqTime=eqTime / 360;
 return eqTime;
}

// 지방 평균항성시 (Local mean Sidereal Time)
// 입력값: JD: 해당 날짜의 율리우스 적일, longitude: 해당 지역의 경도 (도 단위로서 부호는 동경은 양, 서경은 음)
// 반환값 단위: 시간 (hours)
function lmst(JD,longitude){
 var td=JD-J2000;
 var tau=td / 36525;
 var lst=fixangle(280.46061837+(360.98564736629 * td)+(0.000387933 * Math.pow(tau,2))-(Math.pow(tau,3) / 38710000));
 return (lst+longitude) / 15;
}

// 그리니치 평균항성시 (Greenwich mean Sidereal Time)
function gmst(JD){return lmst(JD,0);}

// 그리니치 시항성시 (Greenwich apparent Sidereal Time)
function greenwich_ast(JD){
 var dPsi=calNutation(JD)[0]; // 장동(章動)으로 인한 황경의 변화량
 var dEpsilon=calNutation(JD)[1]; // 장동(章動)으로 인한 황도경사각의 변화량
 var epsilon=solarPos(JD)[8]+dEpsilon; // 진 황도경사각
 return gmst(JD)+((dPsi * dcos(epsilon)) / 15);
}

// 지방 시항성시 (Local apparent Sidereal Time)
function local_ast(JD,longitude){return greenwich_ast(JD)+(longitude / 15);}

/********** Lunar position functions **********/

function lunarPos(JD){
 var T=(JD-J2000) / JULIAN_CENTURY;
 var T2=Math.pow(T,2);
 var T3=Math.pow(T,3);
 
 var Ms=solarPos(JD)[1]; // 태양의 평균 근점이각
 var eps=solarPos(JD)[8]; // 지구의 평균 황도경사각
 
 var L0=218.31617+(481267.88088 * T)+(-0.00112778 * T2);
 L0=fixangle(L0);
 var M=134.96292+(477198.86753 * T)+(0.00923611 * T2);
 M=fixangle(M);
 var F=93.27283+(483202.01873 * T)+(-0.00321111 * T2);
 F=fixangle(F);
 var D=297.85027+(445267.11135 * T)+(-0.00143055 * T2);
 D=fixangle(D);
 
 var eLuna=0.054900489;
 
 var C0=(22640 * dsin(M))+(769 * dsin(M * 2));
 C0+=-4586 * dsin(M-(D * 2)); // 출차 (出差, evection)
 C0+=2370 * dsin(D * 2); // variation
 C0+=-668 * dsin(Ms); // Annual inequality
 C0+=-412 * dsin(F * 2); // reduction to the ecliptic
 /* 월각차 (月角差, parllactic inequality) */
 C0+=-125 * dsin(D);
 C0+=-212 * dsin((M * 2)-(D * 2));
 C0+=-206 * dsin(M+Ms-(D * 2));
 C0+=192 * dsin(M+(D * 2));
 C0+=-165 * dsin(Ms-(D * 2));
 C0+=-110 * dsin(M+Ms);
 C0+=148 * dsin(M-Ms);
 C0+=-55 * dsin((F * 2)-(D * 2));
 
 var C=C0 / 3600; // 위의 계산식이 초각(arcseconds) 단위이므로 도 단위로 변환
 
 var lunarLong=L0+C;
 lunarLong=fixangle(lunarLong);
 var lunarAnomaly=M+C;
 lunarAnomaly=fixangle(lunarAnomaly);

 /* 적위, 적경 계산하는 부분 */
 var S=F+((C0+(dsin(F * 2) * 412)+(dsin(Ms) * 541)) / 3600);
 var H=F-(D * 2);
 var N=-526 * dsin(H);
 N+=44 * dsin(M+H);
 N+=-31 * dsin(H-M);
 N+=-23 * dsin(Ms+H);
 N+=11 * dsin(H-Ms);
 N+=-25 * dsin(F-(M * 2));
 N+=21 * dsin(F-M);
 
 var lunarLat=((18520 * dsin(S))+N) / 3600;
 var A=dcos(lunarLat) * dcos(lunarLong);
 var B=dcos(lunarLat) * dsin(lunarLong);
 var sinBeta=dsin(lunarLat);
 
 var P=(dcos(eps) * B)-(dsin(eps) * sinBeta);
 var Q=(dsin(eps) * B)+(dcos(eps) * sinBeta);
 
 var R=Math.sqrt(1-Math.pow(Q,2));
 
 var lunarDelta=rad2deg(Math.atan2(Q,R));
 var lunarAlpha=rad2deg(Math.atan2(P,A+R)) * 2;
 
 lunarAlpha=(lunarAlpha < 0) ? (lunarAlpha+360) : lunarAlpha;

 var lunarR=(0.002569549 * (1-Math.pow(eLuna,2))) / (1+(eLuna * dcos(lunarAnomaly)));
 
 return new Array(
 L0,            // [0] Mean longitude of the Moon / 달의 평균 황경
 M,             // [1] Mean anomaly of the Moon / 달의 평균 근점이각
 Ms,            // [2] Mean anomaly of the Sun / 태양의 평균 근점이각
 F,             // [3] the Mean distance of the Moon from the ascending node / 승교점(昇交點)으로부터의 달의 거리
 D,             // [4] the difference between the mean longitudes of the Sun and the Moon / 달과 태양의 천구상 평균 경도의 차이
 C,             // [5] the inequality of longitude of the Moon / 달의 황경의 변동 정도
 lunarDelta,      // [6] declination of the Moon / 달의 적위
 lunarAlpha,      // [7] right ascension of the Moon / 달의 적경
 lunarLat,        // [8] ecliptic latitude of the Moon / 달의 황위(黃緯)
 lunarLong,       // [9] true longitude of the Moon / 달의 진(眞) 황경
 lunarAnomaly,    // [10] true anomaly of the Moon / 달의 진 근점이각
 eLuna,          // [11] Eccentricity of the Moon's orbit / 달 공전궤도의 이심률
 lunarR          // [12] Moon's distance in AU / 지구와 달 사이의 거리
 );
}




/* UNUSED FUNCTIONS */

/*

var deltaTtab=new Array(
    121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46,
    44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12,
    11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10,
    10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
    13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16,
    16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12,
    11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6,
    5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7,
    1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6,
    -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16,
    18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7,
    24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2,
    33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5,
    52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6
    );

function deltaT_old(year){
 var dt;
 var y, f, i, t;
 if((year >= 1620) && (year <= 2000)){
  y=(year-1620) / 2;
  i=Math.floor(y);
  f=y-i;
  dt=deltaTtab[i]+((deltaTtab[i+1]-deltaTtab[i]) * f);
 }else{
  t=(year-2000) / 100;
  t2=Math.pow(t,2);
  if(year < 948){dt=2177+(497 * t)+(44.1 * t2);}
  else{
   dt=102+(102 * t)+(25.3 * t2);
   if((year > 2000) && (year < 2100)){dt+=0.37 * (year-2100);}
  }
 }
 return dt;
}

function calNutation_old(JD){
 var t0=(JD-J2000) / JULIAN_CENTURY;
 var t2=Math.pow(t0,2);
 var t3=Math.pow(t0,3);
 
 var nargs=new Array(
 fixangle(280.46646+(36000.76983 * t0)+(0.0003032 * t2)), // [0] 태양의 평균 황경
 fixangle(357.52911+(35999.05029 * t0)+(-0.0001537 * t2)), // [1] 태양의 평균 근점이각
 fixangle(218.31617+(481267.88088 * t0)+(-0.00112778 * t2)), // [2] 달의 평균 황경
 fixangle(125.04452+(-1934.136261 * t0)+(0.0020844 * t2)) // [3]
 );
 
 var dPsi=-17.200 * dsin(nargs[3]);
 dPsi+=-1.319 * dsin(2 * nargs[0]);
 dPsi+=-0.227 * dsin(2 * nargs[2]);
 dPsi+=0.206 * dsin(nargs[1]);
 
 var dEpsilon=9.203 * dcos(nargs[3]);
 dEpsilon+=0.574 * dcos(2 * nargs[0]);
 dEpsilon+=0.098 * dcos(2 * nargs[2]);
 dEpsilon+=-0.090 * dcos(2 * nargs[3]);
 
 var deltaPsi=dPsi / 3600; // 장동으로 인한 황경의 변화량
 var deltaEpsilon=dEpsilon / 3600; // 장동으로 인한 황도경사각의 변화량
 return new Array(deltaPsi,deltaEpsilon);
}

*/