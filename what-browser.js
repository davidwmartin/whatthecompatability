// var csv = require('csv'),
var csv = require('csv'),
	fs = require('fs');


// represents total sessions in date range you're considering
var totalSessions = 522367;
// var totalSessions = 323508;
// Proxi: 53,695
// IP: 56,577
// EBM: 323,508
// EBBI: 88,587

// array of browser objects gets built for me to check
var checkThese = [];
// set coverage target (0.98 = 98%)
var coverageTarget = 0.75;


// parser options and callback
var parser = csv.parse({
		delimiter: ',',
		columns: true,
	}, function(err, data){
		if (err){
			console.log(err);
		}
		whatBrowsers(data);
	});

// create read stream from CSV source file to parser
fs.createReadStream('./data/express-browser-info.csv').pipe(parser);




// function to tell me what browsers to check -- called in parser callback
function whatBrowsers(_data) {
	// set coverage to 0 to start
	var coverage = 0;

	// sorts entries based on passed in function (defined below)
	var sorted = _data.sort(compareSessions);

	
	// Loop through array of browser entries
	for(i = 0; i < sorted.length; i++){
		var entry = sorted[i];
		// if subversion numbers are included, remove them

		if (entry.version.indexOf('.') >= 0){
			var truncVersion = entry.version.substring(0, entry.version.indexOf('.'));
			entry.version = truncVersion;
		} else {
			// console.log(entry.browser);
		}

		// set prop giving percentage of total sessions each entry represents
		var sesh = parseInt(entry.sessions);
		entry.sessions = sesh;
		entry.percentage = sesh / totalSessions;

		if (coverage < coverageTarget){
			// if we're still below the coverage target, push to new array and continue counting till we hit the target
			checkThese.push(entry);
			coverage += entry.percentage;
			
			// if we get to the last loop and we didn't hit our coverage target, alert the user
			if (coverage < coverageTarget && i == sorted.length - 1) {
				console.log('you dont have enough browser entries to reach your desired coverage level');
			}
		}
		else {
			// break out of loop
			console.log('done!');
			console.log('you only have to check '+ checkThese.length +' different browser configurations to acheive '+coverageTarget*100+'% coverage!');
			break;
		}

	}

	// var checkTheseSorted = checkThese.sort(compareSessions);
	fs.writeFile('data/output.json', JSON.stringify(checkThese, null, 2));

	// var generator = generate({columns: ['int', 'bool'], length: 2});
	// generator.pipe(process.stdout);

}


// compare session counts, sort Descending
function compareSessions(_a, _b){
	return _b.sessions - _a.sessions;
}
