## rss.controller.js 200
"use strict";
app.controller("rssC", rssC);
rssC.$inject = ["$scope", "$http", "$sce"];
function rssC($scope, $http, $sce) {
  var rssC = this;
  rssC.init = function () {
    $http
      .get("/" + drupalSettings.path.currentLanguage + "/rss_data")
      .then(function (response) {
        rssC.rss_data = response.data.data;
      });
    $http
      .get("/" + drupalSettings.path.currentLanguage + "/sea_locations")
      .then(function (response) {
        rssC.sea_locations = response.data.data;
      });
    $http
      .get("/" + drupalSettings.path.currentLanguage + "/locations_info")
      .then(function (response) {
        rssC.locations = response.data.data;
      });
  };
  rssC.init();
  return rssC;
}

## candidate urls
rssC
/rss_data
TRY https://ims.gov.il/rssC → 404 text/html; charset=utf-8 cors=null
<!DOCTYPE html>
<html dir="rtl" lang="he-IL" class="no-js">
    <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width" />
    	<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap" rel="stylesheet">
		<title>שגיאה</title>
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <link rel='stylesheet' type='text/css' media='all' href="https://maintenance.gov.il/css/style.css">      
    </head>
    <body class="light-blue no-pa">
        <img class="logo" src="https://maintenance.gov.il/img/National-digital-logo.png">
        <div class="wrapper">
         <section>
           <img class="img" src="https://maintenance.gov.il/img/Bird-looking-and-standing-on-sign.png">
           <span class="h1 ma-bo-20 text-center">מצטערים, העמוד שחיפשת לא נמצא</span>
           <span class="text-center">יתכן שהכתובת הוחלפה או הוזנה לא נכון</span>
         </section>
        </div>
     
      <span class="number">(5)</span>
     
    </body>
</html>
TRY https://ims.gov.il/rss_data → 200 application/json cors=null
{"data":{"forecast_sea":{"216":{"id":"24024","type":"forecast_sea","language":"he","datetime":"2020-11-01 16:50:00","lid":null,"sea_lid":"216","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_216_he.xml","created":"2020-11-01 16:51:00"},"215":{"id":"24026","type":"forecast_sea","language":"he","datetime":"2020-11-01 16:50:00","lid":null,"sea_lid":"215","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_215_he.xml","created":"2020-11-01 16:51:00"},"217":{"id":"24028","type":"forecast_sea","language":"he","datetime":"2020-11-01 16:50:00","lid":null,"sea_lid":"217","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_217_he.xml","created":"2020-11-01 16:51:00"},"213":{"id":"344130","type":"forecast_sea","language":"he","datetime":"2026-10-31 00:01:00","lid":null,"sea_lid":"213","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_213_he.xml","created":"2026-10-30 22:06:00"},"210":{"id":"344132","type":"forecast_sea","language":"he","datetime":"2026-10-31 00:01:00","lid":null,"sea_lid":"210","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_210_he.xml","created":"2026-10-30 22:06:00"},"212":{"id":"344134","type":"forecast_sea","language":"he","datetime":"2026-10-31 00:01:00","lid":null,"sea_lid":"212","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_212_he.xml","created":"2026-10-30 22:06:00"},"211":{"id":"344136","type":"forecast_sea","language":"he","datetime":"2026-10-31 00:01:00","lid":null,"sea_lid":"211","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_211_he.xml","created":"2026-10-30 22:06:00"},"214":{"id":"344138","type":"forecast_sea","language":"he","datetime":"2026-10-31 00:01:00","lid":null,"sea_lid":"214","alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_sea\/rssForecastSea_214_he.xml","created":"2026-10-30 22:06:00"}},"forecast_city":{"520":{"id":"35070","type":"forecast_city","language":"he","datetime":"2021-01-26 16:10:00","lid":"520","sea_lid":null,"alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_city\/rssForecastCity_520_he.xml","created":"2021-01-26 16:11:00"},"114":{"id":"35072","type":"forecast_city","language":"he","datetime":"2021-01-26 16:10:00","lid":"114","sea_lid":null,"alert_type":null,"alert_area":null,"file_path":"\/sites\/default\/files\/ims_data\/rss\/forecast_city\/rssForecastCity_114_he.xml","created":"2021-01-26 16:11:00"},"513":{"id":"35074","type":"forecast_city","language":"he","datetime":"2021-01-26 16:10:00","lid":"513","sea_lid":null,"alert_type":null