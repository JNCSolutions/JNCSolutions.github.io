/*************************************************/
/* This javascript file can be used to add any   */
/* other javascript that you might need to your  */
/* plugin. You can create new javascript and CSS */
/* files as you need and they will automatically */
/* be added to the head of the document          */
/* THIS: contact_script.js						 */
/*************************************************/

/**
 *
 * This function sets the page up so that all form validation can
 * be added to the form for when js is enabled allowing simple, on
 * page validation. This will be backed up by the back-end
 *
 */
	var Dom = YAHOO.util.Dom;
	var YE = YAHOO.util.Event;
	var telOkay = false;
	var emailOkay = false;

	function forminit(){
		var textAreas = document.getElementsByTagName('textarea');
		for(var i=0; i<textAreas.length; i++){
			YE.on(textAreas[i], 'click', hideText);
		}
		var theForms = document.getElementsByTagName('form');
		for(var i=0; i<theForms.length; i++){
			if(theForms[i].id == 'form_' + (i + 1)){
				YE.on(theForms[i], 'submit', checkFormDetails);
				YE.on(theForms[i], 'reset', resetFormDetails);
			}
		}

		var successMsg = document.getElementById('formSuccess');
		if(successMsg){
			setTimeout("hideAlertMessage()", 3000);
		}

		/**
		 * Any inputs with a class of 'checkInput' are those that are required and the function here
		 * calls the check to make sure these fields have been filled out correctly before allowing submission
		 * of the form
		 *
		 **/
		var checkInputs = Dom.getElementsByClassName('checkInput');
		if(checkInputs.length > 0){
			for(var i=0;i<checkInputs.length;i++){
				var newImg = document.createElement('img');
				newImg.setAttribute('src', '/images/warn.png');
				newImg.setAttribute('title', 'This field is required');
				newImg.setAttribute('class', 'errorImg');
				newImg.setAttribute('className', 'errorImg');
				checkInputs[i].parentNode.appendChild(newImg);

				/* Check a single field option*/
				YE.on(checkInputs[i], 'keyup', checkSingleFormDetails);
				YE.on(checkInputs[i], 'blur', checkSingleFormDetails);
			}

			/**
			 * Creates a paragraph at the end of the form with a small key indicating what the
			 * warning image actually means
			 *
			 **/
			var reqField = document.createElement('p');
			var form = Dom.getAncestorByTagName(checkInputs[0], 'form');
			form.appendChild(reqField);
			var newImg = document.createElement('img');
			newImg.setAttribute('src', '/images/warn.png');
			newImg.setAttribute('title', 'This field is required');
			reqField.appendChild(newImg);
			newImg.setAttribute('style', 'padding: 0 10px; float: none; margin: 0; border: 0;');
			newImg.style.cssText = 'padding: 0 10px; float: none; margin: 0; border: 0;';
			reqField.appendChild(document.createTextNode('Denotes a required field'));
		}
	}

	/**
	 * Hide textarea text when the textarea is clicked
	 *
	 **/
	function hideText(e){
		if(this.value == 'Enter Your Text'){
			this.value = '';
		}
	}

	/**
	 * hideSuccess
	 * Hides the success (or error) message that displays when the form has been submitted
	 *
	 **/
	function hideAlertMessage(){
		var removeElement = function (){
			var fadeBlock = document.getElementById('fadeBlock');
	   		fadeBlock.style.visibility = 'hidden';
		}
		var myAnim = new YAHOO.util.Anim("fadeBlock", {
  		  height: { to: 0 },
  		  opacity: { to: 0 }
   		}, 2, YAHOO.util.Easing.easeOut);

   		myAnim.animate();
		myAnim.onComplete.subscribe(removeElement);
	}

	/**
	 * Form sumission success handler
	 * @access public
	 * @return void
	 **/
	function formSubmitSuccess(o){
		var msg = document.createElement('p');
		msg.setAttribute('id', 'hideMe');
		msg.setAttribute('class', 'success_message');
		msg.appendChild(document.createTextNode('Your email has been sent successfully'));
		var contentinnerwrapper = $('content_inner_wrapper');
		var firstchild = contentinnerwrapper.firstChild;
		contentinnerwrapper.insertBefore(msg, firstchild);

		var formToHide = contentinnerwrapper.getElementsByTagName('form')[0];
		var formDim = Dom.getRegion(formToHide);
		var formHeight = formDim.bottom - formDim.top;
		var formWidth = formDim.right - formDim.left;

		var overlay = document.createElement('div');
		formToHide.appendChild(overlay);
		Dom.setStyle(formToHide, 'position', 'relative');Dom.setStyle(overlay, 'width', formWidth + 'px');
		Dom.setStyle(overlay, 'height', formHeight + 'px');Dom.setStyle(overlay, 'opacity', '0.2');
		Dom.setStyle(overlay, 'background', 'black');Dom.setStyle(overlay, 'position', 'absolute');
		Dom.setStyle(overlay, 'top', '0');Dom.setStyle(overlay, 'left', '0');

		// do the omiture stuff if needs be
		var runscode = $('run_s_code');
		if(runscode) {
			if (runscode.value == 1) {
				var siteTitle = document.getElementsByTagName('h1')[0].innerHTML;
				var pageTitle = Dom.getElementsByClassName('this_page')[0].innerHTML;
				var crmnum = $('crmnum').value;
				s.server="btexchanges.com";
				s.channel="BT Customerstreet Sitebuilder:Business:" + pageTitle + ":Contact";
				s.pageName="BT Customerstreet Sitebuilder:Page:" + pageTitle + ":Sent";
				s.hier1="BT.com,"+s.pageName.replace(/:/g,",");
				s.prop1="Not Logged In";
				s.prop3="Normal";
				s.prop4=siteTitle;
				s.prop5=crmnum;
				s.prop6="Email";
				s.prop34=crmnum;
				s.prop36=siteTitle;
				s.eVar1=s.prop1;
				s.eVar4=s.prop4;
				s.eVar5=s.prop5;
				s.eVar6=s.prop6;
				s.eVar34=s.prop34;
				s.eVar36=s.prop36;
				s.events=s.getValOnce('event18:'+crmnum);
				/************* DO NOT ALTER ANYTHING BELOW THIS LINE !**************/
				s_code=s.t();if(s_code)document.write(s_code);
			}
		}
	}

	/**
	 * form submission error handler
	 * @access public
	 * @return void
	 **/
	function formSubmitError(o){
		var msg = document.createElement('p');
		msg.setAttribute('id', 'hideMe');
		msg.setAttribute('class', 'error_message');
		msg.appendChild(document.createTextNode('There was an error sending the message please try again'));
		var contentinnerwrapper = $('content_inner_wrapper');
		var firstchild = contentinnerwrapper.firstChild;
		contentinnerwrapper.insertBefore(msg, firstchild);
	}

	/**
	 * Updated version of the form submission checks. This function will check the form details for each of the
	 * required fields (denoted by the class 'checkInput') and either allow, or disallow submission based on
	 * whether there were any errors in the form. Needs some work to condense the function as it is currently raw
	 * checking field by field
	 *
	 **/

 	function checkFormDetails(e){
		var inputs = Dom.getElementsByClassName('checkInput');
		var errorImgs = Dom.getElementsByClassName('errorImg');
		for(var i=0;i<errorImgs.length;i++){
			errorImgs[i].parentNode.removeChild(errorImgs[i]);
		}
		var errors = "";
		var regex = "";
		var errorMsg = "";
		for(var i=0;i<inputs.length;i++){
			switch(inputs[i].name){
				case "name":
					regex = /^([ \u00c0-\u01ffa-zA-Z])+$/;
					break;
				case "email":
					regex = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
					break;
				case "captcha":
					regex = /^([a-zA-z0-9]{5})$/;
					break;
				case "topic":
					regex = "";
					break;
				case "day":
				case "month":
					regex = /^([0-9]{2})$/;
					break;
				case "year":
					regex = /^([0-9]{4})$/;
					break;
				/*case "mobile":
				case "tel":
					regex = /^(\+[0-9]{1,3})?([0-9]{10,11})$/;
					errorMsg = 'Please do not use spaces in phone numbers';
					break;*/
				case "postcode":
					regex = /^([A-Za-z]{1,2})([0-9]{1,2})( )([0-9]{1})([A-Za-z]{2})$/;
					break;
				case "feedback":
				case "enquiry":
				case "comments":
					regex = /^(?!Enter Your Text)/;
					break;
				default:
					regex = "";
					break;
			}

			if(inputs[i].value == "" || !inputs[i].value.match(regex)){
				var field = inputs[i].name;
				if((telOkay == true && field == 'email') || (emailOkay == true && field == 'tel')){
					Dom.removeClass(inputs[i], 'errorInput');
					Dom.removeClass(inputs[i], 'okayInput');
				} else {
					if (field == 'email') {
						emailOkay = false;
						errors += '  You need to enter a valid email address\n';
					}else if(field == 'tel'){
						telOkay = false;
					} else {
						errors += '  You need to add the '+ field +' field\n';
					}
					inputs[i].setAttribute('class', 'checkInput errorInput');
					inputs[i].setAttribute('className', 'checkInput errorInput');
					var newImg = document.createElement('img');
					newImg.setAttribute('src', '/images/fail.png');
					newImg.setAttribute('title', 'You have an error');
					newImg.setAttribute('class', 'errorImg');
					newImg.setAttribute('className', 'errorImg');
					inputs[i].parentNode.appendChild(newImg);
					if(errorMsg !== "" && (inputs[i].name == "tel" || inputs[i].name == "mobile")){
						var parentEl = inputs[i].parentNode;
						var firstDiv = Dom.getFirstChild(parentEl);
						if(firstDiv.tagName !== 'DIV' && firstDiv.tagName !== 'div'){
							var refNode = Dom.getPreviousSibling(inputs[i]);
							var newNode = document.createElement('div');
							newNode.style.cssText = 'margin-left: 115px;color: #F00';
							newNode.appendChild(document.createTextNode(errorMsg));
							Dom.insertBefore(newNode, refNode);
							/*inputs[i].parentNode.appendChild(document.createTextNode(errorMsg));*/
							inputs[i].parentNode.style.cssText = 'background: #FFC0C1;padding: 5px 0 30px;margin-bottom: 5px;';
							errors += errorMsg + '\n';
						}
					}
				}
			} else {
				var field = inputs[i].name;
				if (field == 'email') {
					emailOkay = true;
				}
				if(field == 'tel') {
					telOkay = true;
				}
				inputs[i].setAttribute('class', 'checkInput okayInput');
				inputs[i].setAttribute('className', 'checkInput okayInput');
				var newImg = document.createElement('img');
				newImg.setAttribute('src', '/images/tick.png');
				newImg.setAttribute('title', 'This field is correct');
				newImg.setAttribute('class', 'errorImg');
				newImg.setAttribute('className', 'errorImg');
				inputs[i].parentNode.appendChild(newImg);
				var parentEl = inputs[i].parentNode;
				parentEl.removeAttribute('style');
				var firstDiv = Dom.getFirstChild(parentEl);
				if(firstDiv.tagName == 'DIV' || firstDiv.tagName == 'div'){
					firstDiv.parentNode.removeChild(firstDiv);
				}
			}
		}
		if(errors !== ""){
			YE.stopEvent(e);
			alert("Please correct the following errors:\n\n"+ errors);
		}else{
			// submit the form via ajax and send the Omniture stuff if required
			YE.stopEvent(e);
			var contentwrapper = $('content_inner_wrapper');
			var contactform = contentwrapper.getElementsByTagName('form')[0];
			var formData = YAHOO.util.Connect.setForm(contactform);

			var formSubmitUrl = "http://sitebuilder.btcustomerstreet.com/page/submit_contact_form?"+formData;
			var objTransaction = YAHOO.util.Get.script(formSubmitUrl, { onSuccess: formSubmitSuccess });
		}
	}

	/**
	 * This function does exactly the same as the above, but performs the checks on each key press on the keyboard. Will
	 * only fire a not errored state when the field passes all checks
	 *
	 **/

	function checkSingleFormDetails(e){

		var errorImgs = this.parentNode.getElementsByTagName('img');
		for(var i=0;i<errorImgs.length;i++){
			errorImgs[i].parentNode.removeChild(errorImgs[i]);
		}
		var errors = "";
		var regex = "";
		var errorMsg = "";
		switch(this.name){
			case "name":
			case "town":
			case "county":
			case "country":
				regex = /^([ \u00c0-\u01ffa-zA-Z])+$/;
				break;
			case "email":
				var telInput = $('tel');
				if (this.value !== "") {
					regex = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
				}else{
					regex = "";
				}
				break;
			case "captcha":
				regex = /^([a-zA-z0-9]{5})$/;
				break;
			case "topic":
				regex = "";
				break;
			case "day":
			case "month":
				regex = /^([0-9]{2})$/;
				break;
			case "year":
				regex = /^([0-9]{4})$/;
				break;
			/*case "mobile":
			case "tel":
				regex = /^(\+[0-9]{1,3})?([0-9]{10,11})$/;
				errorMsg = 'Please do not use spaces in telephone or mobile numbers';
				break;*/
			case "postcode":
				regex = /^([A-Za-z]{1,2})([0-9]{1,2})( )([0-9]{1})([A-Za-z]{2})$/;
				break;
			case "feedback":
			case "enquiry":
			case "comments":
				regex = /^(?!Enter Your Text)/;
				break;
			default:
				regex = "";
				break;
		}
		if(this.value == "" || !this.value.match(regex)){
			var field = this.name;
			if((telOkay == true && field == 'email') || (emailOkay == true && field == 'tel')){
				Dom.removeClass(this, 'errorInput');
				Dom.removeClass(this, 'okayInput');
			} else {
				if (field == 'email') {
					emailOkay = false;
					errors += '  You need to enter a valid email address\n';
				}else if(field == 'tel'){
					telOkay = false;
				} else {
					errors += '  You need to add the '+ field +' field\n';
				}
				this.setAttribute('class', 'checkInput errorInput');
				this.setAttribute('className', 'checkInput errorInput');
				var newImg = document.createElement('img');
				newImg.setAttribute('src', '/images/fail.png');
				newImg.setAttribute('title', 'You have an error');
				newImg.setAttribute('class', 'errorImg');
				newImg.setAttribute('className', 'errorImg');
				this.parentNode.appendChild(newImg);
				if(errorMsg !== "" && (this.name == "tel" || this.name == "mobile")){
					var parentEl = this.parentNode;
					var firstDiv = Dom.getFirstChild(parentEl);
					if(firstDiv.tagName !== 'DIV' && firstDiv.tagName !== 'div'){
						var refNode = Dom.getPreviousSibling(this);
						var newNode = document.createElement('div');
						newNode.style.cssText = 'margin-left: 115px;color: #F00';
						newNode.appendChild(document.createTextNode(errorMsg));
						Dom.insertBefore(newNode, refNode);
						/*inputs[i].parentNode.appendChild(document.createTextNode(errorMsg));*/
						this.parentNode.style.cssText = 'background: #FFC0C1;padding: 5px 0 30px;margin-bottom: 5px;';
						errors += errorMsg + '\n';
					}
				}
			}
		} else {
			var field = this.name;
			if (field == 'email') {
				emailOkay = true;
			}
			if(field == 'tel') {
				telOkay = true;
			}
			this.setAttribute('class', 'checkInput okayInput');
			this.setAttribute('className', 'checkInput okayInput');
			var newImg = document.createElement('img');
			newImg.setAttribute('src', '/images/tick.png');
			newImg.setAttribute('title', 'This field is correct');
			newImg.setAttribute('class', 'errorImg');
			newImg.setAttribute('className', 'errorImg');
			this.parentNode.appendChild(newImg);

			var parentEl = this.parentNode;
			parentEl.removeAttribute('style');
			var firstDiv = Dom.getFirstChild(parentEl);
			if(firstDiv.tagName == 'DIV' || firstDiv.tagName == 'div'){
				firstDiv.parentNode.removeChild(firstDiv);
			}
		}
	}

	function resetFormDetails(e){
		var errorInputs = Dom.getElementsByClassName('errorInput');
		for(var i=0;i<errorInputs.length;i++){
			errorInputs[i].removeAttribute('class');
			errorInputs[i].setAttribute('class', 'checkInput');
			errorInputs[i].setAttribute('className', 'checkInput');
			var parentEl = errorInputs[i].parentNode;
			parentEl.removeAttribute('style');
			var firstDiv = Dom.getFirstChild(parentEl);
			if(firstDiv.tagName == 'DIV' || firstDiv.tagName == 'div'){
				firstDiv.parentNode.removeChild(firstDiv);
			}
		}
		var okayInputs = Dom.getElementsByClassName('okayInput');
		for(var i=0;i<okayInputs.length;i++){
			okayInputs[i].removeAttribute('class');
			okayInputs[i].setAttribute('class', 'checkInput');
			okayInputs[i].setAttribute('className', 'checkInput');
		}
		var errorImgs = Dom.getElementsByClassName('errorImg');
		for(var i=0;i<errorImgs.length;i++){
			errorImgs[i].setAttribute('src', '/images/warn.png');
		}
	}

// Initiate the init function for page load

YE.onDOMReady(forminit);