var mysql = require("mysql");
var express = require("express");
var _ = require("lodash");

var app = express();

var connection_config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "",
  timezone: "UTC",
  multipleStatements: true,
  dateStrings: ["DATE", "DATETIME"],
};
var connection = mysql.createConnection(connection_config);
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/addElement", function (req, res) {
  getPostData(req, (newElement) => {
    runQueryFromObject(
      connection,
      newElement.databaseID,
      newElement.tableID,
      newElement.data,
      true,
      (results) => {
        res.send(results);
      }
    );
  });
});

app.post("/updateElement", function (req, res) {
  getPostData(req, (updatedElement) => {
    runQueryFromObject(
      connection,
      updatedElement.databaseID,
      updatedElement.tableID,
      updatedElement.data,
      false,
      (results) => {
        res.send(results);
      }
    );
  });
});

app.post("/removeElement", function (req, res) {
  getPostData(req, (data) => {
    const key = Object.keys(data.data)[0];
    let query =
      "DELETE FROM `" +
      data.databaseID +
      "`.`" +
      data.tableID +
      "` WHERE " +
      key +
      " = " +
      data.data[key];
    connection.query(query, function (error, results, fields) {
      if (error) console.log(error);
      res.send(results);
    });
  });
});

function daisyChainGet(connectionObj, query, callback) {
  console.log(query);
  connectionObj.query(query, function (error, results, fields) {
    if (error) console.log(error);
    if (callback) {
      callback(results);
    } else {
      return results;
    }
  });
}

function runQueryFromObject(
  connection,
  databaseID,
  tableID,
  object,
  createNew,
  callback
) {
  let query = "SHOW COLUMNS FROM `" + databaseID + "`.`" + tableID + "`";
  connection.query(query, [object], function (error, results, fields) {
    if (error) console.log(error);
    let query2 = "INSERT INTO `" + databaseID + "`.`" + tableID + "` ";
    if (!createNew)
      query2 = "UPDATE `" + databaseID + "`.`" + tableID + "` SET ";
    let querySegment1 = "";
    let querySegment2 = "";
    let zarez = "",
      zagrada1 = "(",
      zagreda2 = " VALUES ";
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        let contains = false;
        for (let k = 0; k < results.length; k++) {
          if (results[k].Field == key) contains = true;
        }
        if (!contains) continue;
        if (!createNew) {
          querySegment2 += zarez + "`" + key + "`=";
        } else {
          querySegment2 += zagreda2 + zagrada1 + zarez;
        }
        if (createNew) querySegment1 += zagrada1 + zarez + "`" + key + "`";
        if (object[key] == null) {
          querySegment2 += "null";
        } else if (typeof object[key] == "object") {
          querySegment2 += "'" + JSON.stringify(object[key]) + "'";
        } else if (typeof object[key] == "boolean") {
          querySegment2 += object[key];
        } else {
          querySegment2 += "'" + object[key] + "'";
        }

        zarez = ",";
        zagrada1 = "";
        zagreda2 = "";
      }
    }
    if (createNew) {
      querySegment1 += ")";
      querySegment2 += ")";
    }
    query2 += querySegment1;
    query2 += querySegment2;
    if (!createNew) query2 += " WHERE `id`='" + object.id + "'";
    console.log(query2);
    connection.query(query2, function (error2, results2, fields) {
      if (error2) {
        if (callback) callback(error2);
      } else {
        if (callback) callback(results2);
      }
    });
  });
}

function getPostData(req, callback) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let data = JSON.parse(body);
      callback(data);
    });
  }
}

app.listen(3001, function () {
  console.log("Listening on port 3001!");
});

const fetch = require("node-fetch");
const url = "https://api-pub.bitfinex.com/v2";

const queryParams = "limit=10000"; // Change these based on relevant query params

async function fetchBitfinex(ticker, res) {
  const pathParams = `candles/trade:30m:${ticker}/hist`; // Change these based on relevant path params. /last for last candle
  try {
    const queryString = `${url}/${pathParams}?${queryParams}`;
    console.log(queryString);
    const req = await fetch(queryString, {
      "Access-Control-Allow-Origin": "*",
    });
    const response = await req.json();
    //console.log(`STATUS ${req.status} - ${JSON.stringify(response)}`)
    res.send(JSON.stringify(response));
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

app.get("/getCandles", function (req, res) {
  fetchBitfinex(req.query.ticker, res);
});

var connection_config_bitfinex = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bitfinex10k",
  timezone: "UTC",
  multipleStatements: true,
  dateStrings: ["DATE", "DATETIME"],
};
var connectionBitfinex = mysql.createConnection(connection_config_bitfinex);

app.get("/bitfinexDump", function (req, res) {
  downloadAllBitfinex(res);
});

async function downloadAllBitfinex(res) {
  const req = await fetch("https://api.bitfinex.com/v1/symbols", {
    "Access-Control-Allow-Origin": "*",
  });
  const response = await req.json();
  console.log(response.length);
  for (let i = 240; i < 306; i++) {
    const tickerName = response[i].toUpperCase();

    const pathParams = `candles/trade:1m:t${tickerName}/hist`;
    const queryParams = "limit=10000";
    const queryString = `${url}/${pathParams}?${queryParams}`;
    const req = await fetch(queryString, {
      "Access-Control-Allow-Origin": "*",
    });
    const data = await req.json();
    if (data.length == 10000) {
      createTable(tickerName);
      fillTable(tickerName, data);
    }
    console.log(i);
  }
  res.send(JSON.stringify(response));
}

async function createTable(ticker) {
  let query =
    "CREATE TABLE `" +
    ticker +
    "` (`mst` BIGINT(15) NULL, `open` FLOAT NULL,`close` FLOAT NULL," +
    "`high` FLOAT NULL,`low` FLOAT NULL,`volume` FLOAT NULL ,PRIMARY KEY (`mst`))";
  // console.log(query);
  await connectionBitfinex.query(query, function (error, results, fields) {
    if (error) console.log(error);
  });
}
async function fillTable(ticker, data) {
  let query =
    "INSERT INTO `" + ticker + "`(mst,open,close,high,low,volume) VALUES ";
  for (let i = 0; i < data.length; i++) {
    if (i > 0) query += ",";
    query += `(${data[i][0]},${data[i][1]},${data[i][2]},${data[i][3]},${data[i][4]},${data[i][5]})`;
  }
  // console.log(query);
  await connectionBitfinex.query(query, function (error, results, fields) {
    if (error) console.log(error);
  });
}

/**
/**
 * calculates pearson correlation
 * @param {number[]} d1
 * @param {number[]} d2
 */
function corr(d1, d2) {
  let { min, pow, sqrt } = Math;
  let add = (a, b) => a + b;
  let n = min(d1.length, d2.length);
  if (n === 0) {
    return 0;
  }
  [d1, d2] = [d1.slice(0, n), d2.slice(0, n)];
  let [sum1, sum2] = [d1, d2].map((l) => l.reduce(add));
  let [pow1, pow2] = [d1, d2].map((l) => l.reduce((a, b) => a + pow(b, 2), 0));
  let mulSum = d1.map((n, i) => n * d2[i]).reduce(add);
  let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n));
  if (dense === 0) {
    return 0;
  }
  return (mulSum - (sum1 * sum2) / n) / dense;
}

function findmax(arr) {
  let index = 0;
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].close > max) {
      max = arr[i].close;
      index = i;
    }
  }
  return index;
}

function recurs(ticker, results, res, restring, i) {
  makeCalc(ticker, results[i].table_name, restring, i, (restringBack, i) => {
    i++;
    // if(i<results.length-1){
    if (i < 10) {
      recurs(ticker, results, res, restringBack, i);
    } else {
      res.send(restringBack);
    }
  });
}

app.get("/calculatePearson", function (req, res) {
  let restring = "";
  const query =
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'bitfinex10k'";
  connectionBitfinex.query(query, function (error, results, fields) {
    if (error) console.log(error);
    recurs(req.query.ticker, results, res, restring, 0);
  });
});

async function makeCalc(ticker1, ticker2, restring, i, callback) {
  calcPers(ticker1, ticker2, restring, (restringBack) => {
    calcPers(ticker2, ticker1, restringBack, (restringBack) => {
      callback(restringBack, i);
    });
  });
}

function calcPers(ticker1, ticker2, restring, callback) {
  const query1 = "SELECT * FROM `" + ticker1 + "`";
  connectionBitfinex.query(query1, function (error1, data1, fields1) {
    if (error1) console.log(error1);
    let corar = [];
    const query2 = "SELECT * FROM `" + ticker2 + "`";
    //restring+="<br>";
    restring += ticker1 + " : " + ticker2 + "<br>";
    connectionBitfinex.query(query2, function (error2, data2, fields2) {
      if (error2) console.log(error2);
      for (let offset = 0; offset < 100; offset++) {
        let d1 = [],
          d2 = [];
        for (let i = 0; i < data1.length - offset; i++) {
          d1.push(data1[i].close);
          d2.push(data2[i + offset].close);
        }
        const per = corr(d1, d2);
        corar.push(per);
        //restring+=(per+"<br>");
      }
      const max = findmax(corar);
      restring += "MAX: index - " + max + " ; value - " + corar[max] + "<br>";
      callback(restring);
    });
  });
}
