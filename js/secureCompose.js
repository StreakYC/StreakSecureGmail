(function(StreakSecureGmail){
	var $ = StreakSecureGmail.$,
		_ = StreakSecureGmail._,
		Gmail = StreakSecureGmail.Gmail;

	var CONSTANTS = {
		LOCK_IMAGE: 'data:png;base64,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',
		SECURE_COMPOSE_COLOR: 'red'
	};

	var _isSecure = false;
	var _secureComposeWindows = [];

	Gmail.ready(function(){
		var compose = $('[gh=cm]');
		var composeParent = compose[0].parentNode;

		compose[0].style.display = 'inline-block';
		compose[0].style.width = '75px';
		compose[0].style.minWidth = '75px';

		var secureCompose = $(document.createElement('div'));
		secureCompose[0].innerHTML = [
			'<div style="',
			'height: 100%;',
			'width: 100%;',
			'background-color: white;',
			'-webkit-mask: url(' + CONSTANTS.LOCK_IMAGE + ');',
			'-webkit-mask-size: 20px;',
			'"></div>'
		].join("");

		secureCompose.addClass('T-I J-J5-Ji T-I-KE L3');
		secureCompose[0].style.display = 'inline-block';
		secureCompose[0].style.minWidth = '20px';
		secureCompose[0].style.marginLeft = '1px';
		secureCompose[0].style.verticalAlign = 'top';

		$(composeParent).append(secureCompose[0]);

		secureCompose[0].addEventListener('click', function(e){
			_isSecure = true;
			Gmail.preventDraftSaving = true;
			compose.click();
		});
	});

	Gmail.bind('newComposeWindow', function(compose){
		if(_isSecure){
			setupCompose(compose);
		}

		_isSecure = false;
	});

	function setupCompose(compose){
		compose = $(compose);

		/* make the header read */
		compose.find('.pi')[0].style.backgroundColor = CONSTANTS.SECURE_COMPOSE_COLOR;
		compose.find('.pi .o')[0].style.backgroundColor = CONSTANTS.SECURE_COMPOSE_COLOR;
		compose.find('.m')[0].style.backgroundColor = CONSTANTS.SECURE_COMPOSE_COLOR;
		compose.find('.n')[0].style.backgroundColor = CONSTANTS.SECURE_COMPOSE_COLOR;
		compose.find('.k')[0].style.backgroundColor = CONSTANTS.SECURE_COMPOSE_COLOR;

		/* reset the title */
		var title = compose.find('.Hp');
		/*title[0].innerHTML = [
			'<span style="',
			'background-color: white;',
			'-webkit-mask: url(' + CONSTANTS.LOCK_IMAGE + ');',
			'-webkit-mask-size: 20px;',
			'height: 20px;',
			'width: 20px;',
			'display: inline-block;',
			'vertical-align: top;',
			'margin-top: -6px;',
			'margin-left: -5px;',
			'"></span>',
			'New Secured Message'
		].join("");*/

		/* make new send button */
		var currentSend = compose.find('.Up [role=button]').first();
		currentSend.hide();

		var newSend = Gmail.createButton('Send Encrypted', function(){
			getPasswordInfo(compose, currentSend);
		});

		currentSend[0].parentNode.insertBefore(newSend[0], currentSend[0]);

		_secureComposeWindows.push(compose);
	}

	function getPasswordInfo(compose, currentSend){
		var modal = StreakSecureGmail.Widgets.Modal.show('Encrypt Message');

		var inner = modal.find('.inner');
		var buttonArea = modal.find('.buttonArea');

		inner[0].innerHTML = [
			'<div class="xy">Encryption Password:</div>',
			'<input type="text" class="streak__password" value="" placeholder="This is the password that the recipient(s) will have to use to view the secure message">',
			'<div class="xy">Password Hint (Optional):</div>',
			'<input type="text" class="streak__hint" value="" placeholder="Instead of telling the recipients the password, give them a hint that only they would know">'
		].join("");

		var passwordInput = inner.find(".streak__password");
		var hintInput = inner.find(".streak__hint");

		var encryptAndSend = Gmail.createButton(
			"Encrypt & Send",
			function(e){
				var password = passwordInput[0].value;
				var hint = hintInput[0].value;

				if(password && password.length > 0){
					//encrypt and replace contents and subject
					encryptEmailAndSend(password, hint, compose, currentSend);
				}
			}
		);

		buttonArea.append(encryptAndSend[0]);

		passwordInput[0].focus();
	}

	function encryptEmailAndSend(password, hint, compose, currentSend){
		var body = compose.find('.Ap [contenteditable=true]');
		var bodyText = body[0].innerHTML;

		bodyText = [
			'<div style="font-weight: bold;">',
			'<span hspace="streakMarkerOuter"></span>',
			'This message is encrypted from the sender, get the ',
			'<a href="https://www.streak.com">',
				'Secure Streak Gmail extension',
			'</a> ',
			'to decrypt it.</div>',
			'<br />',
			'<span hspace="streakEncrypted">',
			btoa(StreakSecureGmail.sjcl.encrypt(password, '<span hspace="streakMarkerInner"></span>' + bodyText)),
			'</span>'
		];

		if(hint){
			bodyText = bodyText.concat([
				'<br />',
				'<br />',
				'<emph style="font-weight:bold;font-style: italic;">Hint: </emph>',
				'<span hspace="streakHint" class="font-style: italic;">',
				hint,
				'</span>'
			]);
		}

		body[0].innerHTML = bodyText.join("");

		StreakSecureGmail.Widgets.Modal.close();
		currentSend.click();
	}

	_.repeatEvery(
		function(){
			var newComposeWindows = [];
			for(var ii=0; ii<_secureComposeWindows.length; ii++){
				if(_secureComposeWindows[ii].isInBody()){
					newComposeWindows.push(_secureComposeWindows[ii]);
				}
			}

			_secureComposeWindows = newComposeWindows;
			if(_secureComposeWindows.length === 0){
				Gmail.preventDraftSaving = false;
			}
		},
		500
	);

})(StreakSecureGmail);
