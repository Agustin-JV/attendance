import {
  xslxToJsUTCDate,
  msToTime,
  isEmpty,
  strTimeToDate,
  showProgress,
  getMidNightTime,
  enableLoading,
  isTimeNightS
} from './utils';
import * as tableStructures from './table_structures.json';
import shift_rules from './shift_rules.json';
import { addUpdate } from './indexeddb_tools';
import { getShift } from './shift_rules';
import { detectIE } from './detectBrowser';
/**
 * Adds the info of in and out of the secure room
 * @param {object} data, hsin if a matrix
 **/
function addUser(data, department, userNumner, userName) {
  var jsonUser = {
    user: userName,
    days: []
  };
  data.departments[department].users[userNumner] = jsonUser;
}

function addDay(data, department, userNumner, day, date) {
  if (typeof data.departments[department].users[userNumner].days[day] === 'undefined') {
    var _date = xslxToJsUTCDate(date);
    var jsonDay = {
      in: 0,
      out: 0,
      absent: false,
      date: {
        day: _date.getUTCDate(),
        year: _date.getUTCFullYear(),
        month: _date.getUTCMonth()
      },
      entrys: []
    };
    data.departments[department].users[userNumner].days[day] = jsonDay;
  }
}

function addDepartment(data, department) {
  var jsonDeparment = {
    users: []
  };
  data.departments[department] = jsonDeparment;
}

export function clean(data) {
  for (var d = 0; d < data.length; d++) {
    if (isEmpty(data[d])) {
      data.splice(d, 1);
      d--;
    } else {
      for (var x = 0; x < data[d].length; x++) {
        if (
          typeof data[d][x] === 'undefined' ||
          data[d][x] === null ||
          data[d][x] === '' ||
          data[d][x] === undefined ||
          data[d][x] === null
        ) {
          data[d].splice(x, 1);
          x--;
        }
      }
    }
  }
}
/**
 * Process the data and thows it into a class
 * @param {object} data, hsin if a matrix
 **/
export async function process(data) {
  let dataout = {
    departments: {}
  };
  let department = '';
  let userNumner = '';
  let timeregex = /[0-9]{2}:[0-9]{2}/;
  let nameregex = /^(([\u00C0-\u017Fa-zA-ZñÑ+]+\s{0,1})+)+\s*,\s*(([\u00C0-\u017Fa-zA-ZñÑ+]+\s{0,1})+)+\s*[\D\s()a-zA-Z]*#([0-9]+)/; // /^([\wñÑ+\s*]+)+,\s*([\wñÑ+\s*]+)\s*(\W\s*[\w+\s*]*\s*\W)*\s*#([0-9]+)/; // /^([\wñÑ+\s*]+)+,\s*([\wñÑ+\s*]+)#([0-9]+)/;
  let start, sampePeriod,
    end = '';
  let seregex = /[0-9]+(?=.?)/g;
  let fileDateTag = data[9][56];
  if (fileDateTag === 'From:') {
    let s = data[9][64].match(seregex);
    let e =data[9][73].match(seregex);
    start = new Date(s[2],Number(s[1])-1,s[0],s[3],s[4],s[5])
    end =new Date(e[2],Number(e[1])-1,e[0],e[3],e[4],e[5])
    sampePeriod = (s[2] === e[2] && s[1]===e[1])
    console.log('process dates' ,start,end)
  }
  for (let d = 0; d < data.length; d++) {
    //------In For->
    if (!isEmpty(data[d])) {
      let departmentUser = data[d][6];
      let dateTag = data[d][0];

      //----Switch->
      switch (dateTag) {
        case 'Department :':
          department = departmentUser;
          addDepartment(dataout, department);
          break;
        case 'User Name :':
          let nameArr = nameregex.exec(departmentUser);
          userNumner = nameArr[5];
          addUser(dataout, department, userNumner, nameArr[1].trim() + ',' + nameArr[3].trim());
          break;
        default:
          if (Number.isInteger(dateTag)) {
            let _in = timeregex.exec(data[d][9]);
            let _out = timeregex.exec(data[d][33]);
            let _day = data[d][5].toUpperCase();
            let _timeIn = data[d][63];
            let _absent = data[d][71];

            let days = dataout.departments[department].users[userNumner].days;

            addDay(dataout, department, userNumner, _day, dateTag);

            days[_day].in = _in && _in.input.includes('*') ? _in[0] : days[_day].in;
            days[_day].out = _out && _out.input.includes('*') ? _out[0] : days[_day].out;
            days[_day].absent = _absent === 'Absence' ? true : false;

            if (_in || _out) {
              let entry = {
                in: _in ? _in[0] : -1,
                out: _out ? _out[0] : -1,
                timeIn: _timeIn,
                xlstime: true
              };
              days[_day].entrys.push(entry);
            }
          }
          break;
      }

      //<----Switch
    }
    //<-----In For
  }

  return await attendance(dataout, {department,start,end,sampePeriod});
}
export async function porcess2(data) {
  let currentUserID = -1;
  let dataout = {
    departments: {}
  };
  let daysOfWeak = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  let deptregex = /(^(([\w]+.{0,1})+)(ENTRY|EXIT){1})/;
  let entrys = [];
  let targetLocation = 'USAA Office';
  let userEnd = 0;
  let userStart = 0;

  for (var d = 1; d < data.length; d++) {
    let loc = data[d][5];
    let message = data[d][9];

    loc = deptregex.exec(loc);

    if (
      loc !== null &&
      loc[2].trim() === targetLocation &&
      !message.toLowerCase().includes('access denied')
    ) {
      let card = data[d][10];
      let date = xslxToJsUTCDate(data[d][1]);
      let fname = data[d][6];
      let lname = data[d][7];
      let time = data[d][2];
      let week = daysOfWeak[date.getDay()];

      if (currentUserID === -1) {
        currentUserID = card;
        dataout.departments[loc[2].trim()] = {
          users: {}
        };
      } else if (card !== currentUserID || d === data.length - 1) {
        //------------------Process previous user--------------------------
        process2user(entrys, dataout, currentUserID);
        entrys = [];
        //--------------------------------
        currentUserID = card;
      }

      entrys.push({
        date: date,
        week: week,
        time: time,
        io: loc[4],
        user: fname + ' ' + lname,
        dep: loc[2].trim()
      });
    }
  }

  return await attendance(dataout);
}
const filteredEntryPerDay = function(entrys, day) {
  return entrys.filter(entry => entry.week === day);
};
const process2user = function(entrys, dataout, id) {
  let daysOfWeak = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  entrys.sort((a, b) => (a.time > b.time ? 1 : b.time > a.time ? -1 : 0));
  entrys.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));

  let uid = { user: '', days: {} };
  uid.user = entrys[0].user;
  for (let day in daysOfWeak) {
    let _entrys = filteredEntryPerDay(entrys, daysOfWeak[day]);

    uid.days[daysOfWeak[day]] = {
      date: {},
      enrtys: [],
      in: 0,
      out: 0,
      timeIn: 0,
      absent: false
    };
    //console.log(_entrys[0]  )
    if (_entrys[0] !== null) {
      //console.log(day +' '+fname+" "+lname)
      let _in = _entrys[0].io === 'ENTRY' ? _entrys[0].time : 0;
      let _out = _entrys[_entrys.length - 1].io === 'EXIT' ? _entrys[_entrys.length - 1].time : 0;
      let timeIn = 0;

      uid.days[daysOfWeak[day]].in = _in;
      uid.days[daysOfWeak[day]].out = _out;
      uid.days[daysOfWeak[day]].date = {
        day: entrys[0].date.getUTCDate(),
        year: entrys[0].date.getUTCFullYear(),
        month: entrys[0].date.getUTCMonth()
      };

      for (let e = 0; e < _entrys.length; e += 2) {
        let _start = 0;
        let _end = 0;
        if (_entrys[e] != null && _entrys[e].io === 'ENTRY') {
          _start = _entrys[e].time;
        } else {
          //console.log('Start Error '+e+" "+ _entrys.length)
          //console.log(_entrys[e])
          e--;
        }
        if (_entrys[e + 1] != null && _entrys[e + 1].io === 'EXIT') {
          _end = _entrys[e + 1].time;
        } else {
          //console.log('End Error '+(e+1)+" "+ _entrys.length)
          //console.log(_entrys[e+1])
          e--;
        }

        let _time = strTimeToDate(_end) - strTimeToDate(_start);
        if (_start === 0 && _entrys.length !== 1) {
          _time = 0;
        }
        if (_end === 0 && _entrys.length > e + 2) {
          _time = 0;
        }
        let _entry = {
          in: _start,
          out: _end,
          timeIn: _time,
          xlslTime: false
          //user: _entrys[e]!=null?_entrys[e].user:'Who owns this'
        };
        uid.days[daysOfWeak[day]].enrtys.push(_entry);
        timeIn += _time;
      }
      uid.days[daysOfWeak[day]].timeIn = timeIn;
      uid.days[daysOfWeak[day]].absent = _in === 0 && _out === 0 ? true : false;
      dataout.departments[entrys[0].dep].users[id] = uid;
    }
  }
  fillDates(uid.days);
};
function fillDates(days) {
  let ref = null;
  let daysOfWeak = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  for (let day in daysOfWeak) {
    if (!isEmpty(days[daysOfWeak[day]].date)) {
      ref = days[daysOfWeak[day]].date;
      break;
    }
  }

  let date = new Date(ref.year, ref.month, ref.day);
  let wd = date.getWeek();
  let offcet = wd === 0 ? 7 : wd;

  for (let day in daysOfWeak) {
    if (isEmpty(days[daysOfWeak[day]].date)) {
      var newDay = new Date(date);
      newDay.setDate(date.getDate() + (day - offcet));
      days[daysOfWeak[day]].date = {
        day: newDay.getUTCDate(),
        year: newDay.getUTCFullYear(),
        month: newDay.getUTCMonth()
      };
    }
  }
}

async function attendance(attendance, fileData) {
  //var t0 = performance.now();
  let usersOut = [];
  let dayOut = [];
  let pad = attendance.departments;
  for (let d in pad) {
    for (let x in pad[d].users) {
      //---------------------------------USERS-------------------------------
      let user = {
        name: pad[d].users[x].user.toUpperCase().trim(),
        room: d,
        badge: x
      };
      let userResponce = 0;

      //userResponce = await addUpdate(user, user.name, tableStructures.attendance.object_stores.users, 'name', 'user_id');

      userResponce = user.badge;

      usersOut.push(user);
      //delete showProgress('Reading User #' + userResponce);

      // --------------------------------DAYS--------------------------------
      for (let y in pad[d].users[x].days) {
        let _in = pad[d].users[x].days[y].in;
        let _out = pad[d].users[x].days[y].out;
        let shift = getShift(_in, _out);
        let _day = pad[d].users[x].days[y].date.day;
        let _year = pad[d].users[x].days[y].date.year;
        let _month = pad[d].users[x].days[y].date.month;
        let firstDay = pad[d].users[x].days['MONDAY'].date;
        let weekDate = new Date(firstDay.year, firstDay.month, firstDay.day);
        let timeIn = 0;
        let xlstime = true;
        /*Get the time inside the work area
        //condidering that if there is no exit before mid night count the time till the lat entry to midnight
        //condidering that if there is first entry count the time from  midnight till first exit*/
        let firstIn = -1;
        let lastOut = -1;
        let lastIn = -1;
        let firstOut = -1;

        for (let z in pad[d].users[x].days[y].entrys) {
          let entrys = pad[d].users[x].days[y].entrys;
          timeIn += entrys[z].timeIn;
          firstIn = firstIn === -1 && entrys[z].in !== -1 ? entrys[z].in : firstIn;
          lastOut = entrys[z].out !== -1 ? entrys[z].out : lastOut;
          firstOut = firstOut === -1 && entrys[z].out !== -1 ? entrys[z].out : firstOut;
          lastIn = entrys[z].in !== -1 ? entrys[z].in : lastIn;
          if (Number(z) === entrys.length - 1) {
            xlstime = entrys[z].xlstime;
            if (_in !== 0 && _out === 0) {
              if (isTimeNightS(lastIn, true)) {
                //timeIn >= 0.291667 )
                //console.log("in: "+_in +" out: "+_out+" fi:"+firstIn+" fo:"+firstOut+" li:"+lastIn+" lo:"+lastOut+" "+user.name)
                timeIn += getMidNightTime(lastIn, true, entrys[z].xlstime);
              } else {
                _out = entrys[z].out;
              }
            } else if (_in === 0 && _out !== 0) {
              if (isTimeNightS(firstOut, false)) {
                //console.log("in: "+_in +" out: "+_out+" fi:"+firstIn+" fo:"+firstOut+" li:"+lastIn+" lo:"+lastOut+" "+user.name)
                timeIn += getMidNightTime(firstOut, false, entrys[z].xlstime);
              } else {
                _in = entrys[0].in;
              }
            }
          }
          //delete showProgress(
          //delete  'Processing User #' + userResponce + ' day:' + x + ' processing entry #' + z
          //delete );
        }
        let dbT = msToTime(timeIn * 86400000);
        let time_inTest = new Date(timeIn * 86400000);
        let minTimeIn = new Date(
          0,
          0,
          0,
          shift_rules.shifltLenght.hh,
          shift_rules.shifltLenght.mm,
          shift_rules.shifltLenght.ss
        );
        /*if (pad[d].users[x].days[y].entrys.length != 0)
          console.log(
            user.name +
              ' in:' +
              _in +
              ' Out:' +
              _out +
              'OnTime: ' +
              shift.onTime +
              ' Time in %c' +
              dbT.hh +
              ':' +
              dbT.mm +
              ':' +
              dbT.ss +
              ' %c' +
              shift.shift +
              ' %c' +
              (_year + '/' + _month + '/' + _day),
            'color: #e2dd34',
            'color: #00ff15',
            'color: #e2dd34'
          );*/
        let day = {
          user_id: userResponce,
          day_of_week: y.toUpperCase().trim(),
          absent: pad[d].users[x].days[y].absent,
          day: _day,
          month: _month+1,
          year: _year,
          in: _in,
          time_in: xlstime ? timeIn : timeIn / 8.64e7,
          out: _out,
          shift: shift.shift,
          on_time: shift.onTime,
          week_number: weekDate.getWeek()
        };
        //delete showProgress('Processing User #' + userResponce + ' day:' + y);
        /*if (detectIE() === false){
          let dayResponce = await addUpdate(
            day,
            [day.year, day.month, day.day, day.user_id],
            tableStructures.attendance.object_stores.days,
            'date_user',
            'id'
          );
        }*/
        //change day.user_id to usersOut.length for explorer
        dayOut.push(day);
      }
    }
  }
  //let t1 = performance.now();
  //delete enableLoading(false);

  return { users: usersOut, days: dayOut,  data:fileData  };
  //alert('Attendance local upload process done in: '+((t1-t0)/1000)+' sec');
}

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday) withch is the default for the iso,
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
Date.prototype.getWeek = function(dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com , edited by mrtsherman form stackoverflow and Agustin Juarez form hcl */

  dowOffset = typeof dowOffset == 'number' ? dowOffset : 1; //default dowOffset to zero
  let newYear = new Date(this.getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  let daynum =
    Math.floor(
      (this.getTime() -
        newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
        86400000
    ) + 1;
  let weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      let nYear = new Date(this.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
                    the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  if (weeknum === 0) {
    let temp = new Date(this.getFullYear(), 11, 31);
    weeknum = temp.getWeek(dowOffset);
  }
  return weeknum;
};
