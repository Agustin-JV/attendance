import { strTimeToDate, lazyStrToDate, isAny } from './utils';
import shift_rules from './shift_rules.json';
import { union, intersec } from './array_operations';
/**
 * Retruns true | false if _in is earlyer than the
 * spesified time, having into account the tolerance.
 * @param {String} _in Time
 * @param {String} time Time
 * @return {Boolean} notLate(true), Late(false)
 **/
function notLate(_in, time, tolerance) {
  _in = strTimeToDate(_in);
  time = strTimeToDate(time);

  //tolerance is in minutes and we transform it to miliseconds
  if (_in > time && _in - time >= tolerance * 60000) {
    return false;
  } else {
    return true;
  }
}
/**
 * Retruns true | false if _in is earlyer than the spesified
 * shift, having into account the tolerance.
 * @param {String} _in Time
 * @param {String} shift DAY|MORNING|NIGHT
 * @return {Boolean} onTime(true), Late(false)
 **/
export function onTime(_in, shift) {
  switch (shift) {
    case 'day':
      return notLate(_in, shift_rules.shifts.day.in, shift_rules.tolerance);
    case 'morning':
      return notLate(_in, shift_rules.shifts.morning.in, shift_rules.tolerance);
    case 'night':
      return notLate(_in, shift_rules.shifts.night.in, shift_rules.tolerance);
    default:
      break;
  }
}
/**
 * Gets The shift and if the arvial is on time or not
 * Its an overcomboluter prosses for this maby simple problem
 * @param {string} in  => ex:'10:15'
 * @param {string} out => ex:'10:15'
 * @return { Obj } day {onTime:t/f, shift:day|night|morning|nl|nday|night end}
 */
export function getShift(_in, _out) {
  let start = [];
  let end = [];
  let colorOnTime = 'color: #00ff15';
  let colorOnLate = 'color: #e500ff';
  let _onTime = false;
  let shift = 'any';
  if (_in !== 0 && _out !== 0) {
    for (let x in shift_rules.shifts) {
      let shift = shift_rules.shifts[x];
      if (inTimeRange(_in, shift.in, shift.out, shift_rules.inRangeTolerance)) {
        start.push(x);
      }
      if (inTimeRange(_out, shift.in, shift.out, shift_rules.inRangeTolerance)) {
        end.push(x);
      }
    }
    if (start.length === 2 && end.length === 2) {
      let merge = union(start, end);
      for (let x in merge) {
        if (onTime(_in, merge[x])) {
          _onTime = true;
          start = merge[x];
        }
      }
      if (_onTime) {
        shift = start;
        //console.log("%c"+data +"%c OnTime  %c"+start, 'color: #ffffff',colorOnTime,' color: #f40000');
      }
      //console.log("%c"+data +"%c Late  %c ANY", 'color: #ffffff',colorOnLate,' color: #f40000');
      //console.log("%c"+data +" %c"+JSON.stringify(start), 'color: #ffffff', ' color: #f40000');
    } else {
      let _intersec = intersec(start, end);
      if (_intersec.length === 0) {
        //Almost Certain a General Office work 8am-5pm
        if (inTimeRange(_in, 8, 17, shift_rules.inRangeTolerance)) {
          shift = 'nday';
        }
        if (inTimeRange(_out, 8, 17, shift_rules.inRangeTolerance)) {
          shift = 'nday';
        }
        //console.log("%c"+data +" %c"+start+" "+end, 'color: #ffffff', ' color: #e2dd34');
      } else {
        if (onTime(_in, _intersec[0])) {
          _onTime = true;
          shift = _intersec[0];
          //console.log("%c"+data +"%c OnTime  %c"+intersec[0], 'color: #ffffff',colorOnTime,' color: #bada55');
        } else {
          //console.log("%c"+data +"%c Late  %c"+intersec[0], 'color: #ffffff',colorOnLate,' color: #bada55');
        }
      }
    }
  } else {
    if (_in !== 0) {
      shift = 'night';
      if (onTime(_in, 'night')) {
        _onTime = true;
        //console.log("%c"+data +"%c OnTime  %c Ns", 'color: #ffffff',colorOnTime,' color: #be41f4');
      } else {
        //console.log("%c"+data +"%c Late  %c NS", 'color: #ffffff',colorOnLate,' color: #be41f4');
      }
      //console.log("%c"+data +" %c"+(_in===0?" end NS":" start NS"),'color: #ffffff', ' color: #be41f4');
    } else if (_out !== 0) {
      shift = 'night end';
    } else {
      shift = 'nl';
      //console.log("%c NotLaboral", ' color: #4286f4');
    }
  }
  return {
    onTime: _onTime,
    shift: shift
  };
}
export function getShiftv2(_in, _out, day, userShifts, code) {
  if (_in === 0 && _out === 0) {
    return { onTime: false, shift: 'absent' };
  } else {
    let shift = 'absent';
    let onTime = false;
    _in = lazyStrToDate(_in);
    let _isWeekend = isWeekend(day);
    if (_in !== 0 && _out !== 0 && isAny(code, ['S', 'MS'])) {
      if (_isWeekend) {
        switch (code) {
          case 'MS':
            onTime = onTimeLazy(_in, userShifts.morning);
            break;
          case 'S':
            onTime = onTimeLazy(_in, userShifts.day);
            break;
          default:
            break;
        }
      } else {
        onTime = onTimeLazy(_in, userShifts.day);
      }
    } else if (code === 'NS') {
      onTime = onTimeLazy(_in, userShifts.night);
    }
    switch (code) {
      case 'S':
        shift = 'day';
        break;
      case 'MS':
        shift = 'morning';
        break;
      case 'NS':
        shift = 'night';
        break;
      default:
        shift = code;
        break;
    }
    return { onTime: onTime, shift: shift };
  }
}
export function isWeekend(day) {
  if (typeof day === 'string') day = day.toUpperCase();
  return isAny(day, ['SUNDAY', 'SATURDAY', 0, 6]);
}
function onTimeLazy(_in, rule) {
  let tolerance = new Date(0, 0, 0, 0, shift_rules.tolerance, 0);
  rule = shiftRuleToDates(rule);
  return _in <= rule.in + tolerance;
}
/** ssr: shifts rules []*/
/*function onTimeOnlyS (_in, _out, rules) {
    let tolerance = new Date(0, 0, 0, 0, shift_rules.tolerance, 0);
    let earlyTolerance = new Date(0, 0, 0, shift_rules.inRangeTolerance, 0);
    let shift = -1;
    for (let x in rules) {
      let rule = shiftRuleToDates(rules[x]);
      if (rules.length === 1) return _in <= rule.in + tolerance;
      else {
        let eval1 = _in < rule.in + tolerance && _out > rule.in;
        let eval2 = _in >= rule.in - earlyTolerance;
        //if(eval1&&!eval2){console.log("Someone arrived way to early")}
        if (eval1) shift = x;
        if (eval1 && eval2) return [x, x];
      }
    }
    return [x, -1];
}*/
function shiftRuleToDates(rule) {
  let output = { in: 0, out: 0 };
  output.in = lazyStrToDate(rule.in);
  output.out = lazyStrToDate(rule.out);
  return output;
}
function inTimeRange(time, start, end, tolerance, dir) {
  dir = dir || 0;
  time = time === 0 ? 0 : strTimeToDate(time).getHours();
  start = typeof start === 'number' ? start : strTimeToDate(start).getHours();
  end = typeof end === 'number' ? end : strTimeToDate(end).getHours();

  if (
    time >= start - (dir === 0 || dir === -1 ? tolerance : 0) &&
    time <= end + (dir === 0 || dir === 1 ? tolerance : 0)
  ) {
    return true;
  } else {
    return false;
  }
}
