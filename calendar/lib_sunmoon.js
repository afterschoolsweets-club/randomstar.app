/* Requires lib_posastro.js */
var PHASE_EPOCH=2454000.98958;
var ALT_PHASE_EPOCH=2415020.75933;
var SYNODIC_MONTH=29.530588853; // 삭망월의 길이 (일 단위)
var ANOMALISTIC_MONTH=27.55454989; // 근점월의 길이 (일 단위)
var ASTRO_EPOCH=2415020;

// 숫자 앞에 "0"을 덧붙임
function onedights(num){
 if(Math.abs(num) < 10){return "0"+Math.abs(num);}
 return num;
}

function getSunriseSunset(year,month,day,latitude,longitude,zen,tz,is_noonsec){
 var H=new Array();
 var T=new Array();
 var UT=new Array();
 var LT=new Array();
 var SR=new Array();
 var SS=new Array();
/***********
 * [0] 실제 일출몰
 * [1] 시민 박명, [2] 항해 박명, [3] 천문 박명
***********/
 var zeniths=[90.8333333,96.0,102.0,108.0];
 var timezone=tz;

 var zenith=zeniths[zen];

 var solarJD=solar2JD(year,month,day);

 var eqTime0=equationOfTime(solarJD);
 var eqTime=eqTime0 * 1440;

 var sunDec=solarPos(solarJD)[11];

 var sinSunDec=dsin(sunDec);
 var cosSunDec=dcos(sunDec);

 var cosH=(dcos(zenith)-(sinSunDec * dsin(latitude))) /  (cosSunDec * dcos(latitude));
 var sunAL=90-((latitude > 0) ? (latitude-sunDec) : (sunDec-latitude));
 sunAL=(sunAL > 90) ? (180-sunAL) : sunAL;
 
 if(Math.abs(cosH) > 1){
 return new Array(
 "--:--","--시 --분",
 "--:--","--시 --분",
 "--:--:--","--시 --분 --초",
 ((sgn(cosH) == -1) ? "일몰 없음 (24시간)" : "일출 없음 (0시간)"),
 ((sgn(cosH) == -1) ? sunAL : -180)
 );
 }
 
 
 H["r"]=rad2deg(Math.acos(cosH));
 H["s"]=-rad2deg(Math.acos(cosH));

 T["r"]=longitude+H["r"];
 T["s"]=longitude+H["s"];


 UT["r"]=(720-(T["r"] * 4)-eqTime) / 60;
 UT["s"]=(720-(T["s"] * 4)-eqTime) / 60;
 

 UT["r"]=(UT["r"] >= 0) ? dmod(UT["r"],24) : dmod(UT["r"],24)+24;
 UT["s"]=(UT["s"] >= 0) ? dmod(UT["s"],24) : dmod(UT["s"],24)+24;
 LT["r"]=dmod(UT["r"]+timezone,24);
 LT["s"]=dmod(UT["s"]+timezone,24);
 
 SR["H"]=Math.floor(LT["r"]);
 SR["m"]=parseInt((LT["r"]-SR["H"]) * 60);
 SR["s"]=parseInt((LT["r"]-SR["H"]) * 3600) % 60;
 SS["H"]=Math.floor(LT["s"]);
 SS["m"]=parseInt((LT["s"]-SS["H"]) * 60);
 SS["s"]=parseInt((LT["s"]-SS["H"]) * 3600) % 60;

 SR["secs"]=SR["s"]+Math.floor(60 * (SR["m"]+(SR["H"] * 60)));
 SS["secs"]=SS["s"]+Math.floor(60 * (SS["m"]+(SS["H"] * 60)));
// Get length of daylight in seconds.
 var DL=new Array();
 var HDL=new Array();
 DL["secs"]=SS["secs"]-SR["secs"];
 

 DL["H"]=Math.floor(DL["secs"] / 3600);
 DL["m"]=Math.floor(DL["secs"] / 60) % 60;
 DL["s"]=Math.floor(DL["secs"] % 60);

 HDL["secs"]=DL["secs"] / 2;

 var SN=new Array();
 SN["secs"]=SR["secs"]+HDL["secs"];

// Get time of solar noon.
 SN["H"]=Math.floor(SN["secs"] / 3600);
 SN["m"]=Math.floor(SN["secs"] / 60) % 60;
 SN["s"]=(SN["secs"] % 60);
 
 try{is_noonsec;}
 catch(e){var is_noonsec=false;}
 
 if(is_noonsec == true){
  var addnoonsec_c=":"+onedights(Math.floor(SN["s"]));
  var addnoonsec_d=" "+onedights(Math.floor(SN["s"]))+"초";
 }else{var addnoonsec_c=addnoonsec_d="";}
 
 
 return new Array(
 (onedights(SR["H"])+":"+onedights(SR["m"])),                                   // Sunrise [0]
 (onedights(SR["H"])+"시 "+onedights(SR["m"])+"분"),                             // SR for displaying [1]
 (onedights(SS["H"])+":"+onedights(SS["m"])),                                   // Sunset [2]
 (onedights(SS["H"])+"시 "+onedights(SS["m"])+"분"),                              // SS for displaying [3]
 (onedights(SN["H"])+":"+onedights(SN["m"])+addnoonsec_c),                                    // Solar noon [4]
 (onedights(SN["H"])+"시 "+onedights(SN["m"])+"분"+addnoonsec_d),                          // SN for displaying [5]
 (DL["H"]+"시간 "+DL["m"]+"분 "+DL["s"]+"초"),                                   // Length of Daylight [6]
 sunAL                                                                   // Elevation of Sun at solar noon [7]
);
}

function getSunriseSunsetByJD(jd,lat,longitude,zen,tz,is_noonsec){
 var gdate=JD2solar(jd);
 return getSunriseSunset(gdate[0],gdate[1],gdate[2],lat,longitude,zen,tz,is_noonsec);
}

// 하루 주기로 변하는 태양의 위치정보 구하기
// JD: 해당 시간의 율리우스 적일(세계시=UT 기준),
// latitude: 해당 지역의 위도, longitude: 해당 지역의 경도
// timezone: 해당 지역의 시간대 (시간 단위)
function getSunDailyPos(JD,latitude,longitude,timezone){
 var sunDecl=solarPos(JD)[11]; // 태양의 적위 (도 단위)
 
 var eqTime=equationOfTime(JD) * 1440;
 var meanSolarTimeFix=(longitude * 4)-(timezone * 60);
 var trueSolarTimeFix=eqTime+meanSolarTimeFix;
 
 var cTime=jhms(JD+(timezone / 24));
 var cTimeMins=(cTime[0] * 60)+cTime[1]+(cTime[2] / 60);
 
 // 평균 태양시
 var meanSolarTime=cTimeMins+meanSolarTimeFix;
 // 진 태양시
 var trueSolarTime=cTimeMins+trueSolarTimeFix;
 
 var hourAngle=(trueSolarTime-720) / 4; // 시간각
 hourAngle=(hourAngle < -180) ? (hourAngle+360) : hourAngle;
 
 
 // 천정 각도 구하기
 var cosZenith=(dsin(latitude) * dsin(sunDecl))+(dcos(latitude) * dcos(sunDecl) * dcos(hourAngle));
 if(Math.abs(cosZenith) > 1){cosZenith=sgn(cosZenith);}
 
 var trueZenith=rad2deg(Math.acos(cosZenith));
 
 var AZDen=dcos(latitude) * dsin(trueZenith);
 
 // 방위각
 if(Math.abs(AZDen) > 0.001){
  var cosAZ=((dsin(latitude) * dcos(trueZenith))-dsin(sunDecl)) / AZDen;
  if(Math.abs(cosAZ) > 1){cosAZ=sgn(cosAZ);}
  var sunAZ=180-rad2deg(Math.acos(cosAZ));
  if(hourAngle > 0){sunAZ=-sunAZ;}
 }else{sunAZ=(latitude > 0) ? 180 : 0;}
 
 if(sunAZ < 0){sunAZ+=360;}
 
 
 var trueAltitude=90-trueZenith;
 // 대기의 굴절 효과 반영
 if(trueAltitude > 85){var refractFactor=0;}
 else{
  var tangentElev=dtan(trueAltitude);
  if(trueAltitude > 5){
   var refractCorr=(58.1 / tangentElev);
   refractCorr+=-(0.07 / Math.pow(tangentElev,3));
   refractCorr+=(0.000086 / Math.pow(tangentElev,5));
  }else if(trueAltitude > -0.575){
   var refractCorr=1735;
   refractCorr+=(trueAltitude * (-518.2+(trueAltitude * (103.4+(trueAltitude * (-12.79+(trueAltitude * 0.711)))))));
  }else{
   var refractCorr=-20.774 / tangentElev;
  }
  var refractFactor=refractCorr / 3600;
 }
 var zenithApp=trueZenith-refractFactor;
 var altitudeApp=90-zenithApp;
 
 return new Array(
 trueAltitude,            // [0] 태양의 실제 고도
 altitudeApp,            // [1] 태양의 겉보기 고도
 sunAZ,                // [2] 태양의 방위각 
 meanSolarTime,        // [3] 평균 태양시 (분 단위)
 trueSolarTime,          // [4] 진 태양시 (분 단위)
 meanSolarTimeFix,      // [5] 표준시와 태양시의 차이 (분 단위)
 eqTime               // [6] 균시차 (분 단위)
 );
}

// 하루 주기로 변하는 달의 위치정보 구하기
// JD: 해당 시간의 율리우스 적일(세계시=UT 기준),
// latitude: 해당 지역의 위도, longitude: 해당 지역의 경도
// timezone: 해당 지역의 시간대 (시간 단위)
function getMoonDailyPos(JD,latitude,longitude){
 // 지방 항성시
 var localTheta=local_ast(JD,longitude);
 
 // 달의 적위/적경
 var lunarDecl=lunarPos(JD)[6];
 var lunarRA=lunarPos(JD)[7];
 
 // 달의 시간각
 var lunarHA=(localTheta * 15)-lunarRA;
 if(lunarHA < 0){lunarHA=fixangle(lunarHA);}
 
 // 달의 고도
 var sinH=(dsin(latitude) * dsin(lunarDecl))+(dcos(latitude) * dcos(lunarDecl) * dcos(lunarHA));
 if(Math.abs(sinH) > 1){sinH=sgn(sinH);}
 var trueAltitude=rad2deg(Math.asin(sinH));
 
 // 달의 방위각
 var AZDenom=(dcos(latitude) * dtan(lunarDecl))-(dsin(latitude) * dcos(lunarHA));
 var moonAZ=-rad2deg(Math.atan2(-dsin(lunarHA),AZDenom));
 if(lunarHA > 0){moonAZ=-moonAZ;}
 if(moonAZ < 0){moonAZ+=360;}
 
 // 시차 구하기
 var horParal=8.794 / lunarPos(JD)[12];
 var sinParal=dcos(trueAltitude) * dsin(horParal / 3600);
 var altParal=rad2deg(Math.asin(sinParal)); 
 // 대기의 굴절 효과
 var refractFactor=(1.02 / dtan(trueAltitude+(10.3 / (trueAltitude+5.11)))) / 60;
 var altCorr=altParal-refractFactor;
 var altitudeApp=trueAltitude-altCorr;
 
 return new Array(
 trueAltitude,            // [0] 달의 실제 고도
 altitudeApp,            // [1] 달의 겉보기 고도
 moonAZ               // [2] 달의 방위각
 );
}

function quad(ym,yz,yp){
 var nz=0;
 var a=(0.5 * (ym+yp))-yz;
 var b=(0.5 * (yp-ym));
 var c=yz;
 var xe=-b / (a * 2);
 var ye=(a * xe+b) * xe+c;
 var D=Math.pow(b,2)-(4 * a * c);
 if(D > 0){
  var dx=(0.5 * Math.sqrt(D)) / Math.abs(a);
  var z1=xe-dx;
  var z2=xe+dx;
  if(Math.abs(z1) <= 1){nz++;}
  if(Math.abs(z2) <= 1){nz++;}
  if(z1 < -1){z1=z2;}
 }
 return new Array(nz,z1,z2,xe,ye);
}

function sinalt(JD0,hr,longitude,cosLat,sinLat){
 var JD=JD0+(hr / 24);
 var ra=lunarPos(JD)[7] / 15;
 var dec=lunarPos(JD)[6];
 var tau=15 * (lmst(JD,longitude)-ra);
 
 return (sinLat * dsin(dec))+(cosLat * dcos(dec) * dcos(tau));
}

// findMoonRiset(int year, int month, int day, float tz, float long, float lat); -- Find a moonrise and moonset for given date and location.
function findMoonRiset(year,month,day,tz,longitude,lat){
 var JD=solar2JD(year,month,day);
 var sinho=dsin(8 / 60);
 var sinLat=dsin(lat);
 var cosLat=dcos(lat);
 var utrise,utset;
 var date=JD-(tz / 24);
 var rise=false;
 var set=false;
 var above=false;
 var hr=1;
 var n=0;
 var ym=sinalt(date,hr-1,longitude,cosLat,sinLat)-sinho;
 if(ym > 0){above=true;}
 while(hr < 25 && (set == false || rise == false)){
 yz=sinalt(date,hr,longitude,cosLat,sinLat)-sinho;
 yp=sinalt(date,hr+1,longitude,cosLat,sinLat)-sinho;
 
 var quadout=quad(ym,yz,yp);
 var nz=quadout[0];
 var z1=quadout[1];
 var z2=quadout[2];
 var xe=quadout[3];
 var ye=quadout[4];
 
  if(nz == 1){
   if(ym < 0){
    utrise=hr+z1;
    rise=true;
   }else{
    utset=hr+z1;
    set=true;
   }
  }
 
  if(nz == 2){
   if(ye < 0){
    utrise=hr+z2;
    utset=hr+z1;
   }else{
    utrise=hr+z1;
    utset=hr+z2; 
   }
  }
  ym=yp;
  hr+=2;
 }

 var timerise=new Array();
 timerise["H"]=Math.floor(utrise);
 timerise["m"]=parseInt((utrise-timerise["H"]) * 60);
 timerise["s"]=parseInt((utrise-timerise["H"]) * 3600) % 60;
 
 var timeset=new Array();
 timeset["H"]=Math.floor(utset);
 timeset["m"]=parseInt((utset-timeset["H"]) * 60);
 timeset["s"]=parseInt((utset-timeset["H"]) * 3600) % 60;
 
 if(rise == true || set == true){
  if(rise == true){
   outstr1=(onedights(timerise["H"])+"시 "+onedights(timerise["m"])+"분");
   outstr3=(onedights(timerise["H"])+":"+onedights(timerise["m"]));
  }else{
   outstr1="--시 --분";
   outstr3="--:--";
  }
  if(set == true){
   outstr2=(onedights(timeset["H"])+"시 "+onedights(timeset["m"])+"분");
   outstr4=(onedights(timeset["H"])+":"+onedights(timeset["m"]));
  }else{
   outstr2="--시 --분";
   outstr4="--:--";
  }
 }else{
  outstr1=outstr2="--시 --분";
  outstr3=outstr4="--:--";
 }
 return new Array(outstr1,outstr2,outstr3,outstr4);
}


function findMoonRisetByJD(JD,tz,longitude,lat){
 var gdate=JD2solar(JD);
 return findMoonRiset(gdate[0],gdate[1],gdate[2],tz,longitude,lat);
}

// float getNewFullMoons(float t0 [, int newFull=0]) -- 삭 혹은 망의 날짜 및 시각/월식 관련 정보 구하기
// 입력값 -- t0: 율리우스 날짜 인수
// 반환값 -- 삭 혹은 망의 역표시(曆表時, Ephemeris time)에 해당하는 율리우스 적일 및 월식 관련 정보
function getNewFullMoons(t0,newFull){
 var tau=t0 * 1236.85;
 switch(newFull){
 case 0:
  var k=Math.floor(tau); // 가장 최근의 합삭
 break;
 case 1:
  var k=Math.ceil(tau); // 해당 날짜의 바로 다음 합삭
 break;
 case 2:
  var k=Math.round(tau-0.5)+0.5; // 가장 가까운 망
 break;
 case 3:
  var k=Math.ceil(tau)+0.5; // 해당 날짜의 바로 다음 망
 break;
 case 4:
  var k=Math.floor(tau-1); // 해당 날짜의 이전 합삭
 break;
 case 5:
  var k=Math.floor(tau)-0.5; // 해당 날짜의 바로 이전 망
 break;
 /*
 case 6:
  var k=Math.ceil(tau)-0.125;
 break;
 */
 }
 
 var t2=Math.pow(t0,2);
 var t3=Math.pow(t0,3);
 var JD0=2415020.75933+(SYNODIC_MONTH * k);
 JD0+=0.0001178 * t2;
 JD0+=-(0.000000155 * t3);
 JD0+=(0.00033 * dsin(166.56+(132.87 * t0)-(0.009173 * t2)));
 
 var T=k / 1236.85;
 var T2=Math.pow(T,2);
 var T3=Math.pow(T,3);
 
 var M0=359.2242+(29.10535608 * k);
 M0+=-(0.0000333 * T2);
 M0+=-(0.00000347 * T3);
 
 var M1=306.0253+(385.81691806 * k);
 M1+=0.0107306 * T2;
 M1+=0.00001236 * T3;
 
 var H0=21.2964+(390.67050646 * k);
 H0+=-(0.0016528 * T2);
 H0+=-(0.00000239 * T3);
 
 var F=(0.1734-(0.000393 * T)) * dsin(M0);
 F+=0.0021 * dsin(M0);
 F+=-(0.4068 * dsin(M1));
 F+=0.0161 * dsin(M1 * 2);
 F+=-(0.0004 * dsin(M1 * 3));
 F+=0.0104 * dsin(H0 * 2);
 F+=-(0.0051 * dsin(M0+M1));
 F+=-(0.0074 * dsin(M0-M1));
 F+=0.0004 * dsin((H0 * 2)+M0);
 F+=-(0.0004 * dsin((H0 * 2)-M0));
 F+=-(0.0006 * dsin((H0 * 2)+M1));
 F+=0.0010 * dsin((H0 * 2)-M1);
 F+=0.0005 * dsin((M1 * 2)+M0);
 F+=30 / 86400;
 var JDE=JD0+F;
 
 // 월식 관련 계산
 if(k != Math.floor(k)){
  if(Math.abs(dsin(H0)) > 0.36){
   var isEclipse=false;
   var MagPen0=0;
   var MagUmb0=0;
   var penDur=0,umbDur=0,totalityDur=0;
  }else{
   var S=5.19595-(0.0048 * dcos(M0));
   S+=0.0020 * dcos(M0 * 2);
   S+=-(0.3283 * dcos(M1));
   S+=-(0.0060 * dcos(M0+M1));
   S+=0.0041 * dcos(M0-M1);
   
   var C0=0.2070 * dsin(M0);
   C0+=0.0024 * dsin(M0 * 2);
   C0+=-(0.0390 * dsin(M1));
   C0+=0.0115 * dsin(M1 * 2);
   C0+=-(0.0073 * dsin(M0+M1));
   C0+=-(0.0067 * dsin(M0-M1));
   C0+=0.0117 * dsin(H0 * 2);
  
   var D0=Math.abs((S * dsin(H0))+(C0 * dcos(H0)));
   var U=0.0059+(0.0046 * dcos(M0));
   U+=-(0.0182 * dcos(M1));
   U+=0.0004 * dcos(M1 * 2);
   U+=-(0.0005 * dcos(M0+M1));
   
   var RP=U+1.2847;
   var RU=0.7404-U;
   var MagPen0=(1.5572+U-D0) / 0.545;
  
   if(MagPen0 < 0){
    var isEclipse=false;
    var MagPen0=0;
    var MagUmb0=0;
    var penDur=0,umbDur=0,totalityDur=0;
   }else{
    var isEclipse=true;
    var MagUmb0=(1.0129-U-D0) / 0.545;
    
    var D1=U+1.5572;
    var D2=1.0129-U;
    var D3=0.4679-U;
    var N0=(0.5458+(0.04 * dcos(M1))) / 60;
    
    D1=Math.pow(Math.pow(D1,2)-Math.pow(D0,2),2) / N0; // 반영식의 길이의 1/2
    var penDur=D1 * 2;
    if(!(MagUmb0 <= 0)){
     D2=Math.pow(Math.pow(D2,2)-Math.pow(D0,2),2) / N0; // 본영식의 길이의 1/2
     var umbDur=D2 * 2;
    }else{var umbDur=0;}
    if(!(MagUmb0 <= 1)){
     D3=Math.pow(Math.pow(D3,2)-Math.pow(D0,2),2) / N0; // 개기식의 길이의 1/2
     var totalityDur=D3 * 2;
    }else{var totalityDur=0;}
   }
  }
 }else{
  var isEclipse=false;
  var MagPen0=0;
  var MagUmb0=0;
 }
 
 // [0] JDE: 삭 혹은 망의 역표시(曆表時, Ephemeris time)에 해당하는 율리우스 적일
 // [1] isEclipse: 월식이 있는지의 여부
 // [2] MagPen: 반영 식분(蝕分)
 // [3] MagUmb: 본영 식분 
 return new Array(JDE,isEclipse,MagPen0,MagUmb0);
}

// 정확한 월령 구하기
function getMoonPhase(JD){
 //var T=(JD-J2000) / (TROPICAL_YEAR * 100);
 var T=(JD-J2000) / JULIAN_CENTURY;
 var T2=Math.pow(T,2);
 var T3=Math.pow(T,3);
 var T4=Math.pow(T2,2);
 var D=297.8502042+(445267.1115168 * T);
 D+=-(0.0016300 * T2);
 D+=T3 / 545868;
 D+=-(T4 / 113065000);
 var M=solarPos(JD)[1];
 var Mp=134.9634114+(477198.8676313 * T);
 Mp+=0.0089970 * T2;
 Mp+=T3 / 9699;
 Mp+=-(T4 / 14712000);
 
 var phaseAngle=180-D;
 phaseAngle+=-(6.289 * dsin(Mp));
 phaseAngle+=2.100 * dsin(M);
 phaseAngle+=-(1.274 * dsin((D * 2)-Mp));
 phaseAngle+=-(0.658 * dsin(D * 2));
 phaseAngle+=-(0.214 * dsin(Mp * 2));
 phaseAngle+=-(0.110 * dsin(D));
 phaseAngle=fixangle(phaseAngle+180)-180;
 var decLunation=fixangle(180-phaseAngle) / 360;
 
 return new Array(decLunation,phaseAngle);
}

// 대략적인 월령 구하기
function getAppMoonPhase(JDcount){
 var eYear=JD2solar(JDcount)[0];
 var appSynodicMonth=SYNODIC_MONTH+(0.000000002162 * (eYear-2000)); // 삭망월의 일수 변화 반영
 var numDates=JDcount-ALT_PHASE_EPOCH;
 var appPhase=gmod(((numDates / appSynodicMonth) * 4000000),4000000) / 1000000;
 var appPhaseAge0=Math.round(appPhase * appSynodicMonth * 864000) / 3456000;
 var appPhaseAge=roundTo(appPhaseAge0,1);
 
 var appPhaseAngle=180-((appPhaseAge / appSynodicMonth) * 360);
 
 var appPhasePercentage=(appPhase < 2) ? (Math.round(appPhase * 5000000) / 100000) : (Math.round(Math.abs(4-appPhase) * 5000000) / 100000);

 return new Array(appPhase,appPhaseAge,appPhasePercentage,appPhaseAngle);
}

function curMoonPhase(){
 var phaseDateObj=new Date();
 var phaseTimezone=phaseDateObj.getTimezoneOffset();
 var phaseTimezoneFix=-(phaseTimezone * 60);
 var uPhaseDate=new Date(new Number(phaseDateObj)-(phaseTimezoneFix * 1000));

 var phaseYear=uPhaseDate.getFullYear();
 if(phaseYear < 1900){phaseYear+=1900;}
 var phaseMonth=uPhaseDate.getMonth()+1;
 var phaseDay=uPhaseDate.getDate();
 var phaseHour=uPhaseDate.getHours();
 var phaseMinute=uPhaseDate.getMinutes();
 var phaseSecond=uPhaseDate.getSeconds();

 var lunarJDCount=solar2JD(phaseYear,phaseMonth,phaseDay)+(Math.floor((phaseSecond+(60 * (phaseMinute+(60 * phaseHour))))) / 86400);

 var curSynodicMonth=SYNODIC_MONTH+(0.000000002162 * (phaseYear-2000)); // 삭망월의 일수 변화 반영
 var curPhase=(((((lunarJDCount-PHASE_EPOCH) / curSynodicMonth) * 4000000) % 4000000) / 1000000);
 var curPhaseAge=Math.floor((Math.round(curPhase * curSynodicMonth * 864000) / 3456000) * Math.pow(10,1)) / Math.pow(10,1);
 
 if(curPhase < 2){var curPhasePercentage=(Math.round(curPhase * 5000000) / 100000);}
 else{var curPhasePercentage=(Math.round(Math.abs(4-curPhase) * 5000000) / 100000);}

 return new Array(curPhase,curPhaseAge,curPhasePercentage);
}

function sumSeries(calltrig,D,M,F,T,atab,coeff,tfix,tfixc){
 var i=0,j=0,n=0,sum=0;
 var arg,p,q;
 D=deg2rad(fixangle(D));
 M=deg2rad(fixangle(M));
 F=deg2rad(fixangle(F));
 for(i=0; coeff[i] != 0; i++){
  arg=(D * atab[j])+(M * atab[j+1])+(F * atab[j+2]);
  j+=3;
  p=coeff[i];
  if(i == tfix[n]){p+=T * tfixc[n++];}
  sum+=p * calltrig(arg);
 }
 return sum;
}

var periarg=new Array(
/*  D,  M,  F   */
 2,  0,  0,
 4,  0,  0,
 6,  0,  0,
 8,  0,  0,
 2, -1,  0,
 0,  1,  0,
 10,  0,  0,
 4, -1,  0,
 6, -1,  0,
 12,  0,  0,
 1,  0,  0,
 8, -1,  0,
 14,  0,  0,
 0,  0,  2,
 3,  0,  0,
 10, -1,  0,
 16,  0,  0,
 12, -1,  0,
 5,  0,  0,
 2,  0,  2,
 18,  0,  0,
 14, -1,  0,
 7,  0,  0,
 2,  1,  0,
 20,  0,  0,
 1,  1,  0,
 16, -1,  0,
 4,  1,  0,
 9,  0,  0,
 4,  0,  2,

 2, -2,  0,
 4, -2,  0,
 6, -2,  0,
 22,  0,  0,
 18, -1,  0,
 6,  1,  0,
 11,  0,  0,
 8,  1,  0,
 4,  0, -2,
 6,  0,  2,
 3,  1,  0,
 5,  1,  0,
 13,  0,  0,
 20, -1,  0,
 3,  2,  0,
 4, -2,  2,
 1,  2,  0,
 22, -1,  0,
 0,  0,  4,
 6,  0, -2,
 2,  1, -2,
 0,  2,  0,
 0, -1,  2,
 2,  0,  4,
 0, -2,  2,
 2,  2, -2,
 24,  0,  0,
 4,  0, -4,
 2,  2,  0,
 1, -1,  0 
);

var pericoeff=new Array(
 -1.6769,
 0.4589,
 -0.1856,
 0.0883,
 -0.0773,
 0.0502,
 -0.0460,
 0.0422,
 -0.0256,
 0.0253,
 0.0237,
 0.0162,
 -0.0145,
 0.0129,
 -0.0112,
 -0.0104,
 0.0086,
 0.0069,
 0.0066,
 -0.0053,
 -0.0052,
 -0.0046,
 -0.0041,
 0.0040,
 0.0032,
 -0.0032,
 0.0031,
 -0.0029,
 0.0027,
 0.0027,

 -0.0027,
 0.0024,
 -0.0021,
 -0.0021,
 -0.0021,
 0.0019,
 -0.0018,
 -0.0014,
 -0.0014,
 -0.0014,
 0.0014,
 -0.0014,
 0.0013,
 0.0013,
 0.0011,
 -0.0011,
 -0.0010,
 -0.0009,
 -0.0008,
 0.0008,
 0.0008,    
 0.0007,
 0.0007,
 0.0007,
 -0.0006,
 -0.0006,
 0.0006,
 0.0005,
 0.0005,
 -0.0004,

 0
);

var peritft = new Array(4,5,7,-1);

var peritfc=new Array(
 0.00019,
 -0.00013,
 -0.00011
);

var apoarg=new Array(
//D,   M,   F 
 2,  0,  0,
 4,  0,  0,
 0,  1,  0,
 2, -1,  0,
 0,  0,  2,
 1,  0,  0,
 6,  0,  0,
 4, -1,  0,
 2,  0,  2,
 1,  1,  0,
 8,  0,  0,
 6, -1,  0,
 2,  0, -2,
 2, -2,  0,
 3,  0,  0,
 4,  0,  2,

 8, -1,  0,
 4, -2,  0,
 10,  0,  0,
 3,  1,  0,
 0,  2,  0,
 2,  1,  0,
 2,  2,  0,
 6,  0,  2,
 6, -2,  0,
 10, -1,  0,
 5,  0,  0,
 4,  0, -2,
 0,  1,  2,
 12,  0,  0,
 2, -1,  2,
 1, -1,  0
);

var apocoeff=new Array(
 0.4392,
 0.0684,
 0.0456,
 0.0426,
 0.0212,
 -0.0189,
 0.0144,
 0.0113,
 0.0047,
 0.0036,
 0.0035,
 0.0034,
 -0.0034,
 0.0022,
 -0.0017,
 0.0013,

 0.0011,
 0.0010,
 0.0009,
 0.0007,
 0.0006,
 0.0005,
 0.0005,
 0.0004,
 0.0004,
 0.0004,
-0.0004,
-0.0004,
 0.0003,
 0.0003,
 0.0003,
-0.0003,

0
);

var apotft=new Array(2,3,-1);

var apotfc=new Array(-0.00011,-0.00011);

var periparg=new Array(
// D,  M,  F 
0,  0,  0,
2,  0,  0,
4,  0,  0,
2, -1,  0,
6,  0,  0,
1,  0,  0,
8,  0,  0,
0,  1,  0,
0,  0,  2,
4, -1,  0,
2,  0, -2,
10,  0,  0,
6, -1,  0,
3,  0,  0,
2,  1,  0,
1,  1,  0,
12,  0,  0,
8, -1,  0,
2,  0,  2,
2, -2,  0,
5,  0,  0,
14,  0,  0,

10, -1,  0,
4,  1,  0,
12, -1,  0,
4, -2,  0,
7,  0,  0,
4,  0,  2,
16,  0,  0,
3,  1,  0,
1, -1,  0,
6,  1,  0,
0,  2,  0,
14, -1,  0,
2,  2,  0,
6, -2,  0,
2, -1, -2,
9,  0,  0,
18,  0,  0,
6,  0,  2,
0, -1,  2,
16, -1,  0,
4,  0, -2,
8,  1,  0,
11,  0,  0,
5,  1,  0,
20,  0,  0
);

var peripcoeff=new Array(
3629.215,
63.224,
-6.990,
 2.834,
 1.927,
-1.263,
-0.702,
 0.696,
-0.690,
-0.629,
-0.392,
 0.297,
 0.260,
 0.201,
-0.161,
 0.157,
-0.138,
-0.127,
 0.104,
 0.104,
-0.079,
 0.068,

 0.067,
 0.054,
-0.038,
-0.038,
 0.037,
-0.037,
-0.035,
-0.030,
 0.029,
-0.025,
 0.023,
 0.023,
-0.023,
 0.022,
-0.021,
-0.020,
 0.019,
 0.017,
 0.014,
-0.014,
 0.013,
 0.012,
 0.011,
 0.010,
-0.010,

0
);

var periptft=new Array(3,7,9,-1);

var periptfc=new Array(
-0.0071,
-0.0017,
0.0016
);

var apoparg=new Array(
/*  D,  M,  F   */
 0,  0,  0,
 2,  0,  0,
 1,  0,  0,
 0,  0,  2,
 0,  1,  0,
 4,  0,  0,
 2, -1,  0,
 1,  1,  0,
 4, -1,  0,
 6,  0,  0,
 2,  1,  0,
 2,  0,  2,
 2,  0, -2,
 2, -2,  0,
 2,  2,  0,
 0,  2,  0,
 6, -1,  0,
 8,  0,  0
);

var apopcoeff=new Array(
 3245.251,
 -9.147,
 -0.841,
 0.697,
 -0.656,
 0.355,
 0.159,
 0.127,
 0.065,

 0.052,
 0.043,
 0.031,
 -0.023,
 0.022,
 0.019,
 -0.016,
 0.014,
 0.010,

 0
);

var apoptft=new Array(4,-1);

var apoptfc=new Array(0.0016,-1);

// ^ 위의 자료들은 원지점 및 근지점을 구하기 위한 인수 데이터. 

// 달의 원지점 및 근지점 날짜 구하기
// 반환값: 근지점 및 원지점에 대한 자료의 배열 (차례대로 해당 날짜의 율리우스 적일, 거리 인수, 거리)
function getLunarApsis(tau,prevNext){
 var lunarH=0.25; // 달의 절대등급
 var k0=(tau * 1325.55)+0.5;
 
 switch(prevNext){
 case 0:
  var k=Math.floor(k0);
 break;
 case 1:
  var k=Math.ceil(k0);
 break;
 case 2:
  var k=Math.round(k0-0.5)+0.5;
 break;
 case 3:
  var k=Math.ceil(k0)+0.5;
 break;
 }
 
 var t0=k-Math.floor(k);
 
 if(t0 > 0.499 && t0 < 0.501){var apogee=true;}
 else if(t0 > 0.999 || t0 < 0.001){var apogee=false;}
 else{return;}
 
 var t=k / 1325.55;
 var t2=Math.pow(t,2),t3=Math.pow(t,3),t4=Math.pow(t,4);
 
 // 원지점과 근지점의 평균 율리우스 적일
 var JD0=2451534.6698+(ANOMALISTIC_MONTH * k);
 JD0+=-(0.0006691 * t2);
 JD0+=-(0.000001098 * t3);
 JD0+=0.0000000052 * t4;
 
 // 달의 평균 이각
 var D=171.9179+(335.9106046 * k);
 D+=-(0.0100383 * t2);
 D+=-(0.00001156 * t3);
 D+=0.000000055 * t4;
 
 // 태양의 근점 이각
 var M=347.3477+(27.1577721 * k);
 M+=-(0.0008130 * t2);
 M+=-(0.0000010 * t3);
 
 var F=316.6109+(364.5287911 * k);
 F+=-(0.0125053 * t2);
 F+=-(0.0000148 * t3);
 
 var apsisarg=(apogee != false) ? apoarg : periarg;
 var apsiscoeff=(apogee != false) ? apocoeff : pericoeff;
 var apsistft=(apogee != false) ? apotft : peritft;
 var apsistfc=(apogee != false) ? apotfc : peritfc;
 
 var apsisparg=(apogee != false) ? apoparg : periparg;
 var apsispcoeff=(apogee != false) ? apopcoeff : peripcoeff;
 var apsisptft=(apogee != false) ? apoptft : periptft;
 var apsisptfc=(apogee != false) ? apoptfc : periptfc;
 
 var JDE=JD0+sumSeries(Math.sin,D,M,F,t,apsisarg,apsiscoeff,apsistft,apsistfc);
 
 var par=sumSeries(Math.cos,D,M,F,t,apsisparg,apsispcoeff,apsisptft,apsisptfc);
 
 par=par / 3600;
 
 var distance=geoRad / dsin(par);
 var angularDiameter=rad2deg(Math.atan((0.5 * lunarRad) / distance) * 4);
 var phaseAngle=getMoonPhase(JDE)[1];
 var phaseInt=(2 / 3) * (((1-deg2rad(dmod(phaseAngle,180) / 180)) * dcos(dmod(phaseAngle,180)))+((1 / Math.PI) * dsin(phaseAngle)));
 
 var lunarMagArg=Math.pow((distance / ASTRO_UNIT),2);
 var lunarMag0=lunarH+(2.5 * log10(lunarMagArg / Math.abs(phaseInt)));
 var lunarMag=roundTo(lunarMag0,2);
 return new Array(JDE,par,distance,angularDiameter,lunarMag);
}

