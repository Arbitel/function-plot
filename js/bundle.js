!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.functionPlot=e()}}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var events=_dereq_("events");var extend=_dereq_("extend");var mousetip=_dereq_("./lib/tip");var utils=_dereq_("./lib/utils");var helper=_dereq_("./lib/helper/");var assert=utils.assert;var Const;var types;module.exports=function(options){options=options||{};options.data=options.data||[];var width,height;var margin;var zoomBehavior;var xScale,yScale;var line=d3.svg.line().x(function(d){return xScale(d[0])}).y(function(d){return yScale(d[1])});function Chart(){this.id=options.target;this.linkedGraphs=[this];this.setVars();this.setUpEventListeners();this.build()}Chart.prototype=Object.create(events.prototype);Chart.prototype.updateBounds=function(){width=this.meta.width=(options.width||Const.DEFAULT_WIDTH)-margin.left-margin.right;height=this.meta.height=(options.height||Const.DEFAULT_HEIGHT)-margin.top-margin.bottom;var xDomain=this.meta.xDomain;var yDomain=this.meta.yDomain;var si=d3.format("s");var r=d3.format(".0r");var tickFormat=function(d){if(Math.abs(d)>=1){return si(d)}return r(d)};xScale=this.meta.xScale=d3.scale.linear().domain(xDomain).range([0,width]);yScale=this.meta.yScale=d3.scale.linear().domain(yDomain).range([height,0]);this.meta.xAxis=d3.svg.axis().scale(xScale).orient("bottom").tickFormat(tickFormat);this.meta.yAxis=d3.svg.axis().scale(yScale).orient("left").tickFormat(tickFormat)};Chart.prototype.setVars=function(){var limit=10;this.meta={};margin=this.meta.margin={left:30,right:30,top:20,bottom:20};zoomBehavior=this.meta.zoomBehavior=d3.behavior.zoom();var xDomain=this.meta.xDomain=options.xDomain||[-limit/2,limit/2];var yDomain=this.meta.yDomain=options.yDomain||[-limit/2,limit/2];assert(xDomain[0]<xDomain[1]);assert(yDomain[0]<yDomain[1]);if(options.title){this.meta.margin.top=40}this.updateBounds()};Chart.prototype.build=function(){var root=this.root=d3.select(options.target).selectAll("svg").data([options]);this.root.enter=root.enter().append("svg").attr("class","function-plot").attr("font-size",this.getFontSize());root.attr("width",width+margin.left+margin.right).attr("height",height+margin.top+margin.bottom);root.select(".top-right-legend").attr("y",margin.top/2).attr("x",width+margin.left);this.buildTitle();this.buildLegend();this.buildCanvas();this.buildClip();this.buildAxis();this.buildAxisLabel();this.buildContent();var tip=this.tip=mousetip(extend(options.tip,{owner:this}));this.canvas.enter.call(tip);this.buildZoomHelper()};Chart.prototype.buildTitle=function(){var selection=this.root.selectAll("text.title").data(function(d){return[d.title].filter(Boolean)});selection.enter().append("text").attr("class","title").attr("y",margin.top/2).attr("x",margin.left+width/2).attr("font-size",25).attr("text-anchor","middle").attr("alignment-baseline","middle").text(options.title);selection.exit().remove()};Chart.prototype.buildLegend=function(){this.root.enter.append("text").attr("class","top-right-legend").attr("text-anchor","end");this.root.select(".top-right-legend").attr("y",margin.top/2).attr("x",width+margin.left)};Chart.prototype.buildCanvas=function(){var self=this;this.meta.zoomBehavior.x(xScale).y(yScale).on("zoom",function onZoom(){self.emit("all:zoom",xScale,yScale)});var canvas=this.canvas=this.root.selectAll("#canvas").data(function(d){return[d]});this.canvas.enter=canvas.enter().append("g").attr("id","canvas");canvas.attr("transform","translate("+margin.left+","+margin.top+")").call(zoomBehavior).each(function(){var el=d3.select(this);if(options.disableZoom){el.on(".zoom",null)}})};Chart.prototype.buildClip=function(){var id=this.id;var defs=this.canvas.enter.append("defs");defs.append("clipPath").attr("id","function-plot-clip-"+id).append("rect").attr("class","clip static-clip");this.canvas.selectAll(".clip").attr("width",width).attr("height",height)};Chart.prototype.buildAxis=function(){var canvasEnter=this.canvas.enter;canvasEnter.append("g").attr("class","x axis");canvasEnter.append("g").attr("class","y axis");this.canvas.select(".x.axis").attr("transform","translate(0,"+height+")").call(this.meta.xAxis);this.canvas.select(".y.axis").call(this.meta.yAxis)};Chart.prototype.buildAxisLabel=function(){var xLabel,yLabel;var canvas=this.canvas;xLabel=canvas.selectAll("text.x.axis-label").data(function(d){return[d.xLabel].filter(Boolean)});xLabel.enter().append("text").attr("class","x axis-label").attr("text-anchor","end");xLabel.attr("x",width).attr("y",height-6).text(function(d){return d});xLabel.exit().remove();yLabel=canvas.selectAll("text.y.axis-label").data(function(d){return[d.yLabel].filter(Boolean)});yLabel.enter().append("text").attr("class","y axis-label").attr("y",6).attr("dy",".75em").attr("text-anchor","end").attr("transform","rotate(-90)");yLabel.text(function(d){return d});yLabel.exit().remove()};Chart.prototype.buildContent=function(){var self=this;var canvas=this.canvas;var content=this.content=canvas.selectAll("g#content").data(function(d){return[d]});content.enter().append("g").attr("clip-path","url(#function-plot-clip-"+this.id+")").attr("id","content");var yOrigin=content.selectAll("path.y.origin").data([[[0,yScale.domain()[0]],[0,yScale.domain()[1]]]]);yOrigin.enter().append("path").attr("class","y origin").attr("stroke","#eee");yOrigin.attr("d",line);var xOrigin=content.selectAll("path.x.origin").data([[[xScale.domain()[0],0],[xScale.domain()[1],0]]]);xOrigin.enter().append("path").attr("class","x origin").attr("stroke","#eee");xOrigin.attr("d",line);var graphs=content.selectAll("g.graph").data(function(d){return d.data});graphs.enter().append("g").attr("class","graph");graphs.each(function(data,index){var options=extend({owner:self,index:index},data.graphOptions);var type=options.type||"line";d3.select(this).call(types[type](options));d3.select(this).call(helper(options))})};Chart.prototype.buildZoomHelper=function(){var self=this;this.canvas.enter.append("rect").attr("class","zoom-and-drag").style("fill","none").style("pointer-events","all").on("mouseover",function(){self.emit("all:mouseover")}).on("mouseout",function(){self.emit("all:mouseout")}).on("mousemove",function(){self.emit("all:mousemove")});this.canvas.select(".zoom-and-drag").attr("width",width).attr("height",height)};Chart.prototype.addLink=function(){for(var i=0;i<arguments.length;i+=1){this.linkedGraphs.push(arguments[i])}};Chart.prototype.getFontSize=function(){return Math.max(Math.max(width,height)/50,8)};Chart.prototype.setUpEventListeners=function(){var instance=this;var events={mousemove:function(x,y){instance.tip.move(x,y)},mouseover:function(){instance.tip.show()},mouseout:function(){instance.tip.hide()},draw:function(){instance.buildContent()},"zoom:scaleUpdate":function(xOther,yOther){zoomBehavior.x(xScale.domain(xOther.domain())).y(yScale.domain(yOther.domain()))},"tip:update":function(x,y,index){var meta=instance.root.datum().data[index];var title=meta.title||"";var format=meta.renderer||function(x,y){return x.toFixed(3)+", "+y.toFixed(3)};var text=[];title&&text.push(title);text.push(format(x,y));instance.root.select(".top-right-legend").attr("fill",Const.COLORS[index]).text(text.join(" "))}};var all={mousemove:function(){var mouse=d3.mouse(instance.root.select("rect.zoom-and-drag").node());var x=xScale.invert(mouse[0]);var y=yScale.invert(mouse[1]);instance.linkedGraphs.forEach(function(graph){graph.emit("mousemove",x,y)})},zoom:function(xScale,yScale){instance.linkedGraphs.forEach(function(graph,i){var canvas=graph.canvas;canvas.select(".x.axis").call(graph.meta.xAxis);canvas.select(".y.axis").call(graph.meta.yAxis);if(i){graph.emit("zoom:scaleUpdate",xScale,yScale)}graph.emit("draw")});instance.emit("all:mousemove")}};Object.keys(events).forEach(function(e){instance.on(e,events[e]);!all[e]&&instance.on("all:"+e,function(){var args=Array.prototype.slice.call(arguments);instance.linkedGraphs.forEach(function(graph){var localArgs=args.slice();localArgs.unshift(e);graph.emit.apply(graph,localArgs)})})});Object.keys(all).forEach(function(e){instance.on("all:"+e,all[e])})};return new Chart};Const=module.exports.constants=_dereq_("./lib/constants");types=module.exports.types=_dereq_("./lib/types/")},{"./lib/constants":2,"./lib/helper/":5,"./lib/tip":6,"./lib/types/":7,"./lib/utils":10,events:12,extend:11}],2:[function(_dereq_,module,exports){"use strict";var d3=window.d3;module.exports={COLORS:["steelblue","red","#05b378","orange","#4040e8","yellow"].map(function(v){return d3.hsl(v)}),ITERATIONS_LIMIT:1e3,DEFAULT_WIDTH:550,DEFAULT_HEIGHT:350,TIP_X_EPS:1}},{}],3:[function(_dereq_,module,exports){"use strict";var utils=_dereq_("./utils");var Const=_dereq_("./constants");var assert=utils.assert;module.exports={range:function(chart,meta){var range=meta.range||[-Infinity,Infinity];var scale=chart.meta.xScale;var start=Math.max(scale.domain()[0],range[0]);var end=Math.min(scale.domain()[1],range[1]);return[start,end]},eval:function(chart,meta){assert(typeof meta.fn==="function");var data=[];var range=this.range(chart,meta);var start=range[0];var end=range[1];var samples=meta.samples||100;var delta=meta.deltaX;if(!delta){delta=(end-start)/samples}var iterations=(end-start)/delta;iterations=iterations||1;assert(iterations>=0);if(iterations>Const.ITERATIONS_LIMIT){iterations=Const.ITERATIONS_LIMIT;delta=(end-start)/iterations}for(var i=0;i<=iterations;i+=1){var x=start+delta*i;var y=meta.fn(x);if(utils.isValidNumber(x)&&utils.isValidNumber(y)){data.push([x,y])}}data=this.split(data,meta.graphOptions);return data},split:function(data,options){options=options||{};var EPS=.001;var limits=Array.prototype.slice.call(options.limits||[]);var sets=[];var i=0,j=1;var singleSet=[];limits.unshift(-1e8);limits.push(1e8);while(i<data.length){while(i<data.length&&data[i][0]<limits[j-1]+EPS){++i}singleSet=[];while(i<data.length&&data[i][0]>=limits[j-1]+EPS&&data[i][0]<=limits[j]-EPS){singleSet.push(data[i++])}++j;if(singleSet.length){sets.push(singleSet)}}return sets}}},{"./constants":2,"./utils":10}],4:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var line=_dereq_("../types/line");module.exports=function(options){var dataBuilderConfig={skipTip:true};var derivative;function computeLine(d){var x0=d.derivative.x0;var y0=d.fn(x0);var m=d.derivative.fn(x0);dataBuilderConfig.fn=function(x){return m*(x-x0)+y0}}function checkAutoUpdate(d){var self=this;if(d.derivative.updateOnMouseOver&&!d.derivative.$$mouseListener){d.derivative.$$mouseListener=function(x0){d.derivative.x0=x0;derivative(self)};options.owner.on("tip:update",d.derivative.$$mouseListener)}}derivative=function(selection){selection.each(function(d){var el=d3.select(this);computeLine.call(selection,d);checkAutoUpdate.call(selection,d);var innerSelection=el.selectAll("g.derivative").data([dataBuilderConfig]);innerSelection.enter().append("g").attr("class","derivative");innerSelection.call(line(options));innerSelection.selectAll("path").attr("opacity",.5)})};return derivative}},{"../types/line":8}],5:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var derivative=_dereq_("./derivative");module.exports=function(options){function helper(selection){selection.each(function(d){var el=d3.select(this);if(d.derivative){el.call(derivative(options))}})}return helper}},{"./derivative":4}],6:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var extend=_dereq_("extend");var utils=_dereq_("./utils");var Const=_dereq_("./constants");module.exports=function(config){config=extend({xLine:false,yLine:false,renderer:function(x,y){return"("+x.toFixed(3)+", "+y.toFixed(3)+")"},owner:null},config);var MARGIN=20;var root;var el;var line=d3.svg.line().x(function(d){return d[0]}).y(function(d){return d[1]});function lineGenerator(el,data){el.append("path").datum(data).attr("stroke","grey").attr("stroke-dasharray","5,5").attr("opacity",.5).attr("d",line);return el}function tip(selection){root=selection.append("g").attr("class","tip").attr("clip-path","url(#function-plot-clip-"+config.owner.id+")");el=root.append("g").style("display","none");if(config.xLine){lineGenerator(el,[[0,-config.owner.meta.height-MARGIN],[0,config.owner.meta.height+MARGIN]]).attr("class","tip-x-line")}if(config.yLine){lineGenerator(el,[[-config.owner.meta.width-MARGIN,0],[config.owner.meta.width+MARGIN,0]]).attr("class","tip-y-line")}el.append("circle").attr("r",3);el.append("text").attr("transform","translate(5,-5)")}tip.move=function(x0,y0){var i;var minDist=Infinity;var closestIndex=-1;var x,y;var inf=1e8;var meta=config.owner.meta;var data=el.datum().data;var xScale=meta.xScale;var yScale=meta.yScale;var width=meta.width;var height=meta.height;for(i=0;i<data.length;i+=1){if(!data[i].skipTip){var range=data[i].range||[-inf,inf];if(x0>range[0]-Const.TIP_X_EPS&&x0<range[1]+Const.TIP_X_EPS){var candidateY=data[i].fn(x0);if(utils.isValidNumber(candidateY)){var tDist=Math.abs(candidateY-y0);if(tDist<minDist){minDist=tDist;closestIndex=i}}}}}if(closestIndex!==-1){x=x0;if(data[closestIndex].range){x=Math.max(x,data[closestIndex].range[0]);x=Math.min(x,data[closestIndex].range[1])}y=data[closestIndex].fn(x);tip.show();config.owner.emit("tip:update",x,y,closestIndex);var clampX=utils.restrict(x,xScale.invert(-MARGIN),xScale.invert(width+MARGIN));var clampY=utils.restrict(y,yScale.invert(height+MARGIN),yScale.invert(-MARGIN));el.attr("transform","translate("+xScale(clampX)+","+yScale(clampY)+")");el.select("circle").attr("fill",Const.COLORS[closestIndex]);el.select("text").attr("fill",Const.COLORS[closestIndex]).text(config.renderer(x,y))}else{tip.hide()}};tip.show=function(){el.style("display",null)};tip.hide=function(){el.style("display","none")};Object.keys(config).forEach(function(option){utils.getterSetter.call(tip,config,option)});return tip}},{"./constants":2,"./utils":10,extend:11}],7:[function(_dereq_,module,exports){"use strict";module.exports={line:_dereq_("./line"),scatter:_dereq_("./scatter")}},{"./line":8,"./scatter":9}],8:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var Const=_dereq_("../constants");var dataBuilder=_dereq_("../data");module.exports=function(options){var xScale=options.owner.meta.xScale;var yScale=options.owner.meta.yScale;var line=d3.svg.line().interpolate(options.interpolate||"cardinal").x(function(d){return xScale(d[0])}).y(function(d){return yScale(d[1])});var area=d3.svg.area().x(function(d){return xScale(d[0])}).y0(yScale(0)).y1(function(d){return yScale(d[1])});function plotLine(selection){var index=options.index;selection.each(function(data){var el=plotLine.el=d3.select(this);var evaluatedData=dataBuilder.eval(options.owner,data);var innerSelection=el.selectAll("path").data(evaluatedData);innerSelection.enter().append("path").attr("class","line line-"+index).attr("stroke",Const.COLORS[index]);innerSelection.each(function(){var path=d3.select(this);var d;if(options.closed){path.attr("fill",Const.COLORS[index]);path.attr("fill-opacity",.3);d=area}else{path.attr("fill","none");d=line}path.attr("d",d)});innerSelection.exit().remove()})}return plotLine}},{"../constants":2,"../data":3}],9:[function(_dereq_,module,exports){"use strict";var d3=window.d3;var Const=_dereq_("../constants");var dataBuilder=_dereq_("../data");module.exports=function(options){var xScale=options.owner.meta.xScale;var yScale=options.owner.meta.yScale;function scatter(selection){var index=options.index;selection.each(function(data){var i,j;var fill=d3.hsl(Const.COLORS[index].toString());var evaluatedData=dataBuilder.eval(options.owner,data);var joined=[];for(i=0;i<evaluatedData.length;i+=1){for(j=0;j<evaluatedData[i].length;j+=1){joined.push(evaluatedData[i][j])}}var innerSelection=d3.select(this).selectAll("circle").data(joined);innerSelection.enter().append("circle").attr("class","circle circle-"+index).attr("fill",d3.hsl(fill.toString()).brighter(1.5)).attr("stroke",fill);innerSelection.attr("opacity",.7).attr("r",1).attr("cx",function(d){return xScale(d[0])}).attr("cy",function(d){return yScale(d[1])});innerSelection.exit().remove()})}return scatter}},{"../constants":2,"../data":3}],10:[function(_dereq_,module,exports){"use strict";module.exports={isValidNumber:function(v){return typeof v==="number"&&!isNaN(v)&&isFinite(v)},getterSetter:function(config,option){var me=this;this[option]=function(value){if(!arguments.length){return config[option]}config[option]=value;return me}},restrict:function(v,min,max){if(min>max){var t=min;min=max;max=t}v=Math.max(v,min);v=Math.min(v,max);return v},assert:function(v,message){message=message||"assertion failed";if(!v){throw new Error(message)}}}},{}],11:[function(_dereq_,module,exports){var hasOwn=Object.prototype.hasOwnProperty;var toString=Object.prototype.toString;var undefined;var isPlainObject=function isPlainObject(obj){"use strict";if(!obj||toString.call(obj)!=="[object Object]"){return false}var has_own_constructor=hasOwn.call(obj,"constructor");var has_is_property_of_method=obj.constructor&&obj.constructor.prototype&&hasOwn.call(obj.constructor.prototype,"isPrototypeOf");if(obj.constructor&&!has_own_constructor&&!has_is_property_of_method){return false}var key;for(key in obj){}return key===undefined||hasOwn.call(obj,key)};module.exports=function extend(){"use strict";var options,name,src,copy,copyIsArray,clone,target=arguments[0],i=1,length=arguments.length,deep=false;if(typeof target==="boolean"){deep=target;target=arguments[1]||{};i=2}else if(typeof target!=="object"&&typeof target!=="function"||target==null){target={}}for(;i<length;++i){options=arguments[i];if(options!=null){for(name in options){src=target[name];copy=options[name];if(target===copy){continue}if(deep&&copy&&(isPlainObject(copy)||(copyIsArray=Array.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&Array.isArray(src)?src:[]}else{clone=src&&isPlainObject(src)?src:{}}target[name]=extend(deep,clone,copy)}else if(copy!==undefined){target[name]=copy}}}}return target}},{}],12:[function(_dereq_,module,exports){function EventEmitter(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined}module.exports=EventEmitter;EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined;EventEmitter.defaultMaxListeners=10;EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||n<0||isNaN(n))throw TypeError("n must be a positive number");this._maxListeners=n;return this};EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(!this._events)this._events={};if(type==="error"){if(!this._events.error||isObject(this._events.error)&&!this._events.error.length){er=arguments[1];if(er instanceof Error){throw er}else{throw TypeError('Uncaught, unspecified "error" event.')}return false}}handler=this._events[type];if(isUndefined(handler))return false;if(isFunction(handler)){switch(arguments.length){case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break;default:len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)args[i-1]=arguments[i];handler.apply(this,args)}}else if(isObject(handler)){len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)args[i-1]=arguments[i];listeners=handler.slice();len=listeners.length;for(i=0;i<len;i++)listeners[i].apply(this,args)}return true};EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))throw TypeError("listener must be a function");if(!this._events)this._events={};if(this._events.newListener)this.emit("newListener",type,isFunction(listener.listener)?listener.listener:listener);if(!this._events[type])this._events[type]=listener;else if(isObject(this._events[type]))this._events[type].push(listener);else this._events[type]=[this._events[type],listener];if(isObject(this._events[type])&&!this._events[type].warned){var m;if(!isUndefined(this._maxListeners)){m=this._maxListeners}else{m=EventEmitter.defaultMaxListeners}if(m&&m>0&&this._events[type].length>m){this._events[type].warned=true;console.error("(node) warning: possible EventEmitter memory "+"leak detected. %d listeners added. "+"Use emitter.setMaxListeners() to increase limit.",this._events[type].length);if(typeof console.trace==="function"){console.trace()}}}return this};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.once=function(type,listener){if(!isFunction(listener))throw TypeError("listener must be a function");var fired=false;function g(){this.removeListener(type,g);if(!fired){fired=true;listener.apply(this,arguments)}}g.listener=listener;this.on(type,g);return this};EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))throw TypeError("listener must be a function");if(!this._events||!this._events[type])return this;list=this._events[type];length=list.length;position=-1;if(list===listener||isFunction(list.listener)&&list.listener===listener){delete this._events[type];if(this._events.removeListener)this.emit("removeListener",type,listener)}else if(isObject(list)){for(i=length;i-->0;){if(list[i]===listener||list[i].listener&&list[i].listener===listener){position=i;break}}if(position<0)return this;if(list.length===1){list.length=0;delete this._events[type]}else{list.splice(position,1)}if(this._events.removeListener)this.emit("removeListener",type,listener)}return this};EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)return this;if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[type])delete this._events[type];return this}if(arguments.length===0){for(key in this._events){if(key==="removeListener")continue;this.removeAllListeners(key)}this.removeAllListeners("removeListener");this._events={};return this}listeners=this._events[type];if(isFunction(listeners)){this.removeListener(type,listeners)}else{while(listeners.length)this.removeListener(type,listeners[listeners.length-1])}delete this._events[type];return this};EventEmitter.prototype.listeners=function(type){var ret;if(!this._events||!this._events[type])ret=[];else if(isFunction(this._events[type]))ret=[this._events[type]];else ret=this._events[type].slice();return ret};EventEmitter.listenerCount=function(emitter,type){var ret;if(!emitter._events||!emitter._events[type])ret=0;else if(isFunction(emitter._events[type]))ret=1;else ret=emitter._events[type].length;return ret};function isFunction(arg){return typeof arg==="function"}function isNumber(arg){return typeof arg==="number"}function isObject(arg){return typeof arg==="object"&&arg!==null}function isUndefined(arg){return arg===void 0}},{}]},{},[1])(1)});