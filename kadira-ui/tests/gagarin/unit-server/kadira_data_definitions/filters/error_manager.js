describe("kadira_data_definitions.filters", function() {
  describe("errors.filterErrorsByStatus", function() {
    it("show new errors", function() {
      var result = GlobalServer.execute(function() {
        var mock = sinon.mock(ErrorsMeta);
        mock.expects("find").returns({
          fetch: function() {
            return [{
              type: "client",
              name: "error name",
              appId: "app-id",
              status: "new"
            }];
          }
        });

        var args = {
          "appId": ["KxPGZcZGhA9u7Wer2"],
          "status": "new",
          "query": {
            "value.res": "30min",
            "value.appId": {
              "$in": ["KxPGZcZGhA9u7Wer2"]
            }
          }
        };

        var data = [{
          "_id": {
            "name": "error name"
          }
        }];
        var result = KadiraErrorFilters.filterErrorsByStatus()(data, args);
        mock.restore();
        return result;
      });
      var expectedData = [{
        "_id": {
          "name": "error name"
        },
        "status": "new"
      }];
      expect(result).to.be.eql(expectedData);
    });

    it("show errors with no status as new errors", function() {
      var result = GlobalServer.execute(function() {
        var mock = sinon.mock(ErrorsMeta);
        mock.expects("find").returns({
          fetch: function() {
            return [];
          }
        });

        var args = {
          "appId": ["KxPGZcZGhA9u7Wer2"],
          "status": "new",
          "query": {
            "value.res": "30min",
            "value.appId": {
              "$in": ["KxPGZcZGhA9u7Wer2"]
            }
          }
        };

        var data = [{
          "_id": {
            "name": "error name"
          }
        }];
        var result = KadiraErrorFilters.filterErrorsByStatus()(data, args);
        mock.restore();
        return result;
      });
      var expectedData = [{
        "_id": {
          "name": "error name"
        },
        "status": "new"
      }];
      expect(result).to.be.eql(expectedData);
    });

    it("ignored errors", function() {
      var result = GlobalServer.execute(function() {
        var mock = sinon.mock(ErrorsMeta);
        mock.expects("find").returns({
          fetch: function() {
            return [{
              type: "client",
              name: "error name",
              appId: "app-id",
              status: "ignored"
            }];
          }
        });

        var args = {
          "appId": ["app-id"],
          "showIgnored": false,
          "status": "all",
          "query": {
            "value.res": "30min",
            "value.appId": {
              "$in": ["app-id"]
            }
          }
        };

        var data = [{
          "_id": {
            "name": "error name",
            "type": "client"
          }
        }];
        var result = KadiraErrorFilters.filterErrorsByStatus()(data, args);
        mock.restore();
        return result;
      });
      expectedData = [];
      expect(result).to.be.eql(expectedData);
    });

    it("get error list without status filtering", function() {
      var data = [{
        "_id": {
          "name": "error name1"
        }
      }, {
        "_id": {
          "name": "error name2"
        }
      }];
      var result = GlobalServer.execute(function(data) {
        var mock = sinon.mock(ErrorsMeta);
        mock.expects("find").returns({
          fetch: function() {
            return [];
          }
        });

        var args = {
          "appId": ["KxPGZcZGhA9u7Wer2"],
          "showClosed": true,
          "status": "all",
          "query": {
            "value.res": "30min",
            "value.appId": {
              "$in": ["KxPGZcZGhA9u7Wer2"]
            }
          }
        };

        var result = KadiraErrorFilters.filterErrorsByStatus()(data, args);
        mock.restore();
        return result;
      },  [data]);

      var expectedData = [{
        "_id": {
          "name": "error name1",
        },
        "status": "new"
      }, {
        "_id": {
          "name": "error name2"
        },
        "status": "new"
      }];
      expect(result).to.be.eql(expectedData);
    });

    it("_getAllErrors", function() {
      var result = GlobalServer.execute(function() {
        var data = [{
          "_id": {
            "name": "error name1",
            "type": "method"
          },
          "count": 5,
          "type": "method"
        }, {
          "_id": {
            "name": "error name2",
            "type": "client"
          },
          "count": 2,
          "type": "client"
        }, {
          "_id": {
            "name": "error name3",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }, {
          "_id": {
            "name": "error name4",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }];
        var key = "error name1" + "method";
        var filteredErrorsMetaMap = {};
        filteredErrorsMetaMap[key] = {
          "_id": "eugYwrx7KQZczLxPP",
          "name": "error name1",
          "status": "ignored"
        };
        return KadiraErrorFilters._getAllErrors(data, filteredErrorsMetaMap);
      });

      var expectedData = [{
        "_id": {
          "name": "error name1",
          "type": "method"
        },
        "count": 5,
        "type": "method",
        "status": "ignored"
      }, {
        "_id": {
          "name": "error name2",
          "type": "client"
        },
        "count": 2,
        "type": "client",
        "status": "new"
      }, {
        "_id": {
          "name": "error name3",
          "type": "client"
        },
        "count": 1,
        "type": "client",
        "status": "new"
      }, {
        "_id": {
          "name": "error name4",
          "type": "client"
        },
        "count": 1,
        "type": "client",
        "status": "new"
      }];
      expect(result).to.be.eql(expectedData);
    });

    it("_includeByStatus", function() {
      var result = GlobalServer.execute(function() {
        var data = [{
          "_id": {
            "name": "error name1",
            "type": "method"
          },
          "count": 5,
          "type": "method"
        }, {
          "_id": {
            "name": "error name2",
            "type": "client"
          },
          "count": 2,
          "type": "client"
        }, {
          "_id": {
            "name": "error name3",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }, {
          "_id": {
            "name": "error name4",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }];
        var key = "error name1" + "method";
        var filteredErrorsMetaMap = {};

        filteredErrorsMetaMap[key] = {
          "_id": "eugYwrx7KQZczLxPP",
          "name": "Method not found [404]",
          "status": "fixed"
        };
        return KadiraErrorFilters._includeByStatus(data, 
          filteredErrorsMetaMap, "fixed");
      });

      var expectedData = [{
        "_id": {
          "name": "error name1",
          "type": "method"
        },
        "count": 5,
        "type": "method",
        "status": "fixed"
      }];
      expect(result).to.be.eql(expectedData);
    });
    it("_excludeByStatus", function() {
      var result = GlobalServer.execute(function() {
        var data = [{
          "_id": {
            "name": "error name1",
            "type": "method"
          },
          "count": 5,
          "type": "method"
        }, {
          "_id": {
            "name": "error name2",
            "type": "client"
          },
          "count": 2,
          "type": "client"
        }, {
          "_id": {
            "name": "error name3",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }, {
          "_id": {
            "name": "error name4",
            "type": "client"
          },
          "count": 1,
          "type": "client"
        }];
        var key = "error name1" + "method";
        var filteredErrorsMetaMap = {}; 
        filteredErrorsMetaMap[key] = {
          "_id": "eugYwrx7KQZczLxPP",
          "name": "Method not found [404]",
          "status": "ignored"
        };
        return KadiraErrorFilters._excludeByStatus(data, 
          filteredErrorsMetaMap, "ignored");
      });

      var expectedData = [{
        "_id": {
          "name": "error name2",
          "type": "client"
        },
        "count": 2,
        "type": "client",
        "status": "new"
      }, {
        "_id": {
          "name": "error name3",
          "type": "client"
        },
        "count": 1,
        "type": "client",
        "status": "new"
      }, {
        "_id": {
          "name": "error name4",
          "type": "client"
        },
        "count": 1,
        "type": "client",
        "status": "new"
      }];

      expect(result).to.be.eql(expectedData);
    });
    it("_canShowIgnored ,all errors with ignored", function() {

      var result = GlobalServer.execute(function() {
        var args = {
          "status": "all",
          showIgnored: true
        };
        return KadiraErrorFilters._canShowIgnored(args);
      });
      expect(result).to.be.eql(true);
    });

    it("_canShowIgnored ,ignored errors", function() {

      var result = GlobalServer.execute(function() {
        var args = {
          "status": "ignored",
          showIgnored: false
        };
        return KadiraErrorFilters._canShowIgnored(args);
      });
      expect(result).to.be.eql(true);
    });

    it("_canShowIgnored ,fixed errors, showIgnored true", function() {

      var result = GlobalServer.execute(function() {
        var args = {
          "status": "fixed",
          showIgnored: true
        };
        return KadiraErrorFilters._canShowIgnored(args);
      });
      expect(result).to.be.eql(false);
    });
  });
});