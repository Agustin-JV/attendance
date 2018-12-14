import { all, bounded } from './querys';
import shift_rules from './shift_rules.json';
import { getMonth, isEmpty, isAny, msToTime, getNextDay } from './utils';
import { finalReport } from './write_report';

let output = { weekReports: [], sundayReports: [] };
let index = 0;
let lastOutput = false;
let compleatList = {};

export async function calc() {
  output = { weekReports: [], sundayReports: [] };
  //Get all users and iterate them
  let request = await all('users', 'name', 'cursor');
  await forEachUser(request); //let user = ...
  lastOutput = true;
}
function forEachUser(request, output) {
  return new Promise(function(resolve, reject) {
    request.onsuccess = function(event) {
      let cursor = event.target.result;
      if (cursor) {
        compleatList[index] = false;
        processUserWSINF(cursor.value, index);
        index++;
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = function(event) {};
  });
}
async function processUserWSINF(user, index) {
  //Get all wsinf for the user
  let wsinfs = await bounded.call({ z: user.user_id }, 'wsinf', 'user_id', 'all');
  let currentWeek = 0;
  let payMult = 1;
  let reports = [];
  let weekReports = [];
  let sundayReports = [];
  let nsOut = '00:00';
  let minTimeIn = new Date(
    0,
    0,
    0,
    shift_rules.shifltLenght.hh,
    shift_rules.shifltLenght.mm,
    shift_rules.shifltLenght.ss
  );
  let showAllEntrys = document.getElementById('showAllEntrys').checked;

  //console.log(user.name,wsinfs)
  for (let x in wsinfs) {
    //console.log(user.name+" "+wsinfs[x])
    if (wsinfs[x].code === 'S' || wsinfs[x].code === 'NS') {
      let amount = 0;

      let query = [
        wsinfs[x].year,
        getMonth(wsinfs[x].month, true),
        wsinfs[x].day,
        wsinfs[x].user_id
      ];
      let day = await bounded.call({ z: query }, 'days', 'date_user', 'all');
      if (!isEmpty(day)) {
        //Process week to manage latenes and reset the pay mult
        if (currentWeek !== day[0].week_number) {
          for (let y in weekReports) {
            //TODO uncoment this if
            if (showAllEntrys || (payMult !== 0 && weekReports[y].amount !== 0)) {
              weekReports[y].amount *= payMult;
              reports.push(weekReports[y]);
            }
          }

          currentWeek = day[0].week_number;
          weekReports = [];
          payMult = 1;
        }
        if (isAny(day[0].shift, ['nday', 'any', 'day', 'night', 'morning'])) {
          let time = msToTime(day[0].time_in * 86400000);
          let dateTime = new Date(0, 0, 0, 0, 0, 0, day[0].time_in * 86400000);
          if (wsinfs[x].code === 'S') {
            //Time inside the room is grater than min time

            if (dateTime > minTimeIn) {
              if (
                day[0].day_of_week.includes('SUNDAY') ||
                day[0].day_of_week.includes('SATURDAY')
              ) {
                amount = shift_rules.weekendBonus;
              } else {
                amount = shift_rules.weekBonus;
              }
            } //else{ console.log('Early leave') }
          } else {
            let nextDate = getNextDay(day[0].year, day[0].month, day[0].day);
            let nextQuery = [
              nextDate.getFullYear(),
              nextDate.getMonth(),
              nextDate.getDate(),
              wsinfs[x].user_id
            ];
            let nextDay = await bounded.call({ z: nextQuery }, 'days', 'date_user', 'all');
            if (!isEmpty(nextDay)) {
              let time2 = msToTime(nextDay[0].time_in * 86400000);
              time.hh += time2.hh;
              time.mm += time2.mm;
              time.ss += time2.ss;
              nsOut = nextDay[0].out;
              if (dateTime - minTimeIn >= 0) {
                amount = shift_rules.nightBonus;
              } //else{ console.log('Early leave') }
            } else {
              nsOut = '???';
              console.log(
                'Manualy check' +
                  user.name +
                  ' ' +
                  nextDate +
                  ' Day not found to match the info for the night shift'
              );
            }
          }
          if (day[0].day_of_week.includes('SUNDAY')) {
            let sundayReport = {
              sapid: user.sap_id,
              username: user.name,
              amount: '25% daily salary',
              startdate: day[0].month + 1 + '/' + day[0].day + '/' + day[0].year,
              enddate: day[0].month + 1 + '/' + day[0].day + '/' + day[0].year,
              remark: 'SUNDAY',
              currency: shift_rules.currency
            };
            sundayReports.push(sundayReport);
          }
        }
        if (!day[0].on_time && payMult !== 0) {
          payMult -= 0.5;
        }

        let report = {
          sapid: user.sap_id,
          username: user.name,
          amount: !day[0].absent ? amount : 0,
          client: user.client,
          project: user.project,
          projectCode: user.projectCode,
          rmCode: user.rmCode,
          //+1 to months to convert it to actual date
          shiftDate: day[0].month + 1 + '/' + day[0].day + '/' + day[0].year,
          startTime: day[0].in,
          endTime: wsinfs[x].code === 'NS' ? nsOut : day[0].out,
          remark: 'Shift Allowance'
        };
        console.log(report, day[0].absent, !day[0].absent ? amount : 0, report.amount);
        weekReports.push(report);
      }
    }
  }
  for (let y in weekReports) {
    //TODO uncoment this if
    if (showAllEntrys || (payMult !== 0 && weekReports[y].amount !== 0)) {
      weekReports[y].amount *= payMult;
      reports.push(weekReports[y]);
    }
  }

  output.weekReports = output.weekReports.concat(reports);
  output.sundayReports = output.sundayReports.concat(sundayReports);
  compleatList[index] = true;

  if (lastOutput && verifyAllDone()) {
    finalReport(output.sundayReports, output.weekReports);
  }
}
function verifyAllDone() {
  let compleate = false;
  for (let x in compleatList) {
    if (compleatList[x]) compleate = compleatList[x];
    else return false;
  }
  return compleate;
}
