var Excel, config, logger;

Excel = require('exceljs');

logger = require('aitutils').aitutils.logger;

config = require("../lib/configuration").Configuration;

exports.Xlsx = {
  objectToXlsx: function(object, filename) {
    var mySheet, options, workbook;
    options = {
      filename: filename,
      useStyles: true,
      useSharedStrings: true
    };
    workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    mySheet = workbook.addWorksheet("My Sheet");
    mySheet.columns = [
      {
        header: "ID",
        key: "id",
        width: 10
      }, {
        header: "Name",
        key: "name",
        width: 32
      }, {
        header: "DOB",
        key: "dob",
        width: 10
      }
    ];
    mySheet.addRow({
      id: 1,
      name: "johndoe",
      dob: "date"
    });
    mySheet.addRow({
      id: 2,
      name: "janedoe",
      dob: "date"
    });
    return workbook.commit();
  }
};
