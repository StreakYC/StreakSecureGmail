(function(StreakSecureGmail){
	var $ = StreakSecureGmail.$,
		_ = StreakSecureGmail._,
		Gmail = StreakSecureGmail.Gmail;

	var CONSTANTS = {
		ENCRYPTED_NOTICE_TEMPLATE: [
			'<div class="h9 gt" style="background-color: lightyellow;">',
				'<div class="aev"><img src="images/cleardot.gif" class="aeu"></div>',
				'<div class="ado">',
					'<b>This message is encrypted.</b> ',
					'<span class="G8gNXb h8 ou streak__decrypt" idlink="" tabindex="0">Decrypt message with password</span>',
				'</div>',
				'<div class="streak__hint" style="display:none; margin-left: 36px; padding-bottom: 7px; font-style: italic;">',
					'Hint: ',
					'<span class="streak__hintInner"></span>',
				'</div>',
			'</div>'
		].join(""),
		DECRYPTED_NOTICE_TEMPLATE: [
			'<div class="h9 gt" style="background-color: lightgreen;">',
				'<div class="aev"><img src="images/cleardot.gif" class="aeu"></div>',
				'<div class="ado">',
					'<b>Message succesfully decrypted!</b>',
				'</div>',
			'</div>'
		].join("")
	};

	Gmail.bind('emailMessageLoaded', function(inEmailMessage){
		var emailMessage = $(inEmailMessage);

		var body = emailMessage.find('.adP');
		var noticeArea = emailMessage.find('.utdU2e');
		var hint;

		//are we encrypted?
		var encryptSpan = body.find('[hspace=streakEncrypted]');

		//let's make sure it's not in a gmail quote
		if(encryptSpan.parents().filter('.gmail_quote').length > 0){
			return;
		}

		if(encryptSpan.length > 0){
			noticeArea[0].innerHTML = CONSTANTS.ENCRYPTED_NOTICE_TEMPLATE;

			var marker = body.find('[hspace=streakMarkerOuter]');
			marker[0].innerHTML = ''; //don't need to show the link to download extension, since it's already installed

			var hintSpan = body.find('[hspace=streakHint]');
			if(hintSpan.length > 0){
				hint = body.find('[hspace=streakHintInner]')[0].textContent;
				hintSpan[0].innerHTML = ''; //clear it out

				var noticeHint = noticeArea.find('.streak__hint');
				noticeHint.show('block');
				noticeHint.find('.streak__hintInner')[0].textContent = hint;
			}

			var decrypt = noticeArea.find('.streak__decrypt');
			decrypt.onClick(function(e){
				askForPasswordAndDecrypt(body, emailMessage, hint);
			});
		}
	});

	function askForPasswordAndDecrypt(body, emailMessage, hint){
		var modal = StreakSecureGmail.Widgets.Modal.show('Decrypt Message');

		var inner = modal.find('.inner');
		var buttonArea = modal.find('.buttonArea');

		var innerHTML = [
			'<div class="xy">Decryption Password:</div>',
			'<input type="password" class="streak__password" value="">',
			'<div class="streak__extraHint">This is the password that the sender used to secure the message</div>',
			'<div class="streak__error" style="display:none;">Wrong password</div>'
		];

		if(hint && hint.length > 0){
			innerHTML = innerHTML.concat([
				'<div class="xy">Password Hint:</div>',
				'<div class="modal__hint"></div>'
			]);
		}
		inner[0].innerHTML = innerHTML.join("");

		if(hint && hint.length > 0){
			inner.find('.modal__hint')[0].textContent = hint;
		}

		var passwordInput = inner.find(".streak__password");
		var error = inner.find('.streak__error');

		var decrypt = Gmail.createButton(
			"Decrypt",
			function(e){
				var password = passwordInput[0].value;

				if(password && password.length > 0){
					try{
						decryptContent(password, body, emailMessage);
					}
					catch(err){
						error.show('block');
					}
				}
			}
		);

		passwordInput[0].addEventListener('keydown', function(e){
			if(e.which === 13){ //enter
				decrypt.click();
			}
		});

		buttonArea.append(decrypt[0]);

		passwordInput[0].focus();
	}

	function decryptContent(password, body, emailMessage){
		var encryptSpan = body.find('[hspace=streakEncrypted]');

		var text = sjcl.decrypt(password, atob(encryptSpan[0].textContent));

		if(text.indexOf('hspace="streakMarkerInner"') > -1){
			body[0].innerHTML = getTextHTML(stripTags(text));
			emailMessage.find('.utdU2e')[0].innerHTML = CONSTANTS.DECRYPTED_NOTICE_TEMPLATE;
			StreakSecureGmail.Widgets.Modal.close();
		}
	}

	// credit stackoverflow http://stackoverflow.com/a/5047731
	var charEncodings = {
		'\t': '&nbsp;&nbsp;&nbsp;&nbsp;',
		'  ': '&nbsp; ',
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'\n': '<br />',
		'\r': '<br />'
	};
	var space = /[\t ]/;
	var noWidthSpace = '&#8203;';

	function getTextHTML(text) {
		text = (text || '') + ''; // make sure it's a string
		//text = text.escapeHTML();
		text = text.replace(/\r\n/g, '\n'); // avoid adding two <br /> tags
		var html = '';
		var lastChar = '';

		for (var i = 0; i < text.length; i++) {
			var c = text[i];
			var charCode = text.charCodeAt(i);
			if (space.test(c) && !space.test(lastChar) && space.test(text[i + 1] || '')) {
				html += noWidthSpace;
			}
			html += c in charEncodings ? charEncodings[c] : charCode > 127 ? '&#' + charCode + ';' : c;
			lastChar = c;
		}

		return html;
	}

	function stripTags(text){
		return text.replace(/<\/?[^<>]*>/gi, '');
	}

})(StreakSecureGmail);
