# People-into-Groups
The scope of the project is to facilitate the organization of People into Groups.

## Running the app

In the project directory, run:

### `npm install`
### `npm run start`

The app will run under http://localhost:8080. If you need to change this go to src/app.ts and change HOST and PORT variables.

## MySQL configuration
host: 'localhost';
port: 3307;
database: 'organization';

To run local go to src/connection.ts and add user and password in params object. You can change also host, port or database.

## MySQL initialization
For starting the tests you need to create a schema named organization and 2 tables:

### groups table
CREATE TABLE `organization`.`groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_group_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `groups_ibfk_1` (`parent_group_id`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`parent_group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

### people table
CREATE TABLE `organization`.`people` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `job` varchar(45) NOT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `people_ibfk_1` (`parent_group_id`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`parent_group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

Also you need to create the first group (the head of the hierarchy) for using the api

### add head group
INSERT INTO `organization`.`groups`
(`id`,
`name`,
`date_created`,
`date_updated`,
`parent_group_id`)
VALUES
(1,
'Head Group',
NOW(),
NOW(),
null);
