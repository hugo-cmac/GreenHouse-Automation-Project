drop database if exists GHD_DB;
create database GHD_DB;
USE GHD_DB;


CREATE TABLE User(
  id_user  int(30) NOT NULL AUTO_INCREMENT, 
  username varchar(30) NOT NULL,
  mail     varchar(100) NOT NULL, 
  pass     varchar(255) NOT NULL, 
  PRIMARY KEY (id_user)
);

CREATE TABLE Device(
  id_device  int(10) NOT NULL AUTO_INCREMENT, 
  serial_number  varchar(255) NOT NULL, 
  PRIMARY KEY (id_device)

);

CREATE TABLE History (
  id_history int(10) NOT NULL AUTO_INCREMENT, 
  id_device  int(10) NOT NULL, 
  timestamp  int(10), 
  temp       int(10), 
  hum_air    int(10), 
  hum_earth  int(10), 
  luminosity int(10), 
  pump       int(10), 
  motor      int(10), 
  PRIMARY KEY (id_history),
  FOREIGN KEY (id_device) REFERENCES Device(id_device)
);

CREATE TABLE rel_user_device (
  id_rel_user_device int(10) NOT NULL AUTO_INCREMENT, 
  id_user            int(10) NOT NULL, 
  id_device          int(10) NOT NULL, 
  designacao         varchar(255), 
  PRIMARY KEY (id_rel_user_device),
  FOREIGN KEY (id_user) REFERENCES User(id_user),
  FOREIGN KEY (id_device) REFERENCES Device(id_device)
);

CREATE TABLE Perfil(
  id_perfil     int(10) NOT NULL AUTO_INCREMENT, 
  designacao    varchar(255), 
  temp_min      int(10), 
  temp_max      int(10), 
  hum_air_min   int(10), 
  hum_air_max   int(10), 
  hum_earth_min int(10), 
  hum_earth_max int(10), 
  PRIMARY KEY (id_perfil)
);

delimiter //
create procedure insert_user(in u varchar(30), ma varchar(255),	passw varchar(255))
begin
	insert into User(username, mail, pass)
		values(u,ma,passw);
end//
delimiter ;

delimiter //
create procedure insert_device(srl int(10))
begin
	insert into Device(serial_number)
		values(srl);
end//
delimiter ;

delimiter //
create procedure insert_profile(in desi varchar(255), temin int(10), temax int(10), ham int(10), hama int(10), hem int(10), hema int(10))
begin
	insert into Perfil(designacao,temp_min,temp_max,hum_air_min,hum_air_max,hum_earth_min,hum_earth_max)
		values(desi,temin,temax,ham,hama,hem,hema);
end//
delimiter ;

delimiter //
create procedure insert_history(in iddev int(10), tim varchar(255), temper int(10), hume int(10), lumi int(10), pum int(10), mto int(10))
begin
	insert into History(id_device,timestamp,temp, hum_air,hum_earth,luminosity,pump,motor)
		values(iddev,tim,temper,hume,lumi,pum,mto);
end//
delimiter ;

delimiter //
create procedure insert_reldevice(in idus int(10), iddev int(10), desi varchar(255))
begin
	insert into rel_user_device(id_user,id_device,designacao)
		values(idus,iddev,desi);
end//
delimiter ;

ALTER TABLE User AUTO_INCREMENT=0;
ALTER TABLE Device AUTO_INCREMENT=0;
ALTER TABLE History AUTO_INCREMENT=0;
ALTER TABLE rel_user_device AUTO_INCREMENT=0;
ALTER TABLE Perfil AUTO_INCREMENT=0;