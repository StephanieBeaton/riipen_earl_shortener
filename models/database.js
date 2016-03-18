var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/earl-shortener';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE myurls(id SERIAL PRIMARY KEY, original_url TEXT not null, short_url TEXT)');
query.on('end', function() { client.end(); });
