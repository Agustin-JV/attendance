// @ts-check
/**
 * @template T
 * @param {T} leadArray
 * @param {T} secondArray
 * @param {string}[key]
 * @return {T}
 * */
export function mergeArrays(leadArray, secondArray, key) {
  if (key === null) return mergeSimpleArrays(leadArray, secondArray);
  else return mergeObjArrays(leadArray, secondArray, key);
}

/**
 * @template T
 * @param {T} leadArray
 * @param {T} secondArray
 * @return {T}
 * */
export function mergeSimpleArrays(leadArray, secondArray) {
  let h = {};
  let n = [];
  leadArray.concat(secondArray).map(function(b) {
    h[b] = h[b] || n.push(b);
  });
  return n;
}
/**
 * @template T
 * @param {T} leadArray
 * @param {T} secondArray
 * @param {string} key
 * @return {T}
 * */
export function mergeObjArrays(leadArray, secondArray, key) {
  let h = {};
  let n = [];
  leadArray.concat(secondArray).map(function(b) {
    h[b[key]] = h[b[key]] || n.push(b);
  });
  return n;
}
/**
 * @template T
 * @param {T} leadArray
 * @param {T} secondArray
 * @param {string[]} keys
 * @return {T}
 * */
export function mergeArraysMultyKey(leadArray, secondArray, keys) {
  let h = {};
  let n = [];
  leadArray.concat(secondArray).map(function(b) {
    let key = '';
    //console.log(b);
    for (let x in keys) {
      key += b[keys[x]] + '/';
    }
    h[b[key]] = h[b[key]] || n.push(b);
  });
  return n;
}
/*
  old merge update not that bad
  const updatedRows = rows.map(row => () => {
    for (let x in goodData) {
      if (row.sap_id === goodData[x].sap_id) {
        let out = goodData[x];
        goodData.splice(x, 1);
        return out;
      }
    }
    return row;
  });
*/
export function objectMap(object, mapFn) {
  return Object.keys(object).map(function(key) {
    return mapFn(key, object[key]);
  });
}
export function objectForEach(object, mapFn) {
  return Object.keys(object).forEach(function(key) {
    mapFn(key, object[key]);
  });
}
export function arrayMatchPatterns(array, patterns) {
  for (let x in patterns) {
    if (!arrayMatchPattern(array, patterns[x])) {
      return false;
    }
  }
  return true;
}
export function arrayMatchPattern(array, pattern) {
  for (let x in array) {
    let regex = /([a-z]+)\|?([a-z]*)/g;
    let exec = regex.exec(pattern[x]);
    let [,a,b] = exec;
    let type = typeof array[x];

    if ((b!== '' && (type !== a && type !== b)) && pattern[x] !== 'any') {
      return false;
    }
    else if ( type !== a && b===''  && a !== 'any') {
      return false;
    }
  }
  return true;
}

export function arrayBuildComplexPattern( pattern) {
  let simplePattern = [];
  for (let range in pattern) {
    let regex = /([0-9]+)-?([0-9]*)/g;
    let exec = regex.exec(range);
    let [, start, end] = exec;
    if (end !== '') for (let i = start; i <= end; i++) simplePattern.push(pattern[range]);
    else simplePattern.push(pattern[range]);
  }
  return simplePattern;
}
export function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj === null) return true;
  if (obj === undefined) return true;
  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}
/**
 * Converts a string of a time to a date
 * Ex: 5:30:6, 16:4, 24:59:59, but not 3:50pm
 * @param {String} Time
 * @return {Date} Today date at the input time
 **/
export function strTimeToDate(time) {
  if (time === 0) {
    return 0;
  }
  time = time.split(':');
  let d = new Date();
  d.setHours(time[0], time[1], time[2] ? time[2] : 0);
  return d;
}

export function lazyStrToDate(time) {
  if (time === 0 || time === -1) {
    return time;
  }
  time = time.split(':');
  return new Date(0, 0, 0, time[0], time[1], time[2] ? time[2] : 0);
}

export function getMonth(month, onlyNumber) {
  onlyNumber = onlyNumber || false;
  let months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];
  let monthsEs = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];
  if (typeof month === 'number') {
    return months[month - 1];
  } else if (typeof month === 'string') {
    month = month.toLowerCase();
    if (months.includes(month)) {
      return onlyNumber ? months.indexOf(month) : month;
    } else if (monthsEs.includes(month)) {
      return months[monthsEs.indexOf(month)];
    }
  }
  return 'NAM';
}
/**
  * Process the data and thows it into a class
  * @param {string} name = Names Lastnames
  + @param {string}|| {array} Names Lastnames|| names, lastnames
  * @result {bolean}
  **/
export function namesMatch(n1, n2) {
  let t1 = '';
  let t2 = '';
  t1 = typeof n1 === 'string' ? 's' : t1;
  t2 = typeof n2 === 'string' ? 's' : t2;
  t1 = Array.isArray(n1) ? 'a' : t1;
  t2 = Array.isArray(n2) ? 'a' : t2;

  if (t1 === 's' && t2 === 's') {
    return n1 === n2;
  }
  if (t1 === 'a' && t2 === 's') {
    // Swap the variables 	destructuring assignment
    [t1, t2] = [t2, t1];
    [n1, n2] = [n2, n1];
  }
  if (t1 === 's' && t2 === 'a') {
    let temp = t2.reverse();
    return n1 === n2.join(' ') || n1 === temp.join(' ');
  }
  return n1 === n2;
}
/**
 * Converts excel date to js UTC date
 * Does not support dates previous form 1900 Jan 1
 * @param {Number} date 	=> excel date, positive number
 * @return {Date} UTC date
 **/
export function xslxToJsUTCDate(date) {
  if (typeof date !== 'number' || date < 0) {
    throw new Error('Not a positive number');
  }
  let d = new Date(Date.UTC(1900, 1, 0, 0, 0, 0));
  //29 of february of 1990 does not exist otutside excel
  if (date <= 60) {
    date += 1;
  }
  d.setUTCDate(date - 1);
  //d.toUTCString();
  return d;
}
/**
 * Recives milliseconds and returns a object
 * @param {Number} ms => milliseconds
 * @return {object} difference => {raw:ms()totlal,hh:hh,mm:mm,ss:ss,ms:ms,side:"a<b"}
 **/
export function msToTime(ms) {
  let raw = ms;
  let hh = Math.floor(ms / 1000 / 60 / 60);
  ms -= hh * 1000 * 60 * 60;
  let mm = Math.floor(ms / 1000 / 60);
  ms -= mm * 1000 * 60;
  let ss = Math.floor(ms / 1000);
  ms -= ss * 1000;
  return {
    raw: raw,
    hh: hh,
    mm: mm,
    ss: ss,
    ms: ms,
    side: 'a<b'
  };
}

export function isAny(target, array) {
  for (let x in array) if (target === array[x]) return true;
  return false;
}

export function getNextDay(year, month, day) {
  let _day = new Date(year, month, day);
  let nextDay = new Date(_day);
  nextDay.setDate(_day.getDate() + 1);
  return nextDay;
}
/**
 * Gets the time from the last entry to midnight and
 * the time from midnight to the first entry
 * @param {string} time of first or last entry ex:'10:50'
 * @param {Boolean} toMidnight true 'day-night' x->(00:00) or false 'night-day' (00:00)->x
 * @param {Boolean} excelTime true false; true if you want to get the time expreced like excel
 * @return {int} time positive, ether in ms or excel time format 0.0004 exetera
 */
export function getMidNightTime(time, toMidnight, excelTime) {
  let x = strTimeToDate(time);
  let y = new Date(x.getFullYear(), x.getMonth(), x.getDate() + (toMidnight ? 1 : 0), 0, 0, 0, 0);
  let z = toMidnight ? y - x : x - y;
  //excel store the time on fraction of a day 1 = one day (24hr)
  //so we got to devide to trun it to that format 1 day = 8.64e+7ms
  return excelTime ? z / 8.64e7 : z;
}
/**
 * Gets if the time  of the entry is inside night shift
 * @param {string} time of first or last entry ex:'10:50'
 * @param {Boolean} beforeMidnight true 'day-night' x->(00:00) or false 'night-day' (00:00)->x
 * @return {Boolean} true false
 */
export function isTimeNightS(time, beforeMidnight) {
  let x = strTimeToDate(time);
  if (beforeMidnight) {
    return x.getHours() >= 21 ? true : false;
  } else {
    return x.getHours() <= 6 ? true : false;
  }
}

export function enableLoading(flag) {
  let loading = document.getElementById('loading');
  loading.style.display = flag ? 'block' : 'none';
  let fdrop = document.getElementById('file_drop');
  fdrop.style.display = flag ? 'none' : 'block';
}

export function showProgress(data) {
  let info = document.getElementById('loading_info');
  info.innerHTML = data;
}
