;(function($){"use strict";var feature={};feature.fileapi=$("<input type='file'/>").get(0).files!==undefined;feature.formdata=window.FormData!==undefined;$.fn.ajaxSubmit=function(options){if(!this.length){log('ajaxSubmit: skipping submit process - no element selected');return this}var method,action,url,$form=this;if(typeof options=='function'){options={success:options}}method=this.attr('method');action=this.attr('action');url=(typeof action==='string')?$.trim(action):'';url=url||window.location.href||'';if(url){url=(url.match(/^([^#]+)/)||[])[1]}options=$.extend(true,{url:url,success:$.ajaxSettings.success,type:method||'GET',iframeSrc:/^https/i.test(window.location.href||'')?'javascript:false':'about:blank'},options);var veto={};this.trigger('form-pre-serialize',[this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');return this}if(options.beforeSerialize&&options.beforeSerialize(this,options)===false){log('ajaxSubmit: submit aborted via beforeSerialize callback');return this}var traditional=options.traditional;if(traditional===undefined){traditional=$.ajaxSettings.traditional}var elements=[];var qx,a=this.formToArray(options.semantic,elements);if(options.data){options.extraData=options.data;qx=$.param(options.data,traditional)}if(options.beforeSubmit&&options.beforeSubmit(a,this,options)===false){log('ajaxSubmit: submit aborted via beforeSubmit callback');return this}this.trigger('form-submit-validate',[a,this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-submit-validate trigger');return this}var q=$.param(a,traditional);if(qx){q=(q?(q+'&'+qx):qx)}if(options.type.toUpperCase()=='GET'){options.url+=(options.url.indexOf('?')>=0?'&':'?')+q;options.data=null}else{options.data=q}var callbacks=[];if(options.resetForm){callbacks.push(function(){$form.resetForm()})}if(options.clearForm){callbacks.push(function(){$form.clearForm(options.includeHidden)})}if(!options.dataType&&options.target){var oldSuccess=options.success||function(){};callbacks.push(function(data){var fn=options.replaceTarget?'replaceWith':'html';$(options.target)[fn](data).each(oldSuccess,arguments)})}else if(options.success){callbacks.push(options.success)}options.success=function(data,status,xhr){var context=options.context||this;for(var i=0,max=callbacks.length;i<max;i++){callbacks[i].apply(context,[data,status,xhr||$form,$form])}};var fileInputs=$('input:file:enabled[value]',this);var hasFileInputs=fileInputs.length>0;var mp='multipart/form-data';var multipart=($form.attr('enctype')==mp||$form.attr('encoding')==mp);var fileAPI=feature.fileapi&&feature.formdata;log("fileAPI :"+fileAPI);var shouldUseFrame=(hasFileInputs||multipart)&&!fileAPI;if(options.iframe!==false&&(options.iframe||shouldUseFrame)){if(options.closeKeepAlive){$.get(options.closeKeepAlive,function(){fileUploadIframe(a)})}else{fileUploadIframe(a)}}else if((hasFileInputs||multipart)&&fileAPI){fileUploadXhr(a)}else{$.ajax(options)}for(var k=0;k<elements.length;k++)elements[k]=null;this.trigger('form-submit-notify',[this,options]);return this;function deepSerialize(extraData){var serialized=$.param(extraData).split('&');var len=serialized.length;var result={};var i,part;for(i=0;i<len;i++){part=serialized[i].split('=');result[decodeURIComponent(part[0])]=decodeURIComponent(part[1])}return result}function fileUploadXhr(a){var formdata=new FormData();for(var i=0;i<a.length;i++){formdata.append(a[i].name,a[i].value)}if(options.extraData){var serializedData=deepSerialize(options.extraData);for(var p in serializedData)if(serializedData.hasOwnProperty(p))formdata.append(p,serializedData[p])}options.data=null;var s=$.extend(true,{},$.ajaxSettings,options,{contentType:false,processData:false,cache:false,type:'POST'});if(options.uploadProgress){s.xhr=function(){var xhr=jQuery.ajaxSettings.xhr();if(xhr.upload){xhr.upload.onprogress=function(event){var percent=0;var position=event.loaded||event.position;var total=event.total;if(event.lengthComputable){percent=Math.ceil(position/total*100)}options.uploadProgress(event,position,total,percent)}}return xhr}}s.data=null;var beforeSend=s.beforeSend;s.beforeSend=function(xhr,o){o.data=formdata;if(beforeSend)beforeSend.call(this,xhr,o)};$.ajax(s)}function fileUploadIframe(a){var form=$form[0],el,i,s,g,id,$io,io,xhr,sub,n,timedOut,timeoutHandle;var useProp=!!$.fn.prop;if($(':input[name=submit],:input[id=submit]',form).length){alert('Error: Form elements must not have name or id of "submit".');return}if(a){for(i=0;i<elements.length;i++){el=$(elements[i]);if(useProp)el.prop('disabled',false);else el.removeAttr('disabled')}}s=$.extend(true,{},$.ajaxSettings,options);s.context=s.context||s;id='jqFormIO'+(new Date().getTime());if(s.iframeTarget){$io=$(s.iframeTarget);n=$io.attr('name');if(!n)$io.attr('name',id);else id=n}else{$io=$('<iframe name="'+id+'" src="'+s.iframeSrc+'" />');$io.css({position:'absolute',top:'-1000px',left:'-1000px'})}io=$io[0];xhr={aborted:0,responseText:null,responseXML:null,status:0,statusText:'n/a',getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(status){var e=(status==='timeout'?'timeout':'aborted');log('aborting upload... '+e);this.aborted=1;if(io.contentWindow.document.execCommand){try{io.contentWindow.document.execCommand('Stop')}catch(ignore){}}$io.attr('src',s.iframeSrc);xhr.error=e;if(s.error)s.error.call(s.context,xhr,e,status);if(g)$.event.trigger("ajaxError",[xhr,s,e]);if(s.complete)s.complete.call(s.context,xhr,e)}};g=s.global;if(g&&0===$.active++){$.event.trigger("ajaxStart")}if(g){$.event.trigger("ajaxSend",[xhr,s])}if(s.beforeSend&&s.beforeSend.call(s.context,xhr,s)===false){if(s.global){$.active--}return}if(xhr.aborted){return}sub=form.clk;if(sub){n=sub.name;if(n&&!sub.disabled){s.extraData=s.extraData||{};s.extraData[n]=sub.value;if(sub.type=="image"){s.extraData[n+'.x']=form.clk_x;s.extraData[n+'.y']=form.clk_y}}}var CLIENT_TIMEOUT_ABORT=1;var SERVER_ABORT=2;function getDoc(frame){var doc=frame.contentWindow?frame.contentWindow.document:frame.contentDocument?frame.contentDocument:frame.document;return doc}var csrf_token=$('meta[name=csrf-token]').attr('content');var csrf_param=$('meta[name=csrf-param]').attr('content');if(csrf_param&&csrf_token){s.extraData=s.extraData||{};s.extraData[csrf_param]=csrf_token}function doSubmit(){var t=$form.attr('target'),a=$form.attr('action');form.setAttribute('target',id);if(!method){form.setAttribute('method','POST')}if(a!=s.url){form.setAttribute('action',s.url)}if(!s.skipEncodingOverride&&(!method||/post/i.test(method))){$form.attr({encoding:'multipart/form-data',enctype:'multipart/form-data'})}if(s.timeout){timeoutHandle=setTimeout(function(){timedOut=true;cb(CLIENT_TIMEOUT_ABORT)},s.timeout)}function checkState(){try{var state=getDoc(io).readyState;log('state = '+state);if(state&&state.toLowerCase()=='uninitialized')setTimeout(checkState,50)}catch(e){log('Server abort: ',e,' (',e.name,')');cb(SERVER_ABORT);if(timeoutHandle)clearTimeout(timeoutHandle);timeoutHandle=undefined}}var extraInputs=[];try{if(s.extraData){for(var n in s.extraData){if(s.extraData.hasOwnProperty(n)){if($.isPlainObject(s.extraData[n])&&s.extraData[n].hasOwnProperty('name')&&s.extraData[n].hasOwnProperty('value')){extraInputs.push($('<input type="hidden" name="'+s.extraData[n].name+'">').attr('value',s.extraData[n].value).appendTo(form)[0])}else{extraInputs.push($('<input type="hidden" name="'+n+'">').attr('value',s.extraData[n]).appendTo(form)[0])}}}}if(!s.iframeTarget){$io.appendTo('body');if(io.attachEvent)io.attachEvent('onload',cb);else io.addEventListener('load',cb,false)}setTimeout(checkState,15);form.submit()}finally{form.setAttribute('action',a);if(t){form.setAttribute('target',t)}else{$form.removeAttr('target')}$(extraInputs).remove()}}if(s.forceSync){doSubmit()}else{setTimeout(doSubmit,10)}var data,doc,domCheckCount=50,callbackProcessed;function cb(e){if(xhr.aborted||callbackProcessed){return}try{doc=getDoc(io)}catch(ex){log('cannot access response document: ',ex);e=SERVER_ABORT}if(e===CLIENT_TIMEOUT_ABORT&&xhr){xhr.abort('timeout');return}else if(e==SERVER_ABORT&&xhr){xhr.abort('server abort');return}if(!doc||doc.location.href==s.iframeSrc){if(!timedOut)return}if(io.detachEvent)io.detachEvent('onload',cb);else io.removeEventListener('load',cb,false);var status='success',errMsg;try{if(timedOut){throw'timeout';}var isXml=s.dataType=='xml'||doc.XMLDocument||$.isXMLDoc(doc);log('isXml='+isXml);if(!isXml&&window.opera&&(doc.body===null||!doc.body.innerHTML)){if(--domCheckCount){log('requeing onLoad callback, DOM not available');setTimeout(cb,250);return}}var docRoot=doc.body?doc.body:doc.documentElement;xhr.responseText=docRoot?docRoot.innerHTML:null;xhr.responseXML=doc.XMLDocument?doc.XMLDocument:doc;if(isXml)s.dataType='xml';xhr.getResponseHeader=function(header){var headers={'content-type':s.dataType};return headers[header]};if(docRoot){xhr.status=Number(docRoot.getAttribute('status'))||xhr.status;xhr.statusText=docRoot.getAttribute('statusText')||xhr.statusText}var dt=(s.dataType||'').toLowerCase();var scr=/(json|script|text)/.test(dt);if(scr||s.textarea){var ta=doc.getElementsByTagName('textarea')[0];if(ta){xhr.responseText=ta.value;xhr.status=Number(ta.getAttribute('status'))||xhr.status;xhr.statusText=ta.getAttribute('statusText')||xhr.statusText}else if(scr){var pre=doc.getElementsByTagName('pre')[0];var b=doc.getElementsByTagName('body')[0];if(pre){xhr.responseText=pre.textContent?pre.textContent:pre.innerText}else if(b){xhr.responseText=b.textContent?b.textContent:b.innerText}}}else if(dt=='xml'&&!xhr.responseXML&&xhr.responseText){xhr.responseXML=toXml(xhr.responseText)}try{data=httpData(xhr,dt,s)}catch(e){status='parsererror';xhr.error=errMsg=(e||status)}}catch(e){log('error caught: ',e);status='error';xhr.error=errMsg=(e||status)}if(xhr.aborted){log('upload aborted');status=null}if(xhr.status){status=(xhr.status>=200&&xhr.status<300||xhr.status===304)?'success':'error'}if(status==='success'){if(s.success)s.success.call(s.context,data,'success',xhr);if(g)$.event.trigger("ajaxSuccess",[xhr,s])}else if(status){if(errMsg===undefined)errMsg=xhr.statusText;if(s.error)s.error.call(s.context,xhr,status,errMsg);if(g)$.event.trigger("ajaxError",[xhr,s,errMsg])}if(g)$.event.trigger("ajaxComplete",[xhr,s]);if(g&&!--$.active){$.event.trigger("ajaxStop")}if(s.complete)s.complete.call(s.context,xhr,status);callbackProcessed=true;if(s.timeout)clearTimeout(timeoutHandle);setTimeout(function(){if(!s.iframeTarget)$io.remove();xhr.responseXML=null},100)}var toXml=$.parseXML||function(s,doc){if(window.ActiveXObject){doc=new ActiveXObject('Microsoft.XMLDOM');doc.async='false';doc.loadXML(s)}else{doc=(new DOMParser()).parseFromString(s,'text/xml')}return(doc&&doc.documentElement&&doc.documentElement.nodeName!='parsererror')?doc:null};var parseJSON=$.parseJSON||function(s){return window['eval']('('+s+')')};var httpData=function(xhr,type,s){var ct=xhr.getResponseHeader('content-type')||'',xml=type==='xml'||!type&&ct.indexOf('xml')>=0,data=xml?xhr.responseXML:xhr.responseText;if(xml&&data.documentElement.nodeName==='parsererror'){if($.error)$.error('parsererror')}if(s&&s.dataFilter){data=s.dataFilter(data,type)}if(typeof data==='string'){if(type==='json'||!type&&ct.indexOf('json')>=0){data=parseJSON(data)}else if(type==="script"||!type&&ct.indexOf("javascript")>=0){$.globalEval(data)}}return data}}};$.fn.ajaxForm=function(options){options=options||{};options.delegation=options.delegation&&$.isFunction($.fn.on);if(!options.delegation&&this.length===0){var o={s:this.selector,c:this.context};if(!$.isReady&&o.s){log('DOM not ready, queuing ajaxForm');$(function(){$(o.s,o.c).ajaxForm(options)});return this}log('terminating; zero elements found by selector'+($.isReady?'':' (DOM not ready)'));return this}if(options.delegation){$(document).off('submit.form-plugin',this.selector,doAjaxSubmit).off('click.form-plugin',this.selector,captureSubmittingElement).on('submit.form-plugin',this.selector,options,doAjaxSubmit).on('click.form-plugin',this.selector,options,captureSubmittingElement);return this}return this.ajaxFormUnbind().bind('submit.form-plugin',options,doAjaxSubmit).bind('click.form-plugin',options,captureSubmittingElement)};function doAjaxSubmit(e){var options=e.data;if(!e.isDefaultPrevented()){e.preventDefault();$(this).ajaxSubmit(options)}}function captureSubmittingElement(e){var target=e.target;var $el=$(target);if(!($el.is(":submit,input:image"))){var t=$el.closest(':submit');if(t.length===0){return}target=t[0]}var form=this;form.clk=target;if(target.type=='image'){if(e.offsetX!==undefined){form.clk_x=e.offsetX;form.clk_y=e.offsetY}else if(typeof $.fn.offset=='function'){var offset=$el.offset();form.clk_x=e.pageX-offset.left;form.clk_y=e.pageY-offset.top}else{form.clk_x=e.pageX-target.offsetLeft;form.clk_y=e.pageY-target.offsetTop}}setTimeout(function(){form.clk=form.clk_x=form.clk_y=null},100)}$.fn.ajaxFormUnbind=function(){return this.unbind('submit.form-plugin click.form-plugin')};$.fn.formToArray=function(semantic,elements){var a=[];if(this.length===0){return a}var form=this[0];var els=semantic?form.getElementsByTagName('*'):form.elements;if(!els){return a}var i,j,n,v,el,max,jmax;for(i=0,max=els.length;i<max;i++){el=els[i];n=el.name;if(!n){continue}if(semantic&&form.clk&&el.type=="image"){if(!el.disabled&&form.clk==el){a.push({name:n,value:$(el).val(),type:el.type});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}continue}v=$.fieldValue(el,true);if(v&&v.constructor==Array){if(elements)elements.push(el);for(j=0,jmax=v.length;j<jmax;j++){a.push({name:n,value:v[j]})}}else if(feature.fileapi&&el.type=='file'&&!el.disabled){if(elements)elements.push(el);var files=el.files;if(files.length){for(j=0;j<files.length;j++){a.push({name:n,value:files[j],type:el.type})}}else{a.push({name:n,value:'',type:el.type})}}else if(v!==null&&typeof v!='undefined'){if(elements)elements.push(el);a.push({name:n,value:v,type:el.type,required:el.required})}}if(!semantic&&form.clk){var $input=$(form.clk),input=$input[0];n=input.name;if(n&&!input.disabled&&input.type=='image'){a.push({name:n,value:$input.val()});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}}return a};$.fn.formSerialize=function(semantic){return $.param(this.formToArray(semantic))};$.fn.fieldSerialize=function(successful){var a=[];this.each(function(){var n=this.name;if(!n){return}var v=$.fieldValue(this,successful);if(v&&v.constructor==Array){for(var i=0,max=v.length;i<max;i++){a.push({name:n,value:v[i]})}}else if(v!==null&&typeof v!='undefined'){a.push({name:this.name,value:v})}});return $.param(a)};$.fn.fieldValue=function(successful){for(var val=[],i=0,max=this.length;i<max;i++){var el=this[i];var v=$.fieldValue(el,successful);if(v===null||typeof v=='undefined'||(v.constructor==Array&&!v.length)){continue}if(v.constructor==Array)$.merge(val,v);else val.push(v)}return val};$.fieldValue=function(el,successful){var n=el.name,t=el.type,tag=el.tagName.toLowerCase();if(successful===undefined){successful=true}if(successful&&(!n||el.disabled||t=='reset'||t=='button'||(t=='checkbox'||t=='radio')&&!el.checked||(t=='submit'||t=='image')&&el.form&&el.form.clk!=el||tag=='select'&&el.selectedIndex==-1)){return null}if(tag=='select'){var index=el.selectedIndex;if(index<0){return null}var a=[],ops=el.options;var one=(t=='select-one');var max=(one?index+1:ops.length);for(var i=(one?index:0);i<max;i++){var op=ops[i];if(op.selected){var v=op.value;if(!v){v=(op.attributes&&op.attributes['value']&&!(op.attributes['value'].specified))?op.text:op.value}if(one){return v}a.push(v)}}return a}return $(el).val()};$.fn.clearForm=function(includeHidden){return this.each(function(){$('input,select,textarea',this).clearFields(includeHidden)})};$.fn.clearFields=$.fn.clearInputs=function(includeHidden){var re=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var t=this.type,tag=this.tagName.toLowerCase();if(re.test(t)||tag=='textarea'){this.value=''}else if(t=='checkbox'||t=='radio'){this.checked=false}else if(tag=='select'){this.selectedIndex=-1}else if(includeHidden){if((includeHidden===true&&/hidden/.test(t))||(typeof includeHidden=='string'&&$(this).is(includeHidden)))this.value=''}})};$.fn.resetForm=function(){return this.each(function(){if(typeof this.reset=='function'||(typeof this.reset=='object'&&!this.reset.nodeType)){this.reset()}})};$.fn.enable=function(b){if(b===undefined){b=true}return this.each(function(){this.disabled=!b})};$.fn.selected=function(select){if(select===undefined){select=true}return this.each(function(){var t=this.type;if(t=='checkbox'||t=='radio'){this.checked=select}else if(this.tagName.toLowerCase()=='option'){var $sel=$(this).parent('select');if(select&&$sel[0]&&$sel[0].type=='select-one'){$sel.find('option').selected(false)}this.selected=select}})};$.fn.ajaxSubmit.debug=false;function log(){if(!$.fn.ajaxSubmit.debug)return;var msg='[jquery.form] '+Array.prototype.join.call(arguments,'');if(window.console&&window.console.log){window.console.log(msg)}else if(window.opera&&window.opera.postError){window.opera.postError(msg)}}})(jQuery);

jQuery(function($){
	$(".erphpad-loader").each(function(){
		var that = $(this),
		    aid = $(this).data("id"),
            aimg = $(this).data("img");
        $.post(erphpad_ajax_url, {
            "action": "erphpad_show",
            "aid": aid
        }, function(result) {
            if( result.status == 200 ){
                if(result.content){
                    if(result.type == '1'){
                        that.addClass("erphpad-text");
                    }
                    that.html(result.content);
                }else{
                    that.html('<div class="erphpad-placeholder">广告位已被租用，等待租户上传广告中...</div>');
                }
            }else if( result.status == 400 ){
                that.remove();
            }else{
                if(aimg){
                    that.html('<div class="erphpad-show-img"><a href="javascript:;" data-id="'+aid+'" class="erphpad-buy-loader" title="点击立即租用"><img src="'+aimg+'"></a>');
                }else{
                    that.html('<div class="erphpad-show">自助广告位招租<a href="javascript:;" data-id="'+aid+'" class="erphpad-buy-loader">立即租用</a>');
                }
            }

        }, 'json'); 
		
	});

	$("body").on("click", ".erphpad-buy-loader", function(){
        if($("body").hasClass("logged-in")){
    		var pid = $(this).data("id");
    		if(pid){
    			var msgTips = layer.msg("处理中...", {time: -1});

                $.post(erphpad_ajax_url, {
                    "action": "erphpad",
                    "pid": pid
                }, function(result) {
                	layer.close(msgTips);
                	if( result.status == 200 ){
                		var ads = JSON.parse(result.data);
		                var ad_html = '<div class="erphpad-radios">';
		                for (var i = 0; i < ads.length; i++) {
		                    var ad = ads[i];
		                    ad_html += '<input type="radio" name="erphpad'+result.id+'" id="erphpad'+result.id+'-'+i+'" value="'+i+'" checked> <label for="erphpad'+result.id+'-'+i+'">'+ad.day+'天'+ad.price+_ERPHPAD.name+'</label> ';
		                }
		                ad_html += '</div><div class="erphpad-radios-buy"><a href="javascript:;" class="erphpad-pay-loader" data-id="'+result.id+'" data-name="erphpad'+result.id+'">立即租用广告</a></div>';

                		layer.open({
						  	type: 1,
						  	area: ['350px', ''],
						  	skin: 'layui-layer-dialog',
						  	title: '购买广告（请先充值）',
						  	resize:false,
				          	scrollbar: false,
				          	shadeClose: true,
						  	content: ad_html
						});
                    }

                }, 'json'); 
    		}else{
    			layer.msg("获取广告位信息失败！");
            }
        }else{
        	layer.msg("请先登录！");
            $(".signin-loader").trigger("click");
        }
        return false;
	});

	$("body").on("click",".erphpad-pay-loader",function(){
        var aid = $(this).data("id"),
            aname = $(this).data("name"),
            aindex = $("input[name='"+aname+"']:checked").val();
        if(aid){
            var msgTips = layer.msg("处理中...", {time: -1});

            $.post(erphpad_ajax_url, {
                "action": "erphpad_buy",
                "aid": aid,
                "aindex": aindex
            }, function(result) {
            	layer.close(msgTips);
                if( result.status == 200 ){
                	layer.closeAll();
                	layer.msg(result.msg, {time: 5000});
                }

            }, 'json'); 
        }
        return false;
    });

    $("body").on("click", ".erphpad-edit-loader", function(){
        var aid = $(this).data("id");
        if(aid){
            var msgTips = layer.msg("处理中...", {time: -1});

            $.post(erphpad_ajax_url, {
                "action": "erphpad_edit",
                "aid": aid
            }, function(result) {
            	layer.close(msgTips);
                if( result.status == 200 ){
                    var type = result.type,
                        type_html = '<span class="erphpad-upload">上传图片</span>',
                        type_style = 'padding-right:60px;',
                        type_place = '广告图片';
                    if(type == '1'){
                        type_html = '';
                        type_style = '';
                        type_place = '广告文字';
                    }
                	var ad_html = '<div class="erphpad-con-edit">\n       <div class="erphpad-con-item"><input type="url" id="erphpad-image" placeholder="'+type_place+'" value="'+result.image+'" style="'+type_style+'">'+type_html+'</div>     <div class="erphpad-con-item"><input type="url" id="erphpad-url" placeholder="跳转链接" value="'+result.url+'"></div>   <p>'+result.tips+'</p>                               <div class="erphpad-edit-btn"><a href="javascript:;" class="erphpad-update-loader" data-id="'+aid+'" data-type="'+type+'">保存广告</a></div>           </div>\n        '

                	layer.open({
					  	type: 1,
					  	area: ['350px', ''],
					  	skin: 'layui-layer-dialog',
					  	title: '编辑广告-'+result.name,
					  	resize:false,
			          	scrollbar: false,
			          	shadeClose: true,
					  	content: ad_html
					});

                }else{
                	layer.msg(result.msg);
                }

            }, 'json'); 
        }else{
            layer.msg("获取广告信息失败！");
        }
        return false;
    });

    $("body").on("click", ".erphpad-upload", function(){
        $("#adimage").trigger("click");
        $("#uploadad").change(function(){
            $("#uploadad").ajaxSubmit({
                dataType:  'json',
                beforeSend: function() {
                  	layer.msg('上传中...');  
                },
                uploadProgress: function(event, position, total, percentComplete) {

                },
                success: function(data) {
                  	if (data.error == "0") {
                    layer.msg('上传成功',{time:500}); 
                    $("#erphpad-image").val(data.image); 
                  	}else{
                    layer.msg('上传失败');  
                    return false;
                  	}
                },
                error:function(xhr){
                  	layer.msg('上传失败');    
                  	return false;
                }
            });  
            return false;                
        });
        return false;
    });

    $("body").on("click", ".erphpad-update-loader", function(){
        var aid = $(this).data("id"),
            atype = $(this).data("type");
        if(aid){
            var msgTips = layer.msg("处理中...", {time: -1});

            var ad_img = $("#erphpad-image").val();
            var ad_url = $("#erphpad-url").val();

            $.post(erphpad_ajax_url, {
                "action": "erphpad_update",
                "aid": aid,
                "link": ad_url,
                "img": ad_img
            }, function(result) {
            	layer.close(msgTips);
                if( result.status == 200 ){
                	layer.closeAll();
                    layer.msg("修改成功！");
                }else{
                	layer.msg(result.msg);
                }

            }, 'json'); 
        }else{
        	layer.msg("获取广告信息失败！");
        }
        return false;
    });

});