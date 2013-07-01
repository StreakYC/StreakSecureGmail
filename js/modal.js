(function(StreakSecureGmail){
	var $ = StreakSecureGmail.$,
		_ = StreakSecureGmail._,
		Gmail = StreakSecureGmail.Gmail;

	var CONSTANTS = {
		MODAL_TEMPLATE: _.template([
			'<div class="Kj-JD" tabindex="-1">',
				'<div class="Kj-JD-K7 Kj-JD-K7-GIHV4" id="">',
				'<span class="Kj-JD-K7-K0  title"><%= title %></span>',
				'<span class="Kj-JD-K7-Jq close" ></span>',
				'</div>',
				'<div class="Kj-JD-Jz inner">',
				'</div>',
				'<div class="Kj-JD-Jl buttonArea">',
				'</div>',
			'</div>'
		].join(""))
	};

	var overlay = $(document.createElement('div'));
	overlay[0].innerHTML = '<div class="streak__overlayInner"></div><div class="streak__overlayModal"></div>';
	overlay.addClass('streak__overlay');
	overlay.hide();

	var overlayModal = overlay.find('.streak__overlayModal');

	var self, Modal;
	self = Modal = {

		show: function(title){
			var newModal = $(document.createElement('div'));
			newModal.addClass('streak__modal');
			newModal[0].innerHTML = CONSTANTS.MODAL_TEMPLATE({title: title});

			overlayModal[0].innerHTML = '';
			overlayModal.append(newModal[0]);
			overlay.show('block');

			newModal.find('.close').onClick(self.close);

			return newModal;
		},

		close: function(){
			overlay.hide();
		}

	};

	/* add modal css options */
	Gmail.ready(function(){
		var css = StreakSecureGmail.document.styleSheets[0];

		css.insertRule('.buttonArea {text-align: right;}');
		css.insertRule('.buttonArea .bbButton:last-child {margin-right: 0px;}');
		css.insertRule('.Kj-JD {max-height: 600px;}');
		css.insertRule('.Kj-JD .inner {padding-bottom: 1px;}');
		css.insertRule('.Kj-JD .inner input[type=text] {width: 100%;}');
		css.insertRule('.Kj-JD .xy {margin-top: 10px;}');
		css.insertRule('.Kj-JD div.inputFieldWrapper {padding-right:4px;padding-left:1px;margin-right:2px}');
		css.insertRule('.streak__overlayModal {width: 100%; height: 100%;}');
		css.insertRule('.streak__modal {width: 100%; height:100%; display:-webkit-flex;');
		css.insertRule('.streak__modal .xy {font-weight: bold;}');
		css.insertRule('.streak__modal .close {cursor: pointer;}');
		css.insertRule('.streak__modal h3 { margin-top: 10px; margin-bottom:5px; }');
		css.insertRule('.streak__overlay {position: fixed; top: 0px; bottom: 0px; left: 0px; right:0px; z-index: 100');
		css.insertRule('.streak__overlayInner {position: absolute; top:0px; bottom:0px; left: 0px; right:0px; background-color: white; opacity: 0.75;');
		css.insertRule('.streak__modal .Kj-JD {margin-left: auto; margin-right: auto; position: relative; -webkit-align-self: center;');

		Gmail.elements.body.append(overlay[0]);
	});


	StreakSecureGmail.Widgets.Modal = Modal;

})(StreakSecureGmail);
