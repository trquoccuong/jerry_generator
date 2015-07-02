'use strict';

let Jerry = require('jerryjs');

let app = new Jerry;

app.config();

app.listen(8118);

/** Logging initialization */
console.log('Application started on port ' + 8118);