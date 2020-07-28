-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-07-2020 a las 03:26:31
-- Versión del servidor: 10.4.11-MariaDB
-- Versión de PHP: 7.4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cenabastosonline`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificacionclientelocal`
--

CREATE TABLE `calificacionclientelocal` (
  `pkIdCalificacionClienteLocal` bigint(20) NOT NULL,
  `fkIdCliente` bigint(20) NOT NULL,
  `fkIdLocalComercial` bigint(20) NOT NULL,
  `calificacion` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoriaproducto`
--

CREATE TABLE `categoriaproducto` (
  `pkIdCategoriaProducto` bigint(20) NOT NULL,
  `descripcionCategoriaProducto` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categoriaproducto`
--

INSERT INTO `categoriaproducto` (`pkIdCategoriaProducto`, `descripcionCategoriaProducto`) VALUES
(1, 'Verduras y Hortalizas'),
(2, 'Frutas'),
(3, 'Tubérculos, Raíces y Plátanos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierredecaja`
--

CREATE TABLE `cierredecaja` (
  `pkIdCierreDeCaja_` bigint(20) NOT NULL,
  `fkIdLocalComercial` bigint(20) NOT NULL,
  `fechaInicioPeriodo_` varchar(19) NOT NULL,
  `fechaFinPeriodo_` varchar(19) NOT NULL,
  `fechaInicioPeriodoInt` int(11) NOT NULL,
  `fechaFinPeriodoInt` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierredecajaadmin`
--

CREATE TABLE `cierredecajaadmin` (
  `pkIdCierreDeCajaAdmin` bigint(20) NOT NULL,
  `fkIdLocalComercial` bigint(20) NOT NULL,
  `fechaInicioPeriodo_` varchar(19) NOT NULL,
  `fechaFinPeriodo_` varchar(19) NOT NULL,
  `fechaInicioPeriodoInt_` int(11) NOT NULL,
  `fechaFinPeriodoInt_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `pkIdCliente` bigint(20) NOT NULL,
  `direccionCliente` varchar(255) NOT NULL,
  `fkIdPersonaNatural` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`pkIdCliente`, `direccionCliente`, `fkIdPersonaNatural`) VALUES
(1, 'Avenida siempre viva', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comerciante`
--

CREATE TABLE `comerciante` (
  `pkIdComerciante` bigint(20) NOT NULL,
  `fkIdPersonaNatural` bigint(20) NOT NULL,
  `estaAprobado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `comerciante`
--

INSERT INTO `comerciante` (`pkIdComerciante`, `fkIdPersonaNatural`, `estaAprobado`) VALUES
(1, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen`
--

CREATE TABLE `imagen` (
  `pkIdImagen` bigint(20) NOT NULL,
  `publicId` varchar(255) NOT NULL,
  `rutaImagen` varchar(255) DEFAULT NULL COMMENT 'servidor(public)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `imagen`
--

INSERT INTO `imagen` (`pkIdImagen`, `publicId`, `rutaImagen`) VALUES
(1, 'mora', '/img/mora.png'),
(2, 'zanahoria_y3xnf5', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806202/zanahoria_y3xnf5.png'),
(3, 'uva_zol9mo', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806201/uva_zol9mo.png'),
(4, 'tomate2_ri7ctq', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806200/tomate2_ri7ctq.png'),
(5, 'tomate_xi6jyn', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806197/tomate_xi6jyn.png'),
(6, 'sandia_ajk4zg', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806196/sandia_ajk4zg.png'),
(7, 'papa_jzlwzm', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806194/papa_jzlwzm.png'),
(8, 'cebolla_z9949y', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806191/cebolla_z9949y.png'),
(9, 'banano_wfutos', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806188/banano_wfutos.png'),
(10, 'aguacate_ezz3ad', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806180/aguacate_ezz3ad.png'),
(11, 'mandarina_le51uv', 'https://res.cloudinary.com/megaplaza/image/upload/v1595806162/mandarina_le51uv.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `itemventa`
--

CREATE TABLE `itemventa` (
  `pkIdItemVenta` bigint(20) NOT NULL,
  `nombrePresentacionItemVenta` varchar(30) NOT NULL,
  `cantidadItem` int(11) NOT NULL,
  `precioUnitarioItem` double NOT NULL,
  `detallesCliente` varchar(255) DEFAULT NULL COMMENT 'Cada item de la factura',
  `detallesComerciante` varchar(255) DEFAULT NULL,
  `fkIdProducto` bigint(20) NOT NULL,
  `fkIdVenta` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `itemventa`
--

INSERT INTO `itemventa` (`pkIdItemVenta`, `nombrePresentacionItemVenta`, `cantidadItem`, `precioUnitarioItem`, `detallesCliente`, `detallesComerciante`, `fkIdProducto`, `fkIdVenta`) VALUES
(1, 'Canasta', 2, 2000, NULL, NULL, 13, 1),
(2, 'Bulto', 5, 3000, NULL, NULL, 10, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `localcomercial`
--

CREATE TABLE `localcomercial` (
  `pkIdLocalComercial` bigint(20) NOT NULL,
  `nombreLocal` varchar(30) NOT NULL,
  `precioDomicilio` double DEFAULT NULL,
  `descripcionLocal` varchar(1024) DEFAULT NULL COMMENT 'los compradores puedan visualizarlo',
  `fkIdComerciantePropietario` bigint(20) NOT NULL,
  `fkIdPersonaJuridica` bigint(20) NOT NULL,
  `calificacionPromedio` double NOT NULL,
  `calificacionContadorCliente` int(11) NOT NULL,
  `esMayorista` tinyint(1) NOT NULL,
  `idLocalEnCenabastos` varchar(10) NOT NULL,
  `totalVendido` double NOT NULL,
  `parcialVendido` double DEFAULT NULL COMMENT ' la tabla cierreDeCaja',
  `parcialVendidoAdmin` double DEFAULT NULL COMMENT 'administraci�n, funciona con la tabla cierreDeCajaAdmin',
  `estaAbierto` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `localcomercial`
--

INSERT INTO `localcomercial` (`pkIdLocalComercial`, `nombreLocal`, `precioDomicilio`, `descripcionLocal`, `fkIdComerciantePropietario`, `fkIdPersonaJuridica`, `calificacionPromedio`, `calificacionContadorCliente`, `esMayorista`, `idLocalEnCenabastos`, `totalVendido`, `parcialVendido`, `parcialVendidoAdmin`, `estaAbierto`) VALUES
(3, 'Verduritas Doña Ana', 3000, 'Besto descripción del mundo', 1, 4, 0, 0, 0, 'f-404', 0, 0, 0, 0),
(6, 'Aguacates al mayor', 1000, '', 1, 7, 0, 0, 0, 'gg-200', 0, 0, 0, 0),
(7, 'Fruver El Mejor', 2300, ' ', 1, 8, 0, 0, 0, 'fu-465', 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajereclamo`
--

CREATE TABLE `mensajereclamo` (
  `pkIdMensajeReclamo` bigint(20) NOT NULL,
  `mensajeReclamo` varchar(1024) DEFAULT NULL,
  `esCliente` tinyint(1) NOT NULL,
  `fkIdReclamo` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personajuridica`
--

CREATE TABLE `personajuridica` (
  `pkIdPersonaJuridica` bigint(20) NOT NULL,
  `telefonoPersonaJuridica` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `personajuridica`
--

INSERT INTO `personajuridica` (`pkIdPersonaJuridica`, `telefonoPersonaJuridica`) VALUES
(2, NULL),
(3, NULL),
(4, NULL),
(5, NULL),
(6, NULL),
(7, NULL),
(8, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personanatural`
--

CREATE TABLE `personanatural` (
  `pkIdPersonaNatural` bigint(20) NOT NULL,
  `nombresPersonaNatural` varchar(30) NOT NULL,
  `apellidosPersonaNatural` varchar(30) NOT NULL,
  `fkIdTipoDocumento` bigint(20) NOT NULL,
  `numeroDocumento` int(11) NOT NULL,
  `telefonoPersonaNatural` varchar(30) NOT NULL,
  `fkIdUsuario` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `personanatural`
--

INSERT INTO `personanatural` (`pkIdPersonaNatural`, `nombresPersonaNatural`, `apellidosPersonaNatural`, `fkIdTipoDocumento`, `numeroDocumento`, `telefonoPersonaNatural`, `fkIdUsuario`) VALUES
(2, 'Enmanuel', 'Martínez', 1, 1090519133, '3114589189', 2),
(3, 'Sebastian', 'Jauregui', 1, 1090526623, '5835104', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presentacionproducto`
--

CREATE TABLE `presentacionproducto` (
  `pkIdPresentacionProducto` bigint(20) NOT NULL,
  `nombrePresentacion` varchar(30) DEFAULT NULL COMMENT 'Ejemplos: Kilogramo, Gramo, Libra, Canasta, Bulto.',
  `precioUnitarioPresentacion` double NOT NULL,
  `fkIdProductoLocal` bigint(20) NOT NULL,
  `detallesPresentacionProducto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `pkIdProducto` bigint(20) NOT NULL,
  `nombreProducto` varchar(30) NOT NULL,
  `fkIdImagen` bigint(20) DEFAULT NULL,
  `fkIdCategoriaProducto` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`pkIdProducto`, `nombreProducto`, `fkIdImagen`, `fkIdCategoriaProducto`) VALUES
(10, 'Zanahoria', 2, 1),
(11, 'Uva importada', 3, 2),
(12, 'Tomate chonto', 5, 1),
(13, 'Patilla', 6, 2),
(14, 'Papa superior', 7, 3),
(15, 'Cebolla cabezona blanca', 8, 1),
(16, 'Banano criollo', 9, 2),
(17, 'Aguacate común', 10, 2),
(18, 'Mandarina común', 11, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productolocal`
--

CREATE TABLE `productolocal` (
  `pkIdProductoLocal` bigint(20) NOT NULL,
  `fkIdLocalComercial` bigint(20) NOT NULL,
  `fkIdProducto` bigint(20) NOT NULL,
  `detallesProductoLocal` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `productolocal`
--

INSERT INTO `productolocal` (`pkIdProductoLocal`, `fkIdLocalComercial`, `fkIdProducto`, `detallesProductoLocal`) VALUES
(28, 6, 17, NULL),
(39, 3, 13, NULL),
(40, 3, 12, NULL),
(41, 3, 14, NULL),
(42, 3, 18, NULL),
(43, 7, 17, NULL),
(44, 7, 14, NULL),
(45, 7, 13, NULL),
(46, 7, 12, NULL),
(48, 3, 10, NULL),
(49, 3, 15, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reclamo`
--

CREATE TABLE `reclamo` (
  `pkIdReclamo` bigint(20) NOT NULL,
  `reclamoResuelto` tinyint(1) NOT NULL,
  `fkIdVenta` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('1pFYUewmdVoGfFKjQrnAZvUdduKbKday', 1595970930, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),
('6ieWvV5TuEdL34qtSjp9F5WEL7DzEIf-', 1595985885, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),
('IWCnHZooYrYilUm2xQdPXLSTmRH_eW-I', 1595973059, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),
('fspIfIA9DNSQ-b46psw8gSEV18Nsni0E', 1595967255, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),
('nqQhdKY10GB_FV4J9NEGeQgtucMe-FEU', 1595970721, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}'),
('objLZte4eZ_AGSpuOQ0nMcFcb52g1DuW', 1595985815, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"flash\":{},\"idUser\":2,\"idPersonaNatural\":2,\"idComerciante\":1,\"estaAprobado\":1,\"tipoUsuario\":2,\"passport\":{\"user\":2},\"idLocalActual\":3,\"nombreLocalActual\":\"Verduritas Doña Ana\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipodocumento`
--

CREATE TABLE `tipodocumento` (
  `pkIdTipoDocumento` bigint(20) NOT NULL,
  `descripcionTipoDocumento` varchar(30) DEFAULT NULL COMMENT 'Ejemplos: Cedula Ciudadania, Pasaporte.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tipodocumento`
--

INSERT INTO `tipodocumento` (`pkIdTipoDocumento`, `descripcionTipoDocumento`) VALUES
(1, 'Cedula Ciudadania'),
(2, 'Pasaporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `pkIdUsuario` bigint(20) NOT NULL,
  `correoUsuario` varchar(30) NOT NULL,
  `claveUsuario` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`pkIdUsuario`, `correoUsuario`, `claveUsuario`) VALUES
(2, 'enmanuelcamilo9999@gmail.com', 0x81f44672f7707f551ea23c36b66f7afe),
(3, 'mowsbbs10@gmail.com', 0x81f44672f7707f551ea23c36b66f7afe);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `pkIdVenta` bigint(20) NOT NULL,
  `fechaHoraVenta` varchar(19) NOT NULL,
  `fechaHoraEmpacado` varchar(19) NOT NULL,
  `fechaHoraEnvio` varchar(19) NOT NULL,
  `fechaHoraEntrega` varchar(19) NOT NULL,
  `fueEmpacado` tinyint(1) NOT NULL,
  `fueEnviado` tinyint(1) NOT NULL,
  `fueEntregado` tinyint(1) NOT NULL,
  `precioDomicilioVenta` double NOT NULL,
  `direccionCliente` varchar(255) NOT NULL,
  `telefonoCliente` varchar(30) NOT NULL,
  `montoTotal` double NOT NULL,
  `fkIdLocalComercial` bigint(20) NOT NULL,
  `fkIdCliente` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`pkIdVenta`, `fechaHoraVenta`, `fechaHoraEmpacado`, `fechaHoraEnvio`, `fechaHoraEntrega`, `fueEmpacado`, `fueEnviado`, `fueEntregado`, `precioDomicilioVenta`, `direccionCliente`, `telefonoCliente`, `montoTotal`, `fkIdLocalComercial`, `fkIdCliente`) VALUES
(1, 'hoy', '', 'hoy', 'hoy', 0, 0, 0, 5000, 'Avnida shida', '311', 24000, 3, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calificacionclientelocal`
--
ALTER TABLE `calificacionclientelocal`
  ADD PRIMARY KEY (`pkIdCalificacionClienteLocal`),
  ADD KEY `cliente_calificacionclientelocal_fk` (`fkIdCliente`),
  ADD KEY `localcomercial_calificacionclientelocal_fk` (`fkIdLocalComercial`);

--
-- Indices de la tabla `categoriaproducto`
--
ALTER TABLE `categoriaproducto`
  ADD PRIMARY KEY (`pkIdCategoriaProducto`);

--
-- Indices de la tabla `cierredecaja`
--
ALTER TABLE `cierredecaja`
  ADD PRIMARY KEY (`pkIdCierreDeCaja_`),
  ADD KEY `localcomercial_cierredecaja_fk` (`fkIdLocalComercial`);

--
-- Indices de la tabla `cierredecajaadmin`
--
ALTER TABLE `cierredecajaadmin`
  ADD PRIMARY KEY (`pkIdCierreDeCajaAdmin`),
  ADD KEY `localcomercial_cierredecajaadmin_fk` (`fkIdLocalComercial`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`pkIdCliente`),
  ADD KEY `personanatural_cliente_fk` (`fkIdPersonaNatural`);

--
-- Indices de la tabla `comerciante`
--
ALTER TABLE `comerciante`
  ADD PRIMARY KEY (`pkIdComerciante`),
  ADD KEY `personanatural_comerciante_fk` (`fkIdPersonaNatural`);

--
-- Indices de la tabla `imagen`
--
ALTER TABLE `imagen`
  ADD PRIMARY KEY (`pkIdImagen`);

--
-- Indices de la tabla `itemventa`
--
ALTER TABLE `itemventa`
  ADD PRIMARY KEY (`pkIdItemVenta`),
  ADD KEY `producto_itemventa_fk` (`fkIdProducto`),
  ADD KEY `venta_itemventa_fk` (`fkIdVenta`);

--
-- Indices de la tabla `localcomercial`
--
ALTER TABLE `localcomercial`
  ADD PRIMARY KEY (`pkIdLocalComercial`),
  ADD KEY `personajuridica_localcomercial_fk` (`fkIdPersonaJuridica`),
  ADD KEY `comerciante_localcomercial_fk` (`fkIdComerciantePropietario`);

--
-- Indices de la tabla `mensajereclamo`
--
ALTER TABLE `mensajereclamo`
  ADD PRIMARY KEY (`pkIdMensajeReclamo`),
  ADD KEY `reclamo_mensajereclamo_fk` (`fkIdReclamo`);

--
-- Indices de la tabla `personajuridica`
--
ALTER TABLE `personajuridica`
  ADD PRIMARY KEY (`pkIdPersonaJuridica`);

--
-- Indices de la tabla `personanatural`
--
ALTER TABLE `personanatural`
  ADD PRIMARY KEY (`pkIdPersonaNatural`),
  ADD KEY `tipodocumento_personanatural_fk` (`fkIdTipoDocumento`),
  ADD KEY `usuario_personanatural_fk` (`fkIdUsuario`);

--
-- Indices de la tabla `presentacionproducto`
--
ALTER TABLE `presentacionproducto`
  ADD PRIMARY KEY (`pkIdPresentacionProducto`),
  ADD KEY `productolocal_presentacionproducto_fk` (`fkIdProductoLocal`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`pkIdProducto`),
  ADD KEY `categoriaproducto_producto_fk` (`fkIdCategoriaProducto`),
  ADD KEY `imagen_producto_fk` (`fkIdImagen`);

--
-- Indices de la tabla `productolocal`
--
ALTER TABLE `productolocal`
  ADD PRIMARY KEY (`pkIdProductoLocal`),
  ADD KEY `producto_productolocal_fk` (`fkIdProducto`),
  ADD KEY `localcomercial_productolocal_fk` (`fkIdLocalComercial`);

--
-- Indices de la tabla `reclamo`
--
ALTER TABLE `reclamo`
  ADD PRIMARY KEY (`pkIdReclamo`),
  ADD KEY `venta_reclamo_fk` (`fkIdVenta`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  ADD PRIMARY KEY (`pkIdTipoDocumento`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`pkIdUsuario`),
  ADD UNIQUE KEY `correoUsuario` (`correoUsuario`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`pkIdVenta`),
  ADD KEY `cliente_venta_fk` (`fkIdCliente`),
  ADD KEY `localcomercial_venta_fk` (`fkIdLocalComercial`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `calificacionclientelocal`
--
ALTER TABLE `calificacionclientelocal`
  MODIFY `pkIdCalificacionClienteLocal` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoriaproducto`
--
ALTER TABLE `categoriaproducto`
  MODIFY `pkIdCategoriaProducto` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cierredecaja`
--
ALTER TABLE `cierredecaja`
  MODIFY `pkIdCierreDeCaja_` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cierredecajaadmin`
--
ALTER TABLE `cierredecajaadmin`
  MODIFY `pkIdCierreDeCajaAdmin` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `pkIdCliente` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `comerciante`
--
ALTER TABLE `comerciante`
  MODIFY `pkIdComerciante` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `imagen`
--
ALTER TABLE `imagen`
  MODIFY `pkIdImagen` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `itemventa`
--
ALTER TABLE `itemventa`
  MODIFY `pkIdItemVenta` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `localcomercial`
--
ALTER TABLE `localcomercial`
  MODIFY `pkIdLocalComercial` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `mensajereclamo`
--
ALTER TABLE `mensajereclamo`
  MODIFY `pkIdMensajeReclamo` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personajuridica`
--
ALTER TABLE `personajuridica`
  MODIFY `pkIdPersonaJuridica` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `personanatural`
--
ALTER TABLE `personanatural`
  MODIFY `pkIdPersonaNatural` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `presentacionproducto`
--
ALTER TABLE `presentacionproducto`
  MODIFY `pkIdPresentacionProducto` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `pkIdProducto` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `productolocal`
--
ALTER TABLE `productolocal`
  MODIFY `pkIdProductoLocal` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `reclamo`
--
ALTER TABLE `reclamo`
  MODIFY `pkIdReclamo` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  MODIFY `pkIdTipoDocumento` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `pkIdUsuario` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `pkIdVenta` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificacionclientelocal`
--
ALTER TABLE `calificacionclientelocal`
  ADD CONSTRAINT `cliente_calificacionclientelocal_fk` FOREIGN KEY (`fkIdCliente`) REFERENCES `cliente` (`pkIdCliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `localcomercial_calificacionclientelocal_fk` FOREIGN KEY (`fkIdLocalComercial`) REFERENCES `localcomercial` (`pkIdLocalComercial`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cierredecaja`
--
ALTER TABLE `cierredecaja`
  ADD CONSTRAINT `localcomercial_cierredecaja_fk` FOREIGN KEY (`fkIdLocalComercial`) REFERENCES `localcomercial` (`pkIdLocalComercial`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cierredecajaadmin`
--
ALTER TABLE `cierredecajaadmin`
  ADD CONSTRAINT `localcomercial_cierredecajaadmin_fk` FOREIGN KEY (`fkIdLocalComercial`) REFERENCES `localcomercial` (`pkIdLocalComercial`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `personanatural_cliente_fk` FOREIGN KEY (`fkIdPersonaNatural`) REFERENCES `personanatural` (`pkIdPersonaNatural`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `comerciante`
--
ALTER TABLE `comerciante`
  ADD CONSTRAINT `personanatural_comerciante_fk` FOREIGN KEY (`fkIdPersonaNatural`) REFERENCES `personanatural` (`pkIdPersonaNatural`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `itemventa`
--
ALTER TABLE `itemventa`
  ADD CONSTRAINT `producto_itemventa_fk` FOREIGN KEY (`fkIdProducto`) REFERENCES `producto` (`pkIdProducto`) ON UPDATE CASCADE,
  ADD CONSTRAINT `venta_itemventa_fk` FOREIGN KEY (`fkIdVenta`) REFERENCES `venta` (`pkIdVenta`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `localcomercial`
--
ALTER TABLE `localcomercial`
  ADD CONSTRAINT `comerciante_localcomercial_fk` FOREIGN KEY (`fkIdComerciantePropietario`) REFERENCES `comerciante` (`pkIdComerciante`) ON UPDATE CASCADE,
  ADD CONSTRAINT `personajuridica_localcomercial_fk` FOREIGN KEY (`fkIdPersonaJuridica`) REFERENCES `personajuridica` (`pkIdPersonaJuridica`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `mensajereclamo`
--
ALTER TABLE `mensajereclamo`
  ADD CONSTRAINT `reclamo_mensajereclamo_fk` FOREIGN KEY (`fkIdReclamo`) REFERENCES `reclamo` (`pkIdReclamo`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `personanatural`
--
ALTER TABLE `personanatural`
  ADD CONSTRAINT `tipodocumento_personanatural_fk` FOREIGN KEY (`fkIdTipoDocumento`) REFERENCES `tipodocumento` (`pkIdTipoDocumento`) ON UPDATE CASCADE,
  ADD CONSTRAINT `usuario_personanatural_fk` FOREIGN KEY (`fkIdUsuario`) REFERENCES `usuario` (`pkIdUsuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `presentacionproducto`
--
ALTER TABLE `presentacionproducto`
  ADD CONSTRAINT `productolocal_presentacionproducto_fk` FOREIGN KEY (`fkIdProductoLocal`) REFERENCES `productolocal` (`pkIdProductoLocal`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `categoriaproducto_producto_fk` FOREIGN KEY (`fkIdCategoriaProducto`) REFERENCES `categoriaproducto` (`pkIdCategoriaProducto`) ON UPDATE CASCADE,
  ADD CONSTRAINT `imagen_producto_fk` FOREIGN KEY (`fkIdImagen`) REFERENCES `imagen` (`pkIdImagen`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productolocal`
--
ALTER TABLE `productolocal`
  ADD CONSTRAINT `localcomercial_productolocal_fk` FOREIGN KEY (`fkIdLocalComercial`) REFERENCES `localcomercial` (`pkIdLocalComercial`) ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_productolocal_fk` FOREIGN KEY (`fkIdProducto`) REFERENCES `producto` (`pkIdProducto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `reclamo`
--
ALTER TABLE `reclamo`
  ADD CONSTRAINT `venta_reclamo_fk` FOREIGN KEY (`fkIdVenta`) REFERENCES `venta` (`pkIdVenta`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `cliente_venta_fk` FOREIGN KEY (`fkIdCliente`) REFERENCES `cliente` (`pkIdCliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `localcomercial_venta_fk` FOREIGN KEY (`fkIdLocalComercial`) REFERENCES `localcomercial` (`pkIdLocalComercial`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
