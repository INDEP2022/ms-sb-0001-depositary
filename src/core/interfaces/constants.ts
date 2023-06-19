export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
export enum Comparison {
  EQUAL = 'EQUAL',
  LESS_THAN = 'LESS_THAN',
  MORE_THAN = 'MORE_THAN',
  NOT = 'NOT',
  LIKE = 'LIKE',
  IS_NOT = 'IS_NOT',
}
export enum ConnectionNames {
  DB_SASIARAF = 'DB_SASIARAF',
  PRCSIARAF = 'PRCSIARAF',
  DB_SIARAF = 'DB_SIARAF',
  MSSQL_DB_SASIARAF = 'DB_SASIARAF',
  MSSQL_PRCSIARAF = 'PRCSIARAF',
  MSSQL_DB_SIARAF = 'DB_SIARAF',
}
export enum ConnectionEngines {
  MSSQL = 'MSSQL',
  POSTGRES = 'POSTGRES',
}
//queues para rabbitMQ
export enum RabbitMQ {
  //cada queue por microservicio de
  CIERRES_QUEUE = 'bitacora',
}
//Metodos o eventos a escuchar de RabbitMQ
export enum CierresMSG {
  BITACORA_SAVE = 'BITACORA_SAVE',
}
export enum TransaccionesMSG {
  BITACORA_TRANSACCIONES_SAVE = 'BITACORA_TRANSACCIONES_SAVE',
}
//enum de roles
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
