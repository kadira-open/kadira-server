Template["debug.cpuProfiler"].events({
  "change .pf-file-upload-btn": function(e) {
    e.preventDefault();
    FlowComponents.callAction("fetchProfile");
  },
  
  "click button.reset-cpu-profiler": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetCpuProfiler");
  },

  "click .dropzone": function(e) {
    e.preventDefault();
    $(".pf-file-upload-btn").trigger("click");
  },

  "dragenter .dropzone": function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dropzone").addClass("dragenter");
  },

  "dragover .dropzone": function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dropzone").addClass("dragover");
  },

  "drop .dropzone": function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    FlowComponents.callAction("fetchProfile", files[0]);
  }
});