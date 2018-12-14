//@ts-check
import shift_rules from './shift_rules.json';
import {  isEmpty, isAny, msToTime, getNextDay } from './utils';
import { finalReport } from './write_report';

/**
 * @typedef {Object} OldUser
 * @property {string} client
 * @property {string} name
 * @property {string} project
 * @property {string} projectCode
 * @property {numner} rmCode 10000002
 * @property {string} room
 * @property {number} sap_id 10000001
 * @property {number} user_id
 */
/**
 * @typedef {Object} User
 * @property {string} client
 * @property {string} name
 * @property {string} project
 * @property {string} projectCode
 * @property {numner} rmCode 10000002
 * @property {string} room
 * @property {number} sap_id 10000001
 * @property {number} badge 7
 */
/**
 * @typedef {Object} InappUser
 * @property {string} client
 * @property {string} name
 * @property {string} project
 * @property {string} project_code
 * @property {numner} rm_sap_id 10000002
 * @property {string} [room]
 * @property {number} sap_id 10000001
 * @property {number} badge 15
 */
/**
 * @typedef {Object} OldWSINF
 * @property {string} code
 * @property {number} day
 * @property {number} day_of_week
 * @property {number} id 15
 * @property {string} month october
 * @property {number} year 2018
 * @property {number} user_id 7
 */

/**
 * @typedef {Object} WSINF
 * @property {string} code
 * @property {number} day
 * @property {number} [user_id] 15
 * @property {number} month 9
 * @property {number} year 2018
 */

/**
 * @typedef {Object} DayFormat
 * @property {string} absent
 * @property {number} day
 * @property {number} id
 * @property {string} in
 * @property {number} month
 * @property {string} on_time
 * @property {string} shift
 * @property {number} time_in
 * @property {number} week_number
 * @property {number} user_id  = badge
 * @property {number} year 2018
 */

//let output = { weekReports: [], sundayReports: [] };
/**
 * @param {User[]} users
 * @param {WSINF[]} shifts
 * @param {DayFormat[]} days
 * @param {boolean} [showAllEntry]
 */
export function calc(users, shifts, days, showAllEntrys = false) {
  let output = { weekReports: [], sundayReports: [] };
 
  users.forEach(user => {
    let userShift = shifts.filter(shift => shift.user_id === user.sap_id);
    let userDays = days.filter(day => day.user_id === user.badge);
    console.log('userDays', userDays);
    output = processUserWSINF(user, userShift, userDays, showAllEntrys, output);
  });
  console.log(output);
  finalReport(output.sundayReports, output.weekReports, showAllEntrys);
}

/**
 * @param {User} user
 * @param {WSINF[]} shifts
 * @param {DayFormat[]} days
 * @param {boolean} showAllEntrys
 */

function processUserWSINF(user, shifts, days, showAllEntrys, output) {
  //Get all wsinf for the user
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

  //console.log(user.name,wsinfs)
  //Iterate all shifts in peridod
  for (let x in shifts) {
    let shift = shifts[x];
    //console.log(user.name+" "+wsinfs[x])
    //only evaluetes shifts that ara S, NS, MS ...
    if (isAny(shift.code, 'S', 'NS', 'MS')) {
      let amount = 0;
      // needs work
      let day = days.find(
        day => day.year === shift.year && day.month === shift.month && day.day === shift.day
      );
      if (!isEmpty(day)) {
        //Process week to manage latenes and reset the pay mult
        if (currentWeek !== day.week_number) {
          for (let y in weekReports) {
            //TODO uncoment this if
            if (showAllEntrys || (payMult !== 0 && weekReports[y].amount !== 0)) {
              weekReports[y].amount *= payMult;
              reports.push(weekReports[y]);
            }
          }

          currentWeek = day.week_number;
          weekReports = [];
          payMult = 1;
        }
        if (isAny(day.shift, ['nday', 'any', 'day', 'night', 'morning'])) {
          let time = msToTime(day.time_in * 86400000);
          let dateTime = new Date(0, 0, 0, 0, 0, 0, day.time_in * 86400000);
          if (shift.code === 'S') {
            //Time inside the room is grater than min time

            if (dateTime > minTimeIn) {
              if (day.day_of_week.includes('SUNDAY') || day.day_of_week.includes('SATURDAY')) {
                amount = shift_rules.weekendBonus;
              } else {
                amount = shift_rules.weekBonus;
              }
            } //else{ console.log('Early leave') }
          } else {
            let nextDate = getNextDay(day.year, day.month, day.day);
            let nextDay = days.find(
              day =>
                day.year === nextDate.getFullYear() &&
                day.month === nextDate.getMonth() &&
                day.day === nextDate.getDate()
            );
            if (!isEmpty(nextDay)) {
              let time2 = msToTime(nextDay.time_in * 86400000);
              time.hh += time2.hh;
              time.mm += time2.mm;
              time.ss += time2.ss;
              nsOut = nextDay.out;
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
          if (day.day_of_week.includes('SUNDAY')) {
            let sundayReport = {
              sapid: user.sap_id,
              username: user.name,
              amount: '25% daily salary',
              startdate: day.month + 1 + '/' + day.day + '/' + day.year,
              enddate: day.month + 1 + '/' + day.day + '/' + day.year,
              remark: 'SUNDAY',
              currency: shift_rules.currency
            };
            sundayReports.push(sundayReport);
          }
        }
        if (!day.on_time && payMult !== 0) {
          payMult -= 0.5;
        }

        let report = {
          sapid: user.sap_id,
          username: user.name,
          amount: !day.absent ? amount : 0,
          client: user.client,
          project: user.project,
          projectCode: user.projectCode,
          rmCode: user.rmCode,
          //+1 to months to convert it to actual date
          shiftDate: day.month + 1 + '/' + day.day + '/' + day.year,
          startTime: day.in,
          endTime: shift.code === 'NS' ? nsOut : day.out,
          remark: 'Shift Allowance'
        };
        console.log(report, day.absent, !day.absent ? amount : 0, report.amount);
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
  return output;
}
