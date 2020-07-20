
CREATE TABLE categoriaProducto (
                pkIdCategoriaProducto BIGINT AUTO_INCREMENT NOT NULL,
                descripcionCategoriaProducto VARCHAR(30) NOT NULL,
                PRIMARY KEY (pkIdCategoriaProducto)
);


CREATE TABLE tipoDocumento (
                pkIdTipoDocumento BIGINT AUTO_INCREMENT NOT NULL,
                descripcionTipoDocumento VARCHAR(30) NOT NULL,
                PRIMARY KEY (pkIdTipoDocumento)
);

ALTER TABLE tipoDocumento MODIFY COLUMN descripcionTipoDocumento VARCHAR(30) COMMENT 'Ejemplos: Cedula Ciudadania, Pasaporte.';


CREATE TABLE imagen (
                pkIdImagen BIGINT AUTO_INCREMENT NOT NULL,
                rutaImagen VARCHAR(255) NOT NULL,
                PRIMARY KEY (pkIdImagen)
);

ALTER TABLE imagen MODIFY COLUMN rutaImagen VARCHAR(255) COMMENT 'rvidor(public)';


CREATE TABLE producto (
                pkIdProducto BIGINT AUTO_INCREMENT NOT NULL,
                nombreProducto VARCHAR(30) NOT NULL,
                fkIdImagen BIGINT NOT NULL,
                fkIdCategoriaProducto BIGINT NOT NULL,
                PRIMARY KEY (pkIdProducto)
);


CREATE TABLE personaJuridica (
                pkIdPersonaJuridica BIGINT AUTO_INCREMENT NOT NULL,
                telefonoPersonaJuridica VARCHAR(30) NOT NULL,
                PRIMARY KEY (pkIdPersonaJuridica)
);


CREATE TABLE usuario (
                pkIdUsuario BIGINT AUTO_INCREMENT NOT NULL,
                correoUsuario VARCHAR(30) NOT NULL,
                claveUsuario LONGBLOB NOT NULL,
                PRIMARY KEY (pkIdUsuario)
);


CREATE TABLE personaNatural (
                pkIdPersonaNatural BIGINT AUTO_INCREMENT NOT NULL,
                nombresPersonaNatural VARCHAR(30) NOT NULL,
                apellidosPersonaNatural VARCHAR(30) NOT NULL,
                fkIdTipoDocumento BIGINT NOT NULL,
                numeroDocumento INT NOT NULL,
                telefonoPersonaNatural VARCHAR(30) NOT NULL,
                fkIdUsuario BIGINT NOT NULL,
                PRIMARY KEY (pkIdPersonaNatural)
);


CREATE TABLE cliente (
                pkIdCliente BIGINT AUTO_INCREMENT NOT NULL,
                direccionCliente VARCHAR(255) NOT NULL,
                fkIdPersonaNatural BIGINT NOT NULL,
                PRIMARY KEY (pkIdCliente)
);


CREATE TABLE comerciante (
                pkIdComerciante BIGINT AUTO_INCREMENT NOT NULL,
                fkIdPersonaNatural BIGINT NOT NULL,
                PRIMARY KEY (pkIdComerciante)
);


CREATE TABLE localComercial (
                pkIdLocalComercial BIGINT AUTO_INCREMENT NOT NULL,
                precioDomicilio DOUBLE,
                descripcionLocal VARCHAR(1024) NOT NULL,
                fkIdComerciantePropietario BIGINT NOT NULL,
                fkIdPersonaJuridica BIGINT NOT NULL,
                calificacionPromedio DOUBLE NOT NULL,
                calificacionContadorCliente INT NOT NULL,
                esMayorista BOOLEAN NOT NULL,
                PRIMARY KEY (pkIdLocalComercial)
);

ALTER TABLE localComercial MODIFY COLUMN descripcionLocal VARCHAR(1024) COMMENT 'los compradores puedan visualizarlo';


CREATE TABLE calificacionClienteLocal (
                pkIdCalificacionClienteLocal BIGINT AUTO_INCREMENT NOT NULL,
                fkIdCliente BIGINT NOT NULL,
                fkIdLocalComercial BIGINT NOT NULL,
                calificacion DOUBLE NOT NULL,
                PRIMARY KEY (pkIdCalificacionClienteLocal)
);


CREATE TABLE venta (
                pkIdVenta BIGINT AUTO_INCREMENT NOT NULL,
                fechaHoraVenta VARCHAR(30) NOT NULL,
                fechaHoraEnvio VARCHAR(30) NOT NULL,
                fechaHoraEntrega VARCHAR(30) NOT NULL,
                fueEnviado BOOLEAN NOT NULL,
                fueEntregado BOOLEAN NOT NULL,
                precioDomicilioVenta DOUBLE NOT NULL,
                direccionCliente VARCHAR(255) NOT NULL,
                telefonoCliente VARCHAR(30) NOT NULL,
                montoTotal DOUBLE NOT NULL,
                fkIdLocalComercial BIGINT NOT NULL,
                fkIdCliente BIGINT NOT NULL,
                PRIMARY KEY (pkIdVenta)
);


CREATE TABLE reclamo (
                pkIdReclamo BIGINT AUTO_INCREMENT NOT NULL,
                reclamoResuelto BOOLEAN NOT NULL,
                fkIdVenta BIGINT NOT NULL,
                PRIMARY KEY (pkIdReclamo)
);


CREATE TABLE mensajeReclamo (
                pkIdMensajeReclamo BIGINT AUTO_INCREMENT NOT NULL,
                mensajeReclamo VARCHAR(1024),
                esCliente BOOLEAN NOT NULL,
                fkIdReclamo BIGINT NOT NULL,
                PRIMARY KEY (pkIdMensajeReclamo)
);


CREATE TABLE productoLocal (
                pkIdProductoLocal BIGINT AUTO_INCREMENT NOT NULL,
                fkIdLocalComercial BIGINT NOT NULL,
                fkIdProducto BIGINT NOT NULL,
                PRIMARY KEY (pkIdProductoLocal)
);


CREATE TABLE presentacionProducto (
                pkIdPresentacionProducto BIGINT AUTO_INCREMENT NOT NULL,
                nombrePresentacion VARCHAR(30) NOT NULL,
                precioUnitarioPresentacion DOUBLE NOT NULL,
                fkIdProductoLocal BIGINT NOT NULL,
                PRIMARY KEY (pkIdPresentacionProducto)
);

ALTER TABLE presentacionProducto MODIFY COLUMN nombrePresentacion VARCHAR(30) COMMENT 'Ejemplos: Kilogramo, Gramo, Libra, Canasta, Bulto.';


CREATE TABLE itemVenta (
                pkIdItemVenta BIGINT AUTO_INCREMENT NOT NULL,
                cantidadItem INT NOT NULL,
                precioUnitarioItem DOUBLE NOT NULL,
                detallesCliente VARCHAR(255),
                fkIdPresentacionProducto BIGINT NOT NULL,
                PRIMARY KEY (pkIdItemVenta)
);

ALTER TABLE itemVenta MODIFY COLUMN detallesCliente VARCHAR(255) COMMENT 'oy';


ALTER TABLE producto ADD CONSTRAINT categoriaproducto_producto_fk
FOREIGN KEY (fkIdCategoriaProducto)
REFERENCES categoriaProducto (pkIdCategoriaProducto)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE personaNatural ADD CONSTRAINT tipodocumento_personanatural_fk
FOREIGN KEY (fkIdTipoDocumento)
REFERENCES tipoDocumento (pkIdTipoDocumento)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE producto ADD CONSTRAINT imagen_producto_fk
FOREIGN KEY (fkIdImagen)
REFERENCES imagen (pkIdImagen)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE productoLocal ADD CONSTRAINT producto_productolocal_fk
FOREIGN KEY (fkIdProducto)
REFERENCES producto (pkIdProducto)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE localComercial ADD CONSTRAINT personajuridica_localcomercial_fk
FOREIGN KEY (fkIdPersonaJuridica)
REFERENCES personaJuridica (pkIdPersonaJuridica)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE personaNatural ADD CONSTRAINT usuario_personanatural_fk
FOREIGN KEY (fkIdUsuario)
REFERENCES usuario (pkIdUsuario)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE comerciante ADD CONSTRAINT personanatural_comerciante_fk
FOREIGN KEY (fkIdPersonaNatural)
REFERENCES personaNatural (pkIdPersonaNatural)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE cliente ADD CONSTRAINT personanatural_cliente_fk
FOREIGN KEY (fkIdPersonaNatural)
REFERENCES personaNatural (pkIdPersonaNatural)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE venta ADD CONSTRAINT cliente_venta_fk
FOREIGN KEY (fkIdCliente)
REFERENCES cliente (pkIdCliente)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE calificacionClienteLocal ADD CONSTRAINT cliente_calificacionclientelocal_fk
FOREIGN KEY (fkIdCliente)
REFERENCES cliente (pkIdCliente)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE localComercial ADD CONSTRAINT comerciante_localcomercial_fk
FOREIGN KEY (fkIdComerciantePropietario)
REFERENCES comerciante (pkIdComerciante)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE productoLocal ADD CONSTRAINT localcomercial_productolocal_fk
FOREIGN KEY (fkIdLocalComercial)
REFERENCES localComercial (pkIdLocalComercial)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE venta ADD CONSTRAINT localcomercial_venta_fk
FOREIGN KEY (fkIdLocalComercial)
REFERENCES localComercial (pkIdLocalComercial)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE calificacionClienteLocal ADD CONSTRAINT localcomercial_calificacionclientelocal_fk
FOREIGN KEY (fkIdLocalComercial)
REFERENCES localComercial (pkIdLocalComercial)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE reclamo ADD CONSTRAINT venta_reclamo_fk
FOREIGN KEY (fkIdVenta)
REFERENCES venta (pkIdVenta)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE mensajeReclamo ADD CONSTRAINT reclamo_mensajereclamo_fk
FOREIGN KEY (fkIdReclamo)
REFERENCES reclamo (pkIdReclamo)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE presentacionProducto ADD CONSTRAINT productolocal_presentacionproducto_fk
FOREIGN KEY (fkIdProductoLocal)
REFERENCES productoLocal (pkIdProductoLocal)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

ALTER TABLE itemVenta ADD CONSTRAINT presentacionproducto_itemventa_fk
FOREIGN KEY (fkIdPresentacionProducto)
REFERENCES presentacionProducto (pkIdPresentacionProducto)
ON DELETE RESTRICT
ON UPDATE CASCADE;
