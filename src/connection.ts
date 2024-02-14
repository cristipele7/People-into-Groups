import mysql, { Connection } from 'mysql';

const params = {
  host: 'localhost',
  port: 3307,
  database: 'organization',
  user: '',
  password: ''
};

export const ConncetionDB = async (): Promise<Connection> => {
  const connection = mysql.createConnection(params);

  return new Promise((resolve, reject) => {
    connection.connect((error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(connection);
        }
    });
  })
}
