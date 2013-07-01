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

		//are we encrypted?
		var encryptSpan = body.find('[hspace=streakEncrypted]');

		if(encryptSpan.length > 0){
			noticeArea[0].innerHTML = CONSTANTS.ENCRYPTED_NOTICE_TEMPLATE;
			var decrypt = noticeArea.find('.streak__decrypt');
			decrypt.onClick(function(e){
				askForPasswordAndDecrypt(body, emailMessage);
			});
		}
	});

	function askForPasswordAndDecrypt(body, emailMessage){
		var hintSpan = body.find('[hspace=streakHint]');

		var modal = StreakSecureGmail.Widgets.Modal.show('Decrypt Message');

		var inner = modal.find('.inner');
		var buttonArea = modal.find('.buttonArea');

		var innerHTML = [
			'<div class="xy">Decryption Password:</div>',
			'<input type="text" class="streak__password" value="" placeholder="This is the password that the sender used to secure the message">',
			'<div class="streak__error" style="display:none;">Wrong password</div>'
		];

		if(hintSpan.length > 0){
			innerHTML = innerHTML.concat([
				'<div class="xy">Password Hint:</div>',
				'<div>' + hintSpace[0].textContent + '</div>'
			]);
		}
		inner[0].innerHTML = innerHTML.join("");

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

		buttonArea.append(decrypt[0]);

		passwordInput[0].focus();
	}

	function decryptContent(password, body, emailMessage){
		var encryptSpan = body.find('[hspace=streakEncrypted]');

		var text = sjcl.decrypt(password, atob(encryptSpan[0].textContent));

		if(text.indexOf('hspace="streakMarkerInner"') > -1){
			body[0].innerHTML = text;
			emailMessage.find('.utdU2e')[0].innerHTML = CONSTANTS.DECRYPTED_NOTICE_TEMPLATE;
			StreakSecureGmail.Widgets.Modal.close();
		}
	}

})(StreakSecureGmail);
