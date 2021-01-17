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
  serial_number  varchar(255) NOT NULL,
  resgistcode varchar(255) NOT NULL, 
  PRIMARY KEY (serial_number)

);

CREATE TABLE History (
  id_history int(10) NOT NULL AUTO_INCREMENT, 
  serial_number  varchar(255) NOT NULL, 
  timest  varchar(255), 
  temp       varchar(255), 
  hum_air    varchar(255), 
  hum_earth  varchar(255), 
  luminosity varchar(255),  
  states     varchar(255), 
  PRIMARY KEY (id_history),
  FOREIGN KEY (serial_number) REFERENCES Device(serial_number)
);

CREATE TABLE rel_user_device (
  id_rel_user_device int(10) NOT NULL AUTO_INCREMENT, 
  id_user            int(10) NOT NULL, 
  serial_number      varchar(255) NOT NULL, 
  designacao         varchar(255), 
  PRIMARY KEY (id_rel_user_device),
  FOREIGN KEY (id_user) REFERENCES User(id_user),
  FOREIGN KEY (serial_number) REFERENCES Device(serial_number)
);

CREATE TABLE Perfil(
  id_perfil     int(10) NOT NULL AUTO_INCREMENT, 
  designacao    varchar(255), 
  temp_min      varchar(255), 
  temp_max      varchar(255), 
  hum_air_min   varchar(255), 
  hum_air_max   varchar(255), 
  hum_earth_min varchar(255), 
  hum_earth_max varchar(255), 
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
create procedure insert_device(srl varchar(255),rg varchar(255))
begin
	insert into Device(serial_number,resgistcode)
		values(srl,rg);
end//
delimiter ;

delimiter //
create procedure insert_profile(in desi varchar(255), temin varchar(255), temax varchar(255), ham varchar(255), hama varchar(255), hem varchar(255), hema varchar(255))
begin
	insert into Perfil(designacao,temp_min,temp_max,hum_air_min,hum_air_max,hum_earth_min,hum_earth_max)
		values(desi,temin,temax,ham,hama,hem,hema);
end//
delimiter ;

delimiter //
create procedure insert_history(in iddev varchar(255), tim varchar(255), temper varchar(255), huma varchar(255), hume varchar(255), lumi varchar(255), ste varchar(255))
begin
	insert into History(serial_number,timest,temp,hum_air,hum_earth,luminosity,states)
		values(iddev,tim,temper,huma,hume,lumi,ste);
end//
delimiter ;

delimiter //
create procedure insert_reldevice(in idus int(10), iddev varchar(255), desi varchar(255))
begin
	insert into rel_user_device(id_user,serial_number,designacao)
		values(idus,iddev,desi);
end//
delimiter ;

ALTER TABLE User AUTO_INCREMENT=0;
ALTER TABLE Device AUTO_INCREMENT=0;
ALTER TABLE History AUTO_INCREMENT=0;
ALTER TABLE rel_user_device AUTO_INCREMENT=0;
ALTER TABLE Perfil AUTO_INCREMENT=0;