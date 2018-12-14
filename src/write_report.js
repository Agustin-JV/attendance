export const XLSX = require('xlsx');
var fileDownload = require('js-file-download');
//"use strict";
/**
 * Revies one array of the columns for the extra for sundays
 * and another array for the extra pay for the shifts
 */
export function finalReport(sundays, shiftAllowance, showAllEntrys) {
  let wb = {
    SheetNames: ['EXGRATIAGEO', 'SHIFTALLOWANCEGEO'],
    Sheets: {
      EXGRATIAGEO: sheet1(sundays),
      SHIFTALLOWANCEGEO: sheet2(shiftAllowance)
    }
  };

  var name =
    'Attendance_Report_' +
    (showAllEntrys ? 'with_nonpayed_entrys' : '') +
    new Date().toISOString() +
    '_.xlsx';

  const wbout = XLSX.write(wb, { bookType:'xlsx', bookSST:false, type:'array'  });

  fileDownload(wbout, name);
}
function sheet1(rows) {
  let header = {
    sapid: 'Emp Code',
    username: 'Emp Name',
    amount: 'Amount',
    startdate: 'From Date (MM/DD/YYYY)',
    enddate: 'From Date (MM/DD/YYYY)',
    remark: 'Remarks',
    currency: 'Currency Type'
  };
  let sheetobj = [header, ...rows];
  let ws = XLSX.utils.json_to_sheet(sheetobj, { skipHeader: true });
  // the with is the small number you see on excel when you drag the columns
  ws['!cols'] = [cf(11.43), cf(29), cf(22), cf(28.86), cf(28.86), cf(10.71), cf(13)];
  return ws;
}
function cf(width, hidden) {
  hidden = hidden || false;
  let ColInfo = {
    hidden: hidden, // if true, the column is hidden
    width: width // width in Excel's "Max Digit Width", width*256 is integral
  };
  return ColInfo;
}
function sheet2(rows) {
  let header = {
    sapid: 'SAP ID',
    username: 'Employee Name',
    amount: 'Amount',
    client: 'Client Name',
    project: 'Project Name',
    projectCode: 'Project Code',
    rmCode: 'RM Code',
    shiftDate: 'Shift Date (MM/DD/YYYY)',
    startTime: 'Start Time (AM/PM)',
    endTime: 'End Time (AM/PM)',
    remark: 'Remarks'
  };
  let sheetobj = [header, ...rows];
  let ws = XLSX.utils.json_to_sheet(sheetobj, { skipHeader: true });
  // the with is the small number you shee on excel when you drag the columns
  ws['!cols'] = [
    cf(8.29),
    cf(28.0),
    cf(9.71),
    cf(11.29),
    cf(17.86),
    cf(13.86),
    cf(10.57),
    cf(23.43),
    cf(18.0),
    cf(17.14),
    cf(14.29)
  ];
  return ws;
}
