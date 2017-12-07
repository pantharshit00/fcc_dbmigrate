// !!!!!!!!!!!!!! EDIT CONFIG FILE FIRST !!!!!!!!!!

// IMPORTANT IMPORTANT INSTALL wp-basic auth in your wordpress install
// Download it from github https://github.com/WP-API/Basic-Auth and install it as a plugin

// JUST CHANGING THING A BIT WE ARE GONNA USE THE DATABASE
// INSTEAD OF JSON FILE FOR MIGRATION
// AS IT IS EFFICIENT AND PAINLESS
// YOU CAN CONNECT TO DB EASILY AS YOU CAN CONNECT FROM SQL STUDIO
// PLACE INFO IN CONFIG JS AS YOU MIGHT LEAK IT

// IMPORTS (JUST FOR YOUR INFO YOU CAN USE import from syntax USING BABEL-NODE)
// WE ARE GOING TO USE SEQUELIZE FROM OUR ORM

const Sequelize = require('sequelize');
const fetch = require('node-fetch');
const config = require('./config');
const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: config.DB_DIALECT
  }
);

let counter = 0;
// important add one which you are using in the original db
// $ yarn add pg pg-hstore
// $ yarn add mysql2
// $ yarn add sqlite3
// $ yarn add tedious // MSSQL
// see sequelize docs for more info

// Modify query as you like to get the data required
async function getData() {
  // might you need to test the query in sql studio
  const res = await sequelize.query(
    `SELECT content_id,content_html,content_title, content_status FROM content WHERE content_status = 'A'`
  );
  const posts = res[0];
  for (post of posts) {
    //MAKE API CALL TO WP
    const url = config.WP_URI;
    const postData = {
      content: post.content_html,
      title: post.content_title,
      status: 'publish'
    };
    // FOR AUTHENTICATION FOR WP
    const base64User = new Buffer(
      `${config.WP_USER}:${config.WP_PASS}`
    ).toString('base64');
    fetch(url, {
      body: JSON.stringify(postData),
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Basic ${base64User}`
      }
    })
      .then(res => res.json())
      .then(res => {
        // LOGING HOW MUCH DONE
        counter += 1;
        if (counter % 500 == 0) console.log('POST INSERTED ' + counter);
      });
  }
}

getData();

sequelize.sync().then(() => {
  console.log('YOOO UP n RUNNING');
});
