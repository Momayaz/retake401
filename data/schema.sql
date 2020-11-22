DROP TABLE IF EXISTS story;

 CREATE TABLE story(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(225),
    patronus VARCHAR(223),
    alive VARCHAR(223),
    image VARCHAR(225)
);