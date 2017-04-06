var component = FlowComponents.define("profiler.flameviewer", function(params) {
  this._domPathCache = [];
  this._selectedFunctions = {};
  this._currentPath = null;

  // initialization
  this.autorun(function() {
    if(!params.cpuProfileFn()) {return;}

    var cpuProfile = params.cpuProfileFn();
    if(cpuProfile) {
      this.setProfile(cpuProfile);
    }
  });

  this.onRendered(function() {
    this.autorun(function() {
      var height = (params.heightFn)? params.heightFn() : 0;
      this.setSize(height);
    });

    this.autorun(function() {
      var cpuProfile = params.cpuProfileFn();
      if(!params.currentPathFn ||!cpuProfile ) {return;}
      var currentPath = params.currentPathFn();
      this.renderPath(currentPath);
    });
  });

  this.onRendered(function() {
    this.autorun(function() {
      var self = this;
      var selectedFunctions = params.selectedFunctionsFn() || [];
      if(selectedFunctions.length > 0) {
        this.clearSelection();
        selectedFunctions.forEach(function (func) {
          self.selectFunction(func);
        });
      } else {
        this.clearSelection();
      }
    });
  });

  // events
  this._onClick = this._handleEvents("click", params.onClick);
  this._onHover = this._handleEvents("hover", params.onHover);
  this._onChartLeave = params.onChartLeave || Function.prototype;
});

component.prototype.setProfile = function(profile) {
  this.cpuProfile = profile;
  this._domPathCache = [];
  this._selectedFunctions = {};
  this._currentPath = null;
};

component.prototype.renderPath = function(pathId) {
  var el = this.$(".flameviewer-container");
  var container = this._domPathCache[pathId];
  if(!container) {
    container = this._generatePath(pathId);
    this._domPathCache[pathId] = container;
  }

  this._currentPath = pathId;

  $(el).html("");
  $(el).append(container);
  this._setEventHandlers(container);
};

component.prototype.setSize = function(height) {
  var self = this;
  var el = self.$(".flameviewer-container");
  el.height(height);

  // We get the width from the actual dom element
  width = el.width();

  function reSelectFunctions(){
    for(var k in self._selectedFunctions) {
      var selected = self._selectedFunctions[k];
      self.selectFunction(selected.callUID);
    }
  }

  function clearDomCache () {
    self._domPathCache = {};
  }

  if(width > 0 && this.width !== width) {
    this.width = width;
    clearDomCache();
  }

  if(height > 0 && this.height !== height) {
    this.height = height;
    clearDomCache();
  }

  if(!_.isNull(this._currentPath) && !_.isUndefined(this._currentPath)) {
    this.renderPath(this._currentPath);
    reSelectFunctions();
  }
};

component.prototype.selectFunction = function(callUID) {
  var pathDom = this._domPathCache[this._currentPath];
  var funcDom = $(".func-" + callUID, pathDom);
  var oldClass = funcDom.attr("class");
  oldClass += " selected-function";
  funcDom.attr("class", oldClass);
  this._selectedFunctions[this._currentPath + "-" + callUID] = {
    callUID: callUID, path: this._currentPath
  };
};

component.prototype.unselectFunction = function(callUID, pathId) {
  var pathDom = this._domPathCache[pathId];
  var dom = $(".func-" + callUID, pathDom);
  if(dom.length > 0) {
    var oldClass = dom.attr("class");
    oldClass = oldClass.replace(/selected-function/, "").trim();
    dom.attr("class", oldClass);
  }
  var key = pathId + "" + callUID;
  if(key){
    delete this._selectedFunctions[key];
  }
};

component.prototype.clearSelection = function() {
  var self = this;

  for(var selected in this._selectedFunctions){
    self.unselectFunction(
      this._selectedFunctions[selected].callUID,
      this._selectedFunctions[selected].path
    );
  }
};

component.prototype._generatePath = function(pathId) {
  var self = this;
  var svgHtml = "";
  var path = this._getData(pathId);
  var maxDepth = 0;
  var generateFunctionNode = _.template($("#flamebar-node").text().trim());

  renderNode(path);

  var height = (maxDepth + 1) * 20;

  var container = $("<div></div>");
  var htmlString =
    "<svg width=\"" + this.width + "\" height=\"" +
    height + "\">" + svgHtml + "</svg>";
  container.html(htmlString);
  return container;

  function renderNode(node, depth) {
    depth = depth || 0;
    node = _.clone(node);
    node.viewer = self;
    node._depth = depth;
    node._color = FunctionNode.getColor(node);
    node._width = FunctionNode.getWidth(self, node);
    node._displayName = FunctionNode.getDisplayName(self, node);

    maxDepth = (depth > maxDepth)? depth: maxDepth;

    svgHtml += generateFunctionNode(node);

    if(node.children && node.children.length > 0) {
      var children = self._getChildren(node);
      children.forEach(function(child) {
        renderNode(child, depth + 1);
      });
    }
  }
};

component.prototype._setEventHandlers = function(container) {
  container.off("click", "rect, text", this._onClick);
  container.off("mouseover", "rect, text", this._onHover);
  container.off("mouseleave", this._onChartLeave);

  container.on("click", "rect, text", this._onClick);
  container.on("mouseover", "rect, text", this._onHover);
  container.on("mouseleave", this._onChartLeave);
};

component.prototype.destroy = function() {

};

component.prototype._getData = function (pathId) {
  if(pathId >= 0) {
    var path = this.cpuProfile.paths[pathId];
    this._maxWidth = path.totalHitCount;
    path._x = 0;
    return path;
  }
};

component.prototype._getChildren = function (node) {
  var self = this;
  var offset = node._x;
  var totalX = 0;
  var children = node.children.map(function(child) {
    child = _.clone(child);
    child._x = offset + FunctionNode.getWidth(self, {totalHitCount: totalX});
    totalX += child.totalHitCount;
    return child;
  });

  return children;
};

component.prototype._handleEvents = function(type, callback) {
  function wrapper(e) {
    var dom = $(e.target);
    var callUID = dom.data("calluid");
    var id = dom.data("id");
    var node = _.clone(this.cpuProfile.functionsMap[callUID]);

    if(callback && node) {
      node.hitCount = this.cpuProfile.realFunctionsMap[id].hitCount;
      node.totalHitCount = this.cpuProfile.realFunctionsMap[id].totalHitCount;
      callback(callUID, node);
    }
  }

  return wrapper.bind(this);
};

// Template Helpers for the FunctionNode
var baseColors = [
  "#c1e3ab",
  "#b6e7bc",
  "#c6ecd4",
  "#b9e8d4",
  "#b3e0a3"
];

FunctionNode = {};

FunctionNode.getWidth = function(viewer, node) {
  return Math.floor((viewer.width/viewer._maxWidth) * node.totalHitCount);
};

FunctionNode.getColor = function(node) {
  var index = node.callUID % baseColors.length;
  return baseColors[index];
};

FunctionNode.getDisplayName = function(viewer, node) {
  var functionNameWidth = 8 * node.functionName.length;
  var barWidth = FunctionNode.getWidth(viewer, node);
  if(barWidth > functionNameWidth) {
    return node.functionName;
  }
};
