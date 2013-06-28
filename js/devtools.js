var sidebar = null;
var runExpansionButton = null;
var showGraphButton = null;
var hideGraphButton = null;
var datasetQueries = new Object();
var lastDatasetSelected = '';

$(document).ready(function() {
	createShowGraphButton();
	createHideGraphButton();
	createRunExpansionButton();
	hideGraphButton.hide();

	
	runExpansionButton.click(function(e) {
		var dataSetEles = $(".tables-dataset-id-text");
		var datasetNames = [];
		for (var i = 0; i < dataSetEles.length; i++) {
			datasetNames.push($(dataSetEles[i]).text());
		}
		
		var spans = $('.CodeMirror-lines').find('span');
		var pres = $('.CodeMirror-lines > :first-child > :last-child pre');
		var queryStr = '';
		for (var i = 0; i < pres.length; i++) {
			var ele = $(pres[i]);
			var text = ele.text();
			for (var j = 0; j < datasetNames.length; j++) {
				var dataset = datasetNames[j];
				if (text.indexOf(dataset + ':first') > -1) {
					expandDataset(j);
					var tableName = $('#tables').find('[id*=' + dataset + '][id*=tableId]').first().find('.tables-table-id-text').text();
					text = text.replace(dataset + ':first', dataset + '.' + tablename);
				}
				else if (text.indexOf(dataset + ':last') > -1) {
					expandDataset(j);
					var tablename = $('#tables').find('[id*=' + dataset + '][id*=tableId]').last().find('.tables-table-id-text').text();
					text = text.replace(dataset + ':last', dataset + '.' + tablename);
				}
			}
			queryStr += text + "\n"
		}
		runQuery(queryStr);
	});

	
	showGraphButton.click(function(e){
		var data = [];
		var temp = [];

		clickButton($('#to-first'));
		temp = getResultsOffPage(true);
		data = data.concat(temp);

		var done = isOnLastResultPage();
		while (!done) {
			clickButton($('#to-next'));
			temp = getResultsOffPage(false);
			data = data.concat(temp);			
			done = isOnLastResultPage();
		} 
		clickButton($('#to-first'));
		showAllResults(data);
		showGraphButton.hide();
		hideGraphButton.show();
	});

	hideGraphButton.click(function(e){
		hideAllResults();
		showGraphButton.show();
		hideGraphButton.hide();
	});
	
	

	var t = setInterval(function() {
		// add run expansion button
		var runQueryButton = $('#query-run');
		if (runQueryButton.size() != 0) {
			if (runQueryButton.parent().find('#expand-query').size() == 0) {
				runExpansionButton.insertAfter(runQueryButton);
			}
		}
		
		// add show graph button
		var downloadButton = $('#download');
		if (downloadButton.size() != 0) {
			if (downloadButton.parent().find('#showGraphButton').size() == 0) {
				showGraphButton.insertBefore(downloadButton);
			}
			if (downloadButton.parent().find('#hideGraphButton').size() == 0) {
				hideGraphButton.insertBefore(downloadButton);
			}
		}
		
		// add cost indicator to query results
		var queryStatus = $("#query-status");
		if (queryStatus.size() > 0) {
			if (queryStatus.text().indexOf("Query running") > -1) {
				queryStatus.removeClass("costAnnotated");
			}
			if (!queryStatus.hasClass("costAnnotated")) {
				var text = queryStatus.html();
				var matches = text.match(/(\d+\.?\d*) (MB|GB|KB) processed/);
				if (matches != null && matches.length > 1) {
					queryStatus.addClass("costAnnotated");
					var gb = matches[1];
					if (matches[2] == "MB") {
						gb = gb/1024;
					}
					else if (matches[2] == "KB") {
						gb = gb/(1024*1024);
					}
					var costInCents = Math.round(3.5*gb*10)/10;
					queryStatus.html(text.substring(0, text.length-1) + ', <strong>Cost: ' + costInCents + '&cent;</strong>)');
				}
			}
		}
		
		// make results rows clickable to expand
		var resultTable = $('#result-table');
		if(resultTable.size() > 0){
		      var lower = new Date('01-01-1990');
		      var upper = new Date('01-01-2100');
		      
	          resultTable.find('tr.records-row td').each(function(tdI, td){
	               var ts = td.innerHTML;
	               
	               if(parseInt(ts) > 0){
	                   var d = new Date();
	                   d.setTime(parseInt(ts)/1000);
	                   if(d > lower && d < upper){
	                	   td.innerHTML = d.toLocaleString().replace(/\sGMT\S*/, '');  
	                   }	                   
	               }
	           });
		}
		
		// make sure the page is scrollable
		removeHeightFromRecords();
		
		// refresh dataset queries
		refreshDatasetQueries();
		
		// add handler item to dataset menus to query entire dataset
		var datasets = $('.tables-dataset-row');
		for (var i = 0; i < datasets.length; i++) {
			attachEventHandlerToDataSetRow($(datasets[i]));
		}
		
		// add menu item to query data set
		addQueryDatasetMenuItem();
		
		// add 'add all' row to schema table
		addAddAllRow();
		
	}, 500);
	
	setInterval(function() {		
		$(".row-number").css("background-color", "#F9EDBE");
		
		$(".records-cell").css("max-width", "1000px").css("overflow", "hidden");
		
		$(".row-number").off();
		$(".row-number").click(function(e){
			var rowNum = $(e.target);
			var hidden = true;
			if (rowNum.parent().find("pre").size() > 0) {
				hidden = false;
			}
			if (hidden) {
				rowNum.parent().find(".records-cell").each(function(index) {
					$(this).html("<pre style=\"overflow:auto\">" + $(this).html() + "</pre>");
				});	
			}
			else {
				rowNum.parent().find(".records-cell").each(function(index) {
					$(this).html($(this).children().html());
				});
			}
		});

	},1000);	
});

function expandDataset(i) {
	if ($('.tables-dataset-icon')[i].className.indexOf('collapsed') > -1) {
		clickButton($($('.tables-dataset-icon')[i]));
	}
}

function showAllResults(data) {
	var html = "<table id=\"allresults\" class=\"records-table\"><tbody>";
	html += "<tr>";
	for (var i = 0; i < data[0].length; i++) {
		html+= "<td class=\"records-header\">" + data[0][i] + "</td>";
	}
	html += "</tr>";

	for (var i = 1; i < data.length; i++) {
		html+= "<tr class=\"records-row\">";
		for (var j = 0; j < data[i].length; j++) {
			html += "<td class=\"records-cell\">" + data[i][j] + "</td>";
		}
		html+= "</tr>";
	}
	html+="</tbody></table>";


	$('#result-table').before(html);
	$('#result-table').hide();
	$('#records-nav').hide();

}

function hideAllResults() {
	$('#result-table').show();
	$('#records-nav').show();
	$('#allresults').remove();
}

function addAddAllRow() {
	var table = $('.schema-table');
	if (table.length > 0 && !$(table[0]).hasClass('functionalityAdded')) {
		table.addClass('functionalityAdded');
		var tableBody = table.children().first();
		var firstRow = tableBody.children().first();
		var clone = firstRow.clone();
		clone.find('.schema-table-field').text('Add All Fields');
		clone.find('.schema-table-field').css("background-color", "#F9EDBE");
		clone.find('.schema-table-type').text('');
		clone.click(function(e){
			var old = firstRow.find('.schema-table-field').text();
			var rows = tableBody.children();
			var toInsert = '';
			for (var i = 0; i< rows.length - 1; i++) {
				toInsert += rows.slice(i, i+1).find('.schema-table-field').text() + ', ';
			}
			toInsert = toInsert.substring(0, toInsert.length-2);
			
			var schemaTableField = firstRow.find('.schema-table-field'); 
			schemaTableField.text(toInsert);
			clickButton(schemaTableField);
			schemaTableField.text(old);
		});
		tableBody.append(clone);
	}
};

function addQueryDatasetMenuItem() {
	var menu = $($('.goog-menu-vertical')[1]);
	if (menu.length > 0 && menu.find('#queryDataSetItem').length == 0) {
		var newElement = $(menu.children()[menu.children().length-1]).clone();
		newElement.attr('id', 'queryDataSetItem');
		newElement.find('.goog-menuitem-content').text('Query Dataset');
		newElement.hover(function() {
			newElement.addClass('goog-menuitem-highlight');
		},
		function() {
			newElement.removeClass('goog-menuitem-highlight');
		});
		newElement.click(function(e){
			var minusColon = lastDatasetSelected.substring(lastDatasetSelected.indexOf(':') + 1, lastDatasetSelected.length);
			var expando = $('.tables-dataset-row[datasetid*=' + minusColon + ']').find('.tables-dataset-icon');
			if (expando.hasClass('tables-dataset-icon-collapsed')) {
				clickButton(expando);
				refreshDatasetQueries();
			}
			fillInQuery(datasetQueries[lastDatasetSelected]);
		});
		menu.append(newElement);
	}
};

function removeHeightFromRecords() {
	$('.records').css('height', '');
};

function refreshDatasetQueries() {
	var eles = $('#tables').children();
	for (var i = 0; i < eles.length; i++) {
		if ($(eles[i]).hasClass('tables-dataset-row')) {
			var query = 'SELECT  FROM ';
			var foundCount = 0;
			for (var j = i+1; j < eles.length; j++) {
				if ($(eles[j]).hasClass('table-nav-link')) {
					query += '[' + $(eles[i]).attr('datasetid') + '.' + $(eles[j]).attr('data-tooltip') + '],'
					foundCount++;
				}
				else {
					if (foundCount > 0) {
						query = query.substring(0, query.length-1);
					}
					else {
						query = '';
					}
					datasetQueries[$(eles[i]).attr('datasetid')] = query;
					break;
				}
			}
		}
	}
};

function attachEventHandlerToDataSetRow(dataSetRow) {
	var menu = dataSetRow.find('.tables-dataset-menu');
	if (!dataSetRow.hasClass('handlerAttached')) {
		menu.click(function(e) {
			lastDatasetSelected = dataSetRow.attr('datasetid');
			dataSetRow.addClass('handlerAttached');
			console.log(lastDatasetSelected);
		});
	}
};


function runQuery(query) {
	fillInQuery(query);
	clickButton($("#query-run"));
};

function fillInQuery(query) {
	clickButton($("#query-history-button"));
	$(".queries-table-row").last().find(".queries-table-content").html(query);
	$(".queries-table-row").last().find(".queries-table-content").attr("data-sql", query);
	clickButton($(".queries-table-row").last());
};

function getQueryBoxContents() {
	var preTags = $(".CodeMirror-lines").children().first().children().last().children();
	if (preTags.size() == 0) {
		return "";
	}
	
	var retVal = "";
	preTags.each( function(index, element) {
		retVal += $(this).text() + "\n";
	});
	retVal = retVal.trim();
	
	return retVal;
};

function normalizeTitle(title) {
	title = title.trim();
	if (title.charAt(title.length-1) == ';') {
		title = title.substring(0, title.length-1);
	}
	return title;
};

function createShowGraphButton() {
	showGraphButton = $("<div id=\"showGraphButton\" class=\"goog-inline-block jfk-button jfk-button-standard jfk-button-collapse-right\" role=\"button\" style=\"-webkit-user-select: none;\" tabindex=\"0\">Show All Results</div>");
	showGraphButton.hover(function() {
		showGraphButton.addClass('jfk-button-hover');
	},
	function() {
		showGraphButton.removeClass('jfk-button-hover');
	}
	);
};

function createHideGraphButton() {
	hideGraphButton = $("<div id=\"hideGraphButton\" class=\"goog-inline-block jfk-button jfk-button-standard jfk-button-collapse-right\" role=\"button\" style=\"-webkit-user-select: none;\" tabindex=\"0\">Hide All Results</div>");
	hideGraphButton.hover(function() {
		hideGraphButton.addClass('jfk-button-hover');
	},
	function() {
		hideGraphButton.removeClass('jfk-button-hover');
	}
	);
};

function createRunExpansionButton() {
	runExpansionButton = $("<div id=\"expand-query\" class=\"jfk-button jfk-button-primary goog-inline-block\" role=\"button\" style=\"-webkit-user-select: none;\" aria-disabled=\"false\" aria-label=\"foo\" data-tooltip=\"This will expand dataset:first/last toi the first or last table in the specified dataset.\" data-tooltip-align=\"b,c\" data-tooltip-delay=\"1000\" tabindex=\"0\">Run With Expansion</div>");
};


function isOnLastResultPage() {
	var navStr = $('.page-number').text();
	navStr = navStr.substring(navStr.indexOf('-')+1);
	navStr = navStr.split(' ');
	if (navStr[0] == navStr[2]) {
		return true;
	}

	return false;
};

function getResultsOffPage(includeHeader) {
	var retVal = [];
	var offset = 0;
	if (includeHeader) {
		var headerCells = $('.records-header');
		var headerVals = [];
		for (var i = 0; i < headerCells.length; i++) {
			headerVals.push($(headerCells[i]).text());
		}
		retVal[0] = headerVals;
		offset = 1;
	}



	var rows = $('.records-row');
	for (var i = 0; i < rows.length; i++) {
		var rowCells = $(rows[i]).children();
		var row = [];
		for (var j = 0; j < rowCells.length; j++) {
			row.push($(rowCells[j]).text());
		}
		retVal[i + offset] = row;
	}
	return retVal;
};

function clickButton(sb) {
	var pos = sb.offset();
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("mousedown", true, true, window,
	    0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
	sb[0].dispatchEvent(evt);	
	
	evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("mouseup", true, true, window,
	    0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
	sb[0].dispatchEvent(evt);
	
	evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window,
	    0, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
	sb[0].dispatchEvent(evt);
};