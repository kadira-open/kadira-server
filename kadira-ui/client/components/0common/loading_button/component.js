 var component = FlowComponents.define("loadingButton", function(params) {
   this.set("id", params.id);
   this.set("name", params.name);
   this.set("class", params.class);
   this.set("type", params.type);

   this.set("action", params.action);

   if(params.type === "text|icon") {
     this.autorun(function() {
       var loading = params.loadingFn();
       if(loading) {
         this.set("disabled", "disabled");
         this.set("text", "");
         this.set("icon", params.loadingIcon);
       } else {
         this.set("disabled", "");
         this.set("text", params.text);
         this.set("icon", "default-text");
       }
     });    
   }
 });

 component.state.isType = function(typeParm) {
   var type = this.get("type");
   return (type === typeParm);
 };

