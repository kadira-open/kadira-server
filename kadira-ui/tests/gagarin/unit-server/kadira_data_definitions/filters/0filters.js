describe("kadira_data_definitions.filters", function() {
  describe("fillOutZeros", function() {
    it("fillout all points 1min res", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 28, 11, 39);
      var data  = [];
      var res = "1min";

      var expectedResult = [];

      for (var i = 0; i < 60; i++) {
        var minute = 1000 * 60;
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + minute * i)
          },
          resTime: 0
        };
        expectedResult.push(item);
      }

      var result = fillOutZeros(data, res, startDate, endDate);

      expect(result).to.be.eql(expectedResult);
    });

    it("fillout all points 30min res", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 29, 10, 39);
      var data  = [];
      var res = "30min";

      var expectedResult = [];

      for (var i = 0; i < 48; i++) {
        var min30 = 1000 * 60 * 30;
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + min30 * i)
          },
          resTime: 0
        };
        expectedResult.push(item);
      }

      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);

    });

    it("fillout all points 3hour res", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 5, 4, 10, 39);
      var data  = [];
      var res = "3hour";

      var expectedResult = [];

      for (var i = 0; i < 56; i++) {
        var hour3 = 1000 * 3600 * 3;
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + hour3 * i)
          },
          resTime: 0
        };
        expectedResult.push(item);
      }

      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);
    });

    it("fillout with 2 middle point 1min", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 28, 11, 9);
      var minute = 1000 * 60;
      var data  = [];
      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 12))
        },
        resTime: 140
      });

      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 26))
        },
        resTime: 240
      });
      var res = "1min";

      var expectedResult = [];
      var dataPointIndex1 = 12;
      var dataPointIndex2 = 26;
      for (var i = 0; i < 30; i++) {
        var resTime = 0;
        if(i === dataPointIndex1){
          resTime = 140;
        }
        if(i === dataPointIndex2){
          resTime = 240;
        }
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + minute * i)
          },
          resTime: resTime
        };
        expectedResult.push(item);
      }
      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);

    });

    it("fillout with 1 middle points 3hour", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 5, 4, 10, 39);
      var hour3 = 1000 * 3600 * 3;
      var data  = [];
      data.push({
        _id: {
          time: new Date(startDate.getTime() + (hour3 * 28))
        },
        resTime: 140
      });
      var res = "3hour";

      var expectedResult = [];
      var dataPointIndex1 = 28;

      for (var i = 0; i < 56; i++) {
        var resTime = 0;
        if(i === dataPointIndex1){
          resTime = 140;
        }
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + hour3 * i)
          },
          resTime: resTime
        };
        expectedResult.push(item);
      }
      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);

    });

    it("fillout with 10 front points 30min", function () {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 29, 10, 39);
      var data  = [];
      var res = "30min";
      var min30 = 1000 * 60 * 30;
      for (var i = 0; i < 10; i++) {
        data.push({
          _id: {
            time: new Date(startDate.getTime() + (min30 * i))
          },
          resTime: 140
        });
      }

      var expectedResult = [];

      for (var j = 0; j < 48; j++) {
        var resTime = 0;
        if(j < 10){
          resTime = 140;
        }
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + min30 * j)
          },
          resTime: resTime
        };
        expectedResult.push(item);
      }

      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);

    });

    it("fillout with 10 last points 3hour", function () {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 5, 4, 10, 39);
      var hour3 = 1000 * 3600 * 3;
      var data  = [];
      var res = "3hour";

      for (var i = 46; i < 56; i++) {
        data.push({
          _id: {
            time: new Date(startDate.getTime() + (hour3 * i))
          },
          resTime: 140
        });
      }

      var expectedResult = [];

      for (var j = 0; j < 56; j++) {
        var resTime = 0;
        if(j >= 46 && j <= 56) {
          resTime = 140;
        }
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + hour3 * j)
          },
          resTime: resTime
        };
        expectedResult.push(item);
      }

      var result = fillOutZeros(data, res, startDate, endDate);
      expect(result).to.be.eql(expectedResult);

    });

    it("fillout single host 1min", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 28, 11, 9);
      var minute = 1000 * 60;
      var data  = [];
      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 12)),
          host: "hostname"
        },
        resTime: 140
      });

      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 26)),
          host: "hostname"
        },
        resTime: 240
      });
      var res = "1min";

      var expectedResult = [];
      var dataPointIndex1 = 12;
      var dataPointIndex2 = 26;
      for (var i = 0; i < 30; i++) {
        var resTime = 0;
        if(i === dataPointIndex1){
          resTime = 140;
        }
        if(i === dataPointIndex2){
          resTime = 240;
        }
        var item =  {
          _id: {
            time: new Date(startDate.getTime() + minute * i),
            host: "hostname"
          },
          resTime: resTime
        };
        expectedResult.push(item);
      }
      var result = fillOutZeros(data, res, startDate, endDate, true);
      expect(result).to.be.eql(expectedResult);

    });
    it("fillout 2 hosts 1min", function() {
      var startDate = new Date(2015, 4, 28, 10, 40);
      var endDate = new Date(2015, 4, 28, 11, 10);
      var minute = 1000 * 60;
      var data  = [];
      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 11)),
          host: "hostname1"
        },
        resTime: 140
      });

      data.push({
        _id: {
          time: new Date(startDate.getTime() + (minute * 26)),
          host: "hostname2"
        },
        resTime: 240
      });

      var res = "1min";

      var expectedResult = [];
      var dataPointIndex1 = 11;
      var dataPointIndex2 = 26;
      for (var i = 0; i < 30; i++) {
        var resTime1 = 0;
        var resTime2 = 0;

        if(i === dataPointIndex1){
          resTime1 = 140;
        }
        if(i === dataPointIndex2){
          resTime2 = 240;
        }
        var item1 =  {
          _id: {
            time: new Date(startDate.getTime() + minute * i),
            host: "hostname1"
          },
          resTime: resTime1
        };

        var item2 =  {
          _id: {
            time: new Date(startDate.getTime() + minute * i),
            host: "hostname2"
          },
          resTime: resTime2
        };

        expectedResult.push(item1);
        expectedResult.push(item2);
      }
      var result = fillOutZeros(data, res, startDate, endDate, true);
      expect(result).to.be.eql(expectedResult);

    });

    it("leave data empty if no host data available", function() {
      var startDate = new Date(2015, 4, 28, 10, 39);
      var endDate = new Date(2015, 4, 28, 11, 9);
      var data  = [];
      var res = "1min";

      var expectedResult = [];

      var result = fillOutZeros(data, res, startDate, endDate, true);

      expect(result).to.be.eql(expectedResult);
    });
  });
});

function fillOutZeros(data, res, startDate, endDate, groupByHost) {
  var result = GlobalServer.execute(
  function(data, res, startDate, endDate, groupByHost) {
    var addZerosFunc = KadiraDataFilters.addZeros(["resTime"]);
    var args = {
      query: {
        "value.res": res,
        "value.startTime": {
          "$gte": startDate,
          "$lt": endDate
        }
      }
    };
    if(groupByHost){
      args.groupByHost = true;
    }

    return addZerosFunc(data, args);

  }, [data, res, startDate, endDate, groupByHost]);
  return result;
}