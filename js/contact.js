/*************************************************/
/* Just like the plugin.class file you will need */
/* to change all instances of 'Form' to   		*/
/* those of the name of your plugin              */
/*************************************************/

/*********************************************/
/************* Plugin Name Javascript *********/
/*********************************************/
YAHOO.namespace('contact');
if (!YD) var YD = YAHOO.util.Dom;
if (!YE) var YE = YAHOO.util.Event;
if (!$) var $ = YD.get;
// Shortcut to the main URL of the webservice, so that each call to that URL only needs the final path (ease of use for file path changing)
var subURL = 'http://webservices.sitebuilder.customerstreet.com/rapidsite/xstandard/';
var clientID;

/**
 * createParamElement
 * Because Internet Explorer cannot create some elements properly (especially with certain attributes), this function is required
 * to create the parameters for the XStandard Editor, which caters for all variations of the creation process
 *
 * @access public
 * @return element
 **/
document.createParamElement = function(type, name, value) {
  var element;
  try {
    element = document.createElement('<'+type+' name="'+name+'" value="'+value+'">');
  } catch (e) { }
  if (!element || !element.name) { // Not in IE, then
    element = document.createElement(type)
    element.name = name;
    element.value = value;
  }
  return element;
}

YAHOO.contact.xsEdit = {
	xsDialog: null,
	submitUrl: "/plugins/contact/extras/contact_ajax.php",
	imageHeight : null,
	imageWidth : null,
	self : this,

	/**
	 * Setup
	 * Finds all the editable elements by class "client_edit"
	 * Attaches an event handler to each editable elements click event with a callback to editElement
	 * Adds the tooltips to the editable elements to show they are editable
	 * Attaches an event handler to the forms submit event with a callback to catchXSSubmit

	 * @access public
	 * @return void
	 **/
	setup: function(o){
		if (document.getElementById('admin_toolbar')) {
			$('contact_plugin').style.display = 'none';
			var clientEdit = YD.getElementsByClassName('client_edit', '', 'content_inner_wrapper');
			YE.addListener(clientEdit, 'click', this.editElement);
			var clientEdit = YD.getElementsByClassName('client_edit', 'h2', 'content_inner_wrapper');
			YE.addListener(clientEdit, 'click', this.editElement);
			this.addTooltips(clientEdit);
			/**
			 * Capture the output of the xStandard object and insert it into a hidden input field
			 *
			 **/
			var xStandard = YD.getElementsByClassName('contact_plugin', 'form', 'extra_2')[0];
			YE.on(xStandard, 'submit', this.catchXSSubmit);
		}
	},

	/**
	 * CatchXSSubmit
	 * Catches the submit event of the form containing the xStandard editor

	 * @access public
	 * @return void
	 **/
	catchXSSubmit: function(e){
		var pageCopy = document.getElementById('page_copy');
		pageCopy.EscapeUnicode = true;
	   	document.getElementById('xhtml').value = pageCopy.value;
	},

	/**
	 * getNodeName
	 * Takes a XHTML tag name and returns a descriptive string for each
	 * @access public
	 * @return void
	 **/
	getNodeName: function (tag){
		tag = tag.toLowerCase();
		switch(tag){
			case 'h2':
				var tagName = 'Main Heading';
				break;
			case 'h3':
				var tagName = 'Sub-Heading';
				break;
			case 'h4':
				var tagName = 'Minor Heading';
				break;
			case 'p':
				var tagName = 'Paragraph';
				break;
			case 'li':
			case 'ul':
			case 'ol':
				var tagName = 'List';
				break;
			case 'img':
				var tagName = 'Image';
				break;
			default:
				var tagName = false;
		} // switch
		return tagName;
	},

	/**
	 *
	 * @access public
	 * @return void
	 **/
	getEditNode: function(queryNode){
		while(queryNode.nodeType != 3 && queryNode.nodeName.toLowerCase() != 'img'){
			queryNode = queryNode.hasChildNodes? queryNode.firstChild : queryNode.nextSibling;
		} // while
		if (queryNode.parentNode.nodeName.toLowerCase() == 'strong'

		|| queryNode.parentNode.nodeName.toLowerCase() == 'em'
		|| queryNode.nodeType == 3) {
			queryNode = queryNode.parentNode;
		}
		return queryNode;
	},

	/**
	 * addTooltips
	 * Adds a title attribute to each of the editable elements
	 * @access public
	 * @return void
	 **/
	addTooltips: function (elementList){
		if (elementList.length) {
			var wrapper = document.getElementById("content_inner_wrapper");
			if (!YD.hasClass(wrapper, 'yui-skin-sam')) YD.addClass(wrapper, 'yui-skin-sam');
			var tagList = ['h3', 'p', 'img', 'ul'];
			var idList = [];
			var thisNode;
			var contentType;
			for (var i=0; i<elementList.length; i++){
				if (!elementList[i].getElementsByTagName) continue;
				for (var n=0; n<tagList.length; n++){
					var nodes = elementList[i].getElementsByTagName(tagList[n]);
					for (var x=0; x<nodes.length; x++){
						var thisNode = nodes[x];
						if (!thisNode.hasAttribute('id')) {
							thisNode.setAttribute('id', 'tooltip_node_'+x);
						}
						contentType = YX.getNodeName(thisNode.nodeName);
						content = 'Edit this '+contentType+' by clicking on it.';
						thisNode.setAttribute('title', content);
						idList[idList.length] = thisNode.getAttribute('id');
					}
				}
			}
			YX.toolTip = new YAHOO.widget.Tooltip("simple_tooltip", {context: idList, container: wrapper});
		}else{
			return false;
		}
	},

	/**
	 * closeDialog a tidy up function called after the xStandard editor has finished
	 * Removes the dropsheet used to fade out non-edited elements and the editor
	 * itself from the DOM
	 * active
	 * @access public
	 * @return void
	 **/
	closeDialog: function(){
		if(YX.formDialog){
			YX.formDialog.destroy();
			YX.formDialog = null;
		}
		if(YX.xsDialog) {
			YX.xsDialog.destroy();
			YX.xsDialog = null;
		}
		return true;
	},

	/**
	 * UpdateDom
	 * Finds the node specified by element_id, removes it's child nodes
	 * then replaces them with the child nodes of dom_node, and copies over
	 * the attributes of each node
	 * active
	 * @access public
	 * @return void
	 **/
	updateDom: function(elementId, domNode){
		var oldNode = document.getElementById(elementId);
		if (oldNode.hasChildNodes()) {
			var oldChild = oldNode.firstChild;
			while(oldChild){
				var nextChild = oldChild.nextSibling;
				oldChild.parentNode.removeChild(oldChild);
				oldChild = nextChild;
			} // while
		}
		if (domNode.hasChildNodes()) {
			newChild = domNode.firstChild;
			while(newChild){
				var nextChild = newChild.nextSibling;
				oldNode.appendChild(newChild);
				newChild = nextChild;
			} // while
		}
/*		var parentTag = oldNode.parentNode;
		oldNode = parentTag.replaceChild(domNode, oldNode);
		var editNode = YD.getAncestorByClassName('client_edit');
		YE.addListener(editNode, 'click', form.editElement);*/
		return true;
	},


	/**
	 * getXmlFromString
	 * Converts a string of xml data into a dom element and returns the element
	 * active
	 * @access public
	 * @return void
	 **/
	getXmlFromString: function(xml_string){
		if (window.ActiveXObject) {
			var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
			xml_doc.async = 'false';
			xml_doc.loadXML(xml_string);
		} else {
			var xml_parser = new DOMParser();
			var xml_doc = xml_parser.parseFromString(xml_string, 'text/xml');
			if (xml_doc.documentElement.nodeName == 'parsererror') {
				return false;
			}
		}
		var xml_root = xml_doc.documentElement;
		return xml_root;
//		var copyNode = YD.getElementsByClassName('client_edit', null, xml_root);
//		if (copyNode.length > 0) {
//			return copyNode[0];
//		}else{
//			return false;
//		}
	},

	/**
	 * getXmlFromDom converts a DOM element into an XML string
	 * active
	 * @access public
	 * @return void
	 **/
	getXmlFromDom: function(domNode){
		if (domNode.hasAttribute("style")) domNode.removeAttribute('style');
		var children = YD.getChildren(domNode);
		for( var i=0; i< children.length; i++){
			if (children[i].hasAttribute('style')) children[i].removeAttribute('style');
		} // for
		if (domNode.xml) {
			var xmlValue = domNode.xml;
		}else{
			var newDom = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
			/*var newDom = document.implementation.createDocument("", "page_copy", null);*/
			var newNode = newDom.importNode(domNode, true);
			newDom.documentElement.appendChild(newNode);
			var xmlSerialiser = new XMLSerializer();
			var xmlValue = xmlSerialiser.serializeToString(newDom.documentElement);
		}
		return xmlValue;
	},

	/**
	 * createEditor
	 * Creates the XStandard Editor passing the correct parameters and returning it inside a form
	 * active
	 * @access public
	 * @return void
	 **/
	createEditor: function (editNode, xsId, xsForm, dimxy, buttons, tagName){
		this.method;
		this.newParam = [];
		this.newParam.toolbar = {'name': 'ToolbarWysiwyg', 'value': buttons};
		this.newParam.styles =	{'name': 'ShowStyles', 'value': 'yes'};
		this.newParam.victim = {'name': 'Victim', 'value': editNode.id};
		this.newParam.timestamp = {'name': 'EnableTimestamp', 'value': 'no'};
		/**
		 * Clone the pages xstandard form (not just the object)
		 *
		 **/
		var xsEditor = xsForm.cloneNode(true);
		/**
		 * Set the private properties
		 *
		 **/
		var id = xsId;
		var width = dimxy[0];
		var height = dimxy[1];
		if (editNode.hasChildNodes()) {
			var child = editNode.firstChild;
			while(child){
				if (child.nodeType != 3) {
					var xmlValue = editNode.innerHTML;
					break;
					}
				child = child.nextSibling;
			} // while
		}
		if (typeof xmlValue == 'undefined') {
			if(navigator.appVersion.indexOf("MSIE")!== -1){
				var xmlValue = '<h2>' + $('header_1').innerHTML + '</h2>';
			} else {
				var xmlValue = YX.getXmlFromDom(editNode);
			}
		}
/*		var tagName = form.getNodeName(editNode.nodeName);*/
		var self = this;
		var xsObject = xsEditor.getElementsByTagName('object')[0];
		var editor = document.createElement('div');
		var editHead = document.createElement('div');
		var editHeadText = document.createTextNode('Edit this '+tagName);
		var editBody = document.createElement('div');
		/**
		 * Set the parameters of the xstandard object that need changing
		 *
		 **/
		var setParameters = function (xs){
			if(navigator.appVersion.indexOf("MSIE")!== -1){
				var objParametersOut = document.getElementById('page_copy');
				var objParameters = objParametersOut.getElementsByTagName("param");
			} else {
				var objParameters = xs.getElementsByTagName("param");
			}
			/*var xParam;
			var objName;
			var objValue;*/
			for (var i=0; i<objParameters.length; i++){
				var paramName = objParameters[i].getAttribute('name');
				var paramValue = objParameters[i].getAttribute('value');
				switch(paramName){
					case 'width':
						objParameters[i].value = width;
						break;
					case 'height':
						objParameters[i].value = height;
						break;
					case 'Value':
						if(navigator.appVersion.indexOf("MSIE")!== -1){
							xmlValue = str_replace('"', '&quot;', xmlValue);
						}
						objParameters[i].value = xmlValue;
						break;
					case 'ClientID':
						// Needed fix for IE to get the URl of the current domain for the document library path
						clientID = objParameters[i].value;
						break;
					default:
						continue;
				} // switch
			}
		};
		/**
		 * Create the xstandard parameters that are missing
		 *
		 **/
		var createParameters = function (xs){
			if(navigator.appVersion.indexOf("MSIE")!== -1){
				/**
				 *  Unfortunately, because of IE's shocking handling of object when stored in a variable the parameters
				 *  do not get passed to the new object properly so each one has to be built 'manually' rather than dynamically
				 *
				 **/
				subURL = $('xstandardBase').value;
				paramNode = document.createParamElement('param', 'ClientID', clientID);
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'License', subURL+'license.txt');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'Styles', subURL+'styles.xml');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'ImageLibraryURL', subURL+'image_library/imagelibrary.php '+subURL+'image_library/publiclibrary.php');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'Base', subURL+'document_library');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'AttachmentLibraryURL', subURL+'document_library/attachmentlibrary.php');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'SpellCheckerURL', subURL+'spellchecker/spellchecker.php');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'Options', '66054');
				xs.appendChild(paramNode);
				paramNode = document.createParamElement('param', 'Value', xmlValue);
				xs.appendChild(paramNode);
			}
			for(var param in self.newParam){
				// Again, IE cannot create some elements in the normal way so a function has been written to cater for this problem
				paramNode = document.createParamElement('param', self.newParam[param].name, self.newParam[param].value);
				/*paramNode = document.createElement('param');
				paramNode.setAttribute('name', self.newParam[param].name);
				paramNode.setAttribute('value', self.newParam[param].value);*/
				xs.appendChild(paramNode);
			}
		};
		/**
		 * Set the attributes of the xstandard object
		 *
		 **/
		if(xsObject){
			xsObject.setAttribute("id", "xsedit");
			xsObject.setAttribute("width", width);
			xsObject.setAttribute("height", height);
			setParameters(xsObject);
			createParameters(xsObject);
		}

		/**
		 * Create the divs that will hold the editor
		 *
		 **/
		editor.setAttribute("id", xsId);
		editHead.setAttribute("class", "hd");
		editHead.setAttribute("className", "hd");
		editHead = editor.appendChild(editHead);
		editHead.appendChild(editHeadText);
		editBody.setAttribute("class", "bd");
		editBody.setAttribute("className", "bd");
		editBody = editor.appendChild(editBody);
		/**
		 * Set the action attribute for the form
		 * and attach the editor to the div
		 **/
		xsEditor.setAttribute("action", YX.submitUrl);
		xsEditor = editBody.appendChild(xsEditor);

		var keyWordHead = document.createElement('h3');
		keyWordHead.setAttribute('id', 'keyWordHead');
		editor.appendChild(keyWordHead);
		keyWordHead.appendChild(document.createTextNode('Your Page Key Phrases'));
		var keyWords = document.getElementById('keyphraseList');
		keyWords = keyWords.cloneNode(true);
		keyWords.id = 'keyphraseListClone';
		editor.appendChild(keyWords);
		keyWords.style.display = 'block';

		var containerSave = document.createElement('div');
		editor.appendChild(containerSave);
		containerSave.setAttribute('id', 'container-save');
		YE.on(containerSave, 'click', saveButtonClicked);

		return editor;
	},

	/**
	 *
	 * active
	 * @access public
	 * @return void
	 **/
	getEditor: function(element, buttons, tagName){
		var editExists = YD.getElementsByClassName('yui-dialog', 'div', 'extra_2');
		if (editExists.length > 0) {
			if (YX.xsDialog != null) YX.xsDialog.destroy();
			if (YX.imgDialog != null) YX.imgDialog.destroy();
		}
		editExists = null;
		width = 600;
		height = 400;
		/* Change these values to change the height and width of the popup windows to edit various page elements */
		if (tagName == 'Image') {
			width = parseInt(YD.getStyle(element, 'width')) + 30;
			height = parseInt(YD.getStyle(element, 'height')) + 60;
		}
		/* Clone the standard xStandard editor */
		if (document.forms["contact_plugin"] == 'undefined') {
			return false;
		}
		var xsForm = document.forms["contact_plugin"];
		var xsEditor = YX.createEditor(element, 'editor', xsForm, [width, height], buttons, tagName);
		/* Append the editor div to one of the spare divs */
		var parent = document.getElementById('extra_2');
		parent.appendChild(xsEditor);
		YX.xsDialog = new YAHOO.widget.Dialog(xsEditor,
			{	fixedcenter:true,
				modal: true,
				close: true,
				width: "620px",
				zIndex: 1000
			});
		YX.xsDialog.render();
/*		if (tagName == 'Image') {
			var xsObject = xsEditor.getElementsByTagName('object')[0];
			xsObject.CallToolbarButton('image');
		}*/
		YX.xsDialog.show();
		var editorMask = $('editor_mask');
		if(editorMask){
			maskHeight = editorMask.style.cssText;
			maskHeight = maskHeight.split('; ');
			newMaskHeight = new Array();
			var j = 0;
			for(var i=0;i<maskHeight.length;i++){
				newMaskHeight[j] = maskHeight[i].split(': ');
				j++;
			}
			for(var i=0;i<newMaskHeight.length;i++){
				theMaskHeight = newMaskHeight[i].toString();
				theMaskHeight = theMaskHeight.split(',');
				if(theMaskHeight[0].toLowerCase() == 'height'){
					i++;
					var theRealMaskHeight = theMaskHeight[1];
				}
			}
			maskHeight = theRealMaskHeight.split('px');
			maskHeight = maskHeight[0];
			maskHeight = parseFloat(maskHeight);
			maskHeight = maskHeight - 520;
			editorMask.style.cssText = 'z-index: 1001; height: '+ maskHeight +'px; width: 1263px; display: block;';
		}
		return true;
	},

	/**
	 * saveContent main ajax call
	 * Gets the whole user edited content div and uses an ajax post call to push this together with
	 * the site id, page id, object id and object type id up to the server.
	 * active
	 * @access public
	 * @return void
	 **/
	saveContent : {
		copy : null,
		siteId : null,
		pageId : null,
		nodeId : null,
		submitUrl : null,
		update : function (){
			this.siteId = document.getElementById("siteid_contact_plugin").value;
			this.pageId = document.getElementById("pageid_contact_plugin").value;
			this.copy = escape(this.copy);
			if(this.copy == ''){
				this.copy = '<p style="padding: 5px;"></p>';
			}
			this.copy = str_replace('+', '#105;', this.copy);
			this.submitUrl = "/plugins/contact/extras/contact_ajax.php";
			var postData = 'siteid='+this.siteId+'&pageid='+this.pageId+'&nodeid='+this.nodeId+'&copy='+this.copy;
			this.copy = YAHOO.util.Connect.asyncRequest('POST', this.submitUrl, updateComplete, postData);

		},
		success : function (objResponse){
			//alert("Ajax returned: "+objResponse.statusText);
			YX.closeDialog();
			var responseDiv = document.createElement('div');
			var wrapper = document.getElementById('wrapper');
			wrapper.appendChild(responseDiv);
			var newHTML = objResponse.responseText;
			//alert("Content Updated Successfully");

		},
		failure : function (objResponse){
			//alert("Ajax returned: "+objResponse.statusText);
			//alert("Content Not Updated Successfully. Please Try Again");
		}
	},

	formSaveContent : {
		formSuccess : function (objResponse){
			YX.closeDialog();
			var oldForm = document.getElementById('formSend');
			if(objResponse.responseText !== undefined){
				objResponse.responseText = '<div>'+objResponse.responseText+'</div>';

				oldForm.innerHTML = "<div id=\"formSend\">"+objResponse.responseText+"</div>";

				var newForm = document.getElementById('formResponse');
				oldForm.innerHTML = "<div id=\"formResponse\">"+newForm.innerHTML+"</div>";

				var mainForm = document.getElementById('form_1');
				if(mainForm){
					var inputs = mainForm.getElementsByTagName('input');
					for(var i=0; i<inputs.length; i++){
						inputs[i].setAttribute('disabled', 'disabled');
					}
					var textareas = mainForm.getElementsByTagName('textarea');
					for(var i=0; i<textareas.length; i++){
						textareas[i].setAttribute('disabled', 'disabled');
					}
				}
			}
		},
		formFailure : function (objResponse){
			//alert("Ajax returned: "+objResponse.statusText);
			alert("Form Not Updated Successfully. Please Try Again");
		}
	},

	contentChanged : function(xsEditor){
		xsContent = xsEditor.value;
		if (xsContent.indexOf('<img ') != -1) {
			xsDom = YX.getXmlFromString(xsContent);
			if (xsDom) {
				xsDom = document.importNode(xsDom, true);
				xsDom = document.body.appendChild(xsDom);
				var imageTags = xsDom.getElementsByTagName('img');
				if (imageTags.length > 1) {
					var classValue = 'none';
					for( var i=0; i<imageTags.length; i++){
						if (imageTags[i].hasAttribute('class')){
							classValue = String(imageTags[i].getAttribute('class'));
						}
						if (classValue.indexOf('client_edit') != -1){
							var oldImage = imageTags[i];
						}else{
							var newImage = imageTags[i];
						}
					} // for
					if (typeof oldImage != 'undefined' && typeof newImage != 'undefined') {
						oldImage.setAttribute('src', newImage.getAttribute('src'));
						if (newImage.getAttribute('src') != '') {
							oldImage.setAttribute('src', newImage.getAttribute('src'));
						}
						xsEditor.value = YX.getXmlFromDom(oldImage);
					}
				}else{
					if (imageTags[0].hasAttribute('height')) {
						var imgHeight = parseInt(imageTags[0].getAttribute('height'));
						if (typeof(YX.imageHeight) != 'number') {
							YX.imageHeight = imgHeight;
						}else{
							if (YX.imageHeight != imgHeight) {
								imageTags[0].setAttribute('height', YX.imageHeight);
							}
						}
					}
					if (imageTags[0].hasAttribute('width')) {
						var imgWidth = parseInt(imageTags[0].getAttribute('width'));
						if (typeof(YX.imageWidth) != 'number') {
							YX.imageWidth = imgWidth;
						}else{
							if (YX.imageWidth != imgWidth) {
								imageTags[0].setAttribute('width', YX.imageWidth);
							}
						}
					}
			/*		if (xsDom.tagName != 'img') xsDom = xsDom.getElementsByTagName('img')[0];*/
					xsEditor.value = YX.getXmlFromDom(imageTags[0]);
				}
				xsDom.parentNode.removeChild(xsDom);
			}
		}
		return true;
	},

	/**
	 *
	 * @access public
	 * @return void
	 **/
	editElement: function(e, objTag){
		if (objTag == null) objTag = this;
		if (typeof objTag.nodeName == 'string') {
			var tagType = objTag.nodeName.toLowerCase()
			switch(tagType){
				case "h2" :
					YX.editHeading(objTag);
					break;
				case "h3" :
				case "h4" :
				case "ul":
				case "ol":
				case "li":
//					form.editList(objTag);
//					break;
				case "p":
				case "span":
				case "strong":
				case "em":
					YX.editParagraph(objTag);
					break;
				case "form":
					// TO MAKE THE FORM EDITABLE UNCOMMENT THIS
					//YX.editForm(objTag);
					break;
				case "div":
					if (objTag.firstChild.nodeName.toLowerCase() == 'img') {
						YX.editImage(objTag);
					}else{
						YX.editParagraph(objTag);
					}
					break;
				default:
					alert("Tag Select Failed:"+objTag.nodeName);
			} // switch
		}else{
		 alert("Tag node name is undefined");
		}
	},

	editFormObj: function(element, buttons, tagName, formId){

        /*function destroyCopy(e){
        	if(YX.xsDialog){
	        	YX.xsDialog.destroy();
	        	var editorDiv = document.getElementById('editorDiv');
	        	if(editorDiv){
	        		editorDiv.parentNode.removeChild(editorDiv);
	        	}
				var newForm = document.getElementById('newFormClone');
				if(newForm){
					newForm.parentNode.removeChild(newForm);
				}
			}
		}*/


		var formEditExists = YD.getElementsByClassName('yui-dialog', 'div', 'extra_1');
		if (formEditExists.length > 0) {
			if (YX.formDialog != null) YX.formDialog.destroy();
		}

		function submitDetails(e){
			YE.stopEvent(e);

			var newForm = document.getElementById('newFormClone');
			var formData = YAHOO.util.Connect.setForm(newForm);

			formData = escape(formData);

			var siteId = document.getElementById("siteid_contact_plugin").value;
			var pageId = document.getElementById("pageid_contact_plugin").value;
			var formSubmitUrl = "/plugins/contact/extras/contact_ajax.php";
			var formPostData = 'siteid='+siteId+'&pageid='+pageId+'&'+formData+'&nodeid='+element.id;
			var formcopy = YAHOO.util.Connect.asyncRequest('POST', formSubmitUrl, formUpdateComplete, formPostData);

		}

		var editorDiv = document.createElement('div');
		editorDiv.setAttribute('id', 'formEditorDivNew');
		var form = document.getElementById('formEditor');

		if(form){
			var parent = document.getElementById('extra_1');
			newForm = form.cloneNode(true);
			parent.appendChild(newForm);
			parent.appendChild(editorDiv);
			newForm.removeAttribute('class');
			newForm.removeAttribute('className');
			newForm.removeAttribute('style');
			newForm.setAttribute('style', 'width: 500px');
			/*newForm.style.cssText = 'width: 500px';*/
			newForm.setAttribute('id', 'newFormClone');
			var currentInputs = element.getElementsByTagName('label');
			theFors = new Array();
			j = 0;
			for (var i=0; i<currentInputs.length;i++) {
				var attributeNow = currentInputs[i].getAttribute('for') || currentInputs[i].htmlFor;
				attributeNow = str_replace('check', '', attributeNow);
				theFors[j] = attributeNow;
				j++;
			}
			// theFors is an array of all fors that exist in the current form
			var newInputs = newForm.getElementsByTagName('input');
			for(var i=0; i<newInputs.length;i++){
				for (var p=0; p<theFors.length; p++) {
					if (theFors[p] == newInputs[i].value) {
						newInputs[i].setAttribute('checked', 'checked');
						newInputs[i].setAttribute('defaultChecked', 'defaultChecked');
					}
				}
			}
			YX.formDialog = new YAHOO.widget.Dialog(editorDiv,
				{	fixedcenter:true,
					draggable: false,
					modal: true,
					close: true,
					width: 510,
					zIndex: 1000
				});
			YX.formDialog.setHeader("Choose Your Form Fields");
			YX.formDialog.setBody(newForm);
			YX.formDialog.render();
			YX.formDialog.show();

			var containerSave = document.createElement('div');
			editorDiv.appendChild(containerSave);
			containerSave.setAttribute('id', 'container-save');
			YE.on(containerSave, 'click', submitDetails);

			/*var oClose = YX.xsDialog.close;
	        YE.on(oClose, "click", destroyCopy);*/

	        //YE.on(newForm, 'submit', submitDetails);
		}
	},

	/**
	 *
	 * active
	 * @access public
	 * @return void
	 **/
	editHeading: function(objHead){
/*		objDetails = form.getTagdetails(objHead);*/
		var buttons = 'spellchecker, copy, paste,,help';
		var editor = YX.getEditor(objHead, buttons, 'Heading');
	},

	/**
	 *
	 * active
	 * @access public
	 * @return void
	 **/
	editList: function(objList){
		if (objList.nodeName.toLowerCase() == "li") {
			objList = YD.getAncestorByClassName(objList, 'client_edit');
		}
/*		objDetails = form.getTagdetails(objList);*/
		var buttons = 'strong, em, underline, hyperlink, attachment,, spellchecker, copy, paste,,help';
		var editor = YX.getEditor(objList, buttons, 'List');
	},

	editParagraph: function(objPara){
		if (objPara.nodeName.toLowerCase() != 'div') {
			itemNode = objPara;
			while(itemNode.parentNode.nodeName.toLowerCase() != 'div'){
				itemNode = itemNode.parentNode;
			} // while
			objPara = itemNode;
		}
/*		objDetails = form.getTagdetails(objPara);*/
		var buttons = 'strong, em, underline,, hyperlink, attachment, unordered-list, ordered-list,, spellchecker, copy, paste,,help';
		var editor = YX.getEditor(objPara, buttons, 'Text');
	},

	editForm: function(objForm){
		if(objForm.nodeName.toLowerCase() != 'form'){
			objForm = YD.getElementsByTagName('form');
			objForm = objForm[0];
		}
		var formId = objForm.id;
		var buttons = 'strong, em, underline, hyperlink, attachment, spellchecker, save, help';
		var editor = YX.editFormObj(objForm, buttons, 'Form', formId);
	}
};
if (!YX) var YX = YAHOO.contact.xsEdit;
YE.onDOMReady(YX.setup, YX, true);

/**
 * Ajax callback object
 *
 **/
updateComplete = {
	success : YX.saveContent.success,
	failure: YX.saveContent.failure,
	scope: YX.saveContent
};

formUpdateComplete = {
	success : YX.formSaveContent.formSuccess,
	failure: YX.formSaveContent.formFailure,
	scope: YX.formSaveContent
};

/**
 * xsButtonClicked listens for the button click event on the xStandard editor
 * If the save button has been clicked, a dom update process is followed:
 * 1. Get the content of the editor and convert it into a DOM node
 * 2. Find the Id of the node being edited (stored as parameter 'Victim')
 * 3. Update the node being edited with the new data
 * @access public
 * @return void
 **/
xsButtonClicked = function(id, button, state){
	document.getElementById(id).EscapeUnicode = true;
	var xsEditor = document.getElementById(id);
	switch(button) {
		case 'save':
			var xsParameters = xsEditor.getElementsByTagName('param');
			for (var i = 0; i < xsParameters.length; i++){
				if (xsParameters[i].getAttribute('name') == 'Victim') {
					var oldNodeId = xsParameters[i].getAttribute('value');
				}
				if(xsParameters[i].getAttribute('name') == 'Value'){
					var startText = xsParameters[i].getAttribute('value');
				}
			}
			//xsEditor.EscapeUnicode = true;
			//YX.saveContent.copy = xsEditor.value;
			//alert(YX.saveContent.copy);
			YX.saveContent.nodeId = oldNodeId;
			var victimType = oldNodeId.substring(0, oldNodeId.indexOf('_'));
			var victim = document.getElementById(oldNodeId);

			if(xsEditor.value !== ''){
				switch(victimType){
					case 'header':
						if(navigator.appVersion.indexOf("MSIE")!== -1){
							newValue = xsEditor.value;
							newValue = newValue.toString();
							newValue = stripTags(newValue, null);
							victim.innerHTML = newValue;
							YX.saveContent.copy = '<h2>' + newValue + '</h2>';
						} else {
							var domHeader = YX.getXmlFromString(xsEditor.value);
							if (domHeader) {
								domHeader = document.importNode(domHeader, true);
								domHeader = document.body.appendChild(domHeader);
								var headerTag = domHeader.getElementsByTagName('h2')[0];
								if (headerTag) victim.textContent = headerTag.textContent;
							}
							domHeader.parentNode.removeChild(domHeader);
							YX.saveContent.copy = xsEditor.value;
						}
						break;
					case 'text':
						victim.innerHTML = xsEditor.value;
						YX.saveContent.copy = xsEditor.value;
						break;
					default:
						;
				} // switch
			} else {
				var youSure = confirm("Warning: removing all content will remove this section from the page completely and cannot be recovered");
				if(youSure){
					switch(victimType){
						case 'header':
							victim.innerHTML = '<h2>This Is Major Heading 1</h2>';
							YX.saveContent.copy = '<h2>This Is Major Heading 1</h2>';
							break;
						case 'text':
							victim.innerHTML = '<p style="padding: 5px;"></p>';
							YX.saveContent.copy = '<p style="padding: 5px;"></p>';
							break;
						default:
							break;
					} // switch
				} else {
					//alert("I'm here!" + startText);
					xsEditor.value = startText;
					return false;
				}
			}
			/* CAUSES EDITOR TO COMPLETELY CRASH FIREFOX AND SAFARI (AND OPERA)
			YX.closeDialog();*/
			YX.saveContent.update();
			break;
		case 'image':
			break;
	}// switch
	/*	activeElements = YAHOO.util.Dom.getElementsByClassName('clickable', null, 'content_inner_wrapper');
		for (var i=0; i<activeElements.length; i++){
			YAHOO.util.Dom.removeClass(activeElements[i], 'clickable');
		}*/
	return true;
};

/**
 *
 * @access public
 * @return void
 **/
xsTagListChanged = function (id){
	xsEditor = document.getElementById(id);
	var update = YX.contentChanged(xsEditor);
	if (!update) alert('Could not change content');
	return true;
}

/**
 *
 * @access public
 * @return void
 **/
xsContentChanged = function (id){
	xsEditor = document.getElementById(id);
	var update = YX.contentChanged(xsEditor);
	if (!update) alert('Could not change content');
	return true;
};

function saveButtonClicked(){
	xsButtonClicked('xsedit', 'save', null)
}