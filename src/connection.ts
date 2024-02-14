import mysql, { Connection, MysqlError } from 'mysql';

const params = {
  host: 'localhost',
  port: 3307,
  database: 'organization',
  user: 'root',
  password: 'P3l3Cr1s71'
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
