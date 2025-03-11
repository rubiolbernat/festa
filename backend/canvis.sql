-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fadesng
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drink_data`
--

create database festa;
use festa;

DROP TABLE IF EXISTS `drink_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drink_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `day_of_week` int NOT NULL,
  `location` varchar(100) NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `drink` varchar(100) NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `others` text,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `drink_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `festa_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drink_data`
--

LOCK TABLES `drink_data` WRITE;
/*!40000 ALTER TABLE `drink_data` DISABLE KEYS */;
INSERT INTO `drink_data` VALUES (1,'2025-03-09 21:43:08',3,'2025-03-09',7,'Apolo',41.385100,2.173400,'Beer',0.33,'primer test',2.50),(5,'2025-03-10 23:42:34',3,'2025-03-11',2,'',0.000000,0.000000,'',1.00,'',0.00),(6,'2025-03-10 23:43:24',3,'2025-03-11',2,'Casa',0.000000,0.000000,'Vodka taronjada',0.50,'',2.50),(7,'2025-03-10 23:46:03',3,'2025-03-11',2,'',0.000000,0.000000,'',1.00,'',0.00),(12,'2025-03-11 00:40:41',3,'2025-03-11',2,'test',0.000000,0.000000,'Test',0.33,'prova 3',0.00),(14,'2025-03-11 00:40:41',3,'2025-03-11',2,'test',0.000000,0.000000,'Test',0.33,'prova 3',0.00),(15,'2025-03-11 00:40:41',3,'2025-03-11',2,'test',0.000000,0.000000,'Test',0.33,'prova 3',0.00),(16,'2025-03-11 00:41:36',3,'2025-03-11',2,'caseta',0.000000,0.000000,'Test',0.33,'prova 3',0.00),(17,'2025-03-11 00:41:48',3,'2025-03-11',2,'test',0.000000,0.000000,'Test',0.33,'prova 35',0.00),(19,'2025-03-11 00:44:09',3,'2025-03-11',2,'ca',0.000000,0.000000,'',1.26,'aquesta es la 8',2.60),(20,'2025-03-11 01:29:07',3,'2025-03-11',2,'afer',0.000000,0.000000,'wqe',0.33,'rq',0.00);
/*!40000 ALTER TABLE `drink_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions_data`
--

DROP TABLE IF EXISTS `questions_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `category` varchar(50) NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=661 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions_data`
--

LOCK TABLES `questions_data` WRITE;
/*!40000 ALTER TABLE `questions_data` DISABLE KEYS */;
INSERT INTO `questions_data` VALUES
(1,'Jo mai he viatjat a un altre país.','Viatge',1),
(2,'Jo mai he mentit per sortir d\'un embolic.','Personal',1),
(3,'Jo mai he fet paracaigudisme.','Aventura',1),
(4,'Jo mai m\'he liat amb algú del grup.','Hot',1),
(5,'Jo mai ho he fet sense voler-ho.','hot',1),
(6,'Jo mai ho he fet amb més d\'una persona en un mateix dia.','hot',1),
(7,'Jo mai he volgut tirar-me a la mare/pare d\'un amic/ga.','hot',1),
(8,'Jo mai he volgut tirar-me al germà/germana d\'un amic/ga.','hot',1),
(9,'Jo mai m\'he volgut embolicar amb algú present.','hot',1),
(10,'Jo mai he tingut fantasies sexuals sobre algú que no considerés atractiu/va.','hot',1),
(11,'Jo mai ho he fet a pèl.','hot',1),
(12,'Jo mai he acabat a la boca d\'algú/ m\'han acabat a la boca.','hot',1),
(13,'Jo mai he volgut tirar-me al/a la xicot/xicota d\'un amic/ga.','hot',1),
(14,'A mi mai m\'han demanat que anés més lent perquè anava massa ràpid.','hot',1),
(15,'Jo mai he deixat amb les ganes a algú.','hot',1),
(16,'A mi mai m\'han deixat amb les ganes.','hot',1),
(17,'Jo mai he tingut la típica discussió de "llums enceses/apagades".','hot',1),
(18,'Jo mai m\'he trobat un pèl a la boca després de fer sexe oral.','hot',1),
(19,'Jo mai he posat les banyes.','hot',1),
(20,'A mi mai m\'han posat les banyes.','hot',1),
(21,'Jo mai he dubtat de la meva orientació sexual.','personal',1),
(22,'Jo mai m\'he embollicat amb dues persones de diferent sexe en una nit.','hot',1),
(23,'Jo mai m\'he embollicat amb algú i me n\'he penedit immediatament després.','hot',1),
(24,'Jo mai he tingut sexe per pena.','hot',1),
(25,'Jo mai m\'he tirat al meu ex.','hot',1),
(26,'A mi mai m\'han enxampat en l\'acte.','hot',1),
(27,'Jo mai no ho he fet en un lloc públic.','hot',1),
(28,'Jo mai no ho he fet al llit d\'una tercera persona.','hot',1),
(29,'Jo mai no ho he fet amb més gent al voltant.','hot',1),
(30,'Jo mai he fet un trio.','hot',1),
(31,'Jo mai he tingut fantasies sexuals sobre fer un trio amb el meu/la meva xicot/xicota i una altra persona.','hot',1),
(32,'Jo mai m\'he masturbat amb un objecte inanimat.','hot',1),
(33,'Jo mai m\'he fet mal a mi mateix/a al masturbar-me.','hot',1),
(34,'Jo mai m\'he decebut al embolicar-me/tirar-me a algú amb qui tenia moltes ganes.','hot',1),
(35,'Jo mai he practicat sadomasoquisme o usat objectes relacionats.','hot',1),
(36,'Jo mai he intentat sexe anal però no va sortir bé.','hot',1),
(37,'Jo mai he practicat sexe anal per plaer.','hot',1),
(38,'Jo mai m\'he embollicat/tirat a algú que tenia mínim 5 anys més que jo.','hot',1),
(39,'Jo mai he fet alguna cosa sexual a l\'escola/universitat.','hot',1),
(40,'A mi mai m\'han fet un xuclat en un lloc poc comú.','hot',1),
(41,'Jo mai he intentat emborratxar a algú per embolicar-me amb aquesta persona.','hot',1),
(42,'Jo mai he vist porno amb una altra persona.','hot',1),
(43,'Jo mai m\'he gravat amb algú al llit.','hot',1),
(44,'Jo mai m\'he masturbat amb una pel·lícula que no fos pornogràfica.','hot',1),
(45,'Jo mai he tingut un gatillazo.','hot',1),
(46,'Jo mai no ho he fet amb la regla.','hot',1),
(47,'A mi mai m\'han pixat a sobre.','hot',1),
(48,'Jo mai no ho he fet disfressat per satisfer algun morbo.','hot',1),
(49,'Jo mai m\'he embollicat amb el/la xic/xica amb qui estava intentant lligar un amic/ga.','hot',1),
(50,'Jo mai me l\'he empassat.','hot',1),
(51,'Jo mai m\'he excitat en un moment molt poc apropiat.','personal',1),
(52,'A mi mai se m\'ha trencat el condó.','hot',1),
(53,'Jo mai he estat un any sense sexe després d\'haver-ho fet prèviament.','personal',1),
(54,'Jo mai m\'he netejat el cul tan fort, que el paper es trenca i el meu dit índex acaba tocant el meu anus.','personal',1),
(55,'Jo mai he involucrat menjar en el sexe.','hot',1),
(56,'Jo mai no ho he fet en una festa.','hot',1),
(57,'Jo mai m\'he pres la pastilla de l\'endemà.','hot',1),
(58,'Jo mai he tingut sexe per telèfon.','hot',1),
(59,'Jo mai he hagut de córrer a buscar la meva roba perquè acabaven de tocar el timbre de casa.','personal',1),
(60,'Jo mai he parat d\'embolicar-me/tirar-me a algú per preguntar-li a la persona com es deia.','personal',1),
(61,'Jo mai m\'he embollicat/tirat a el/la ex d\'un amic/ga.','hot',1),
(62,'Jo mai he mentit sobre les meves experiències sexuals a la meva nova parella.','personal',1),
(63,'Jo mai he hagut d\'ensenyar/ a mi mai m\'han hagut d\'ensenyar com desabrochar un sostenidor.','hot',1),
(64,'Jo mai he tingut una fantasia sexual sobre un professor/professora.','hot',1),
(65,'Jo mai he enxampat als meus pares fent-ho.','personal',1),
(66,'Jo mai m\'he fet fotos despullat/ada.','hot',1),
(67,'Jo mai he trucat a algú per un nom equivocat mentre ho estàvem fent.','personal',1),
(68,'Jo mai he / a mi mai m\'han llepat el cul.','hot',1),
(69,'Jo mai no ho he fet a la dutxa.','hot',1),
(70,'Jo mai he usat el kamasutra per aprendre o involucrar noves posicions al llit.','hot',1),
(71,'Jo mai no ho he fet amb algú que era verge.','hot',1),
(72,'Jo mai he mentit sobre ser verge.','personal',1),
(73,'Jo mai m\'he mesurat el penis.','personal',1),
(74,'Jo mai he esborrat converses pujades de to perquè la meva parella no m\'enxampés.','personal',1),
(75,'Jo mai m\'he embollicat/ tirat a algú que no em semblava atractiu/va només perquè estava desesperat/ada.','hot',1),
(76,'Jo mai he cregut haver contret una malaltia de transmissió sexual.','personal',1),
(77,'Jo mai he fingit/exagerat un orgasme.','hot',1),
(78,'Jo mai he tingut un/una folla amic/ga.','hot',1),
(79,'Jo mai he sortit de casa sense roba interior.','personal',1),
(80,'Jo mai m\'he embollicat/tirat a un/una estranger/a.','hot',1),
(81,'Jo mai he sentit enveja al veure els genitals d\'un amic/ga.','personal',1),
(82,'Jo mai m\'he masturbat a casa d\'un amic/ga.','hot',1),
(83,'Jo mai he fet/a mi mai m\'han fet una mamada amb condó.','hot',1),
(84,'Jo mai he usat gel al llit.','hot',1),
(85,'Jo mai he demanat que satisfessin un fetitxe meu però sense èxit.','hot',1),
(86,'Jo mai he intentat amagar una erecció en públic sense èxit.','personal',1),
(87,'A mi mai m\'ha posat la violència al llit.','hot',1),
(88,'Jo mai m\'he tirat/s\'han tirat un pet en l\'acte.','personal',1),
(89,'Jo mai he trencat la roba a la meva parella al treure-li-la.','hot',1),
(90,'Jo mai he intentat/volgut que una parella trenqués.','personal',1),
(91,'Jo mai he fet/m\'han fet una cubana.','hot',1),
(92,'Jo mai m\'he masturbat veient hentai.','hot',1),
(93,'Jo mai he acceptat fer alguna cosa per diners.','personal',1),
(94,'Jo mai he introduit/m\'han introduit més de 3 dits.','hot',1),
(95,'Jo mai ho he fet en un cotxe i ha sonat la botzina.','hot',1),
(96,'A mi mai m\'han hagut d\'ensenyar una foto de amb qui m\'havia liat perquè no me\'n recordava.','personal',1),
(97,'Jo mai m\'he depilat els genitals pensant que anava a pillar i he acabat menjant-me els mocs.','personal',1),
(98,'Jo mai he volgut unir-me a dos amics que estiguessin fent-ho.','hot',1),
(99,'Jo mai he fet una llista de tots els tios/ties amb les que m\'he liat.','personal',1),
(100,'Jo mai he aconseguit liar-me/tirar-me a un amor platònic.','hot',1),
(101,'Jo mai he hagut d\'usar més de 2 condons en una mateixa ronda.','hot',1),
(102,'Jo mai ho he fet a totes les habitacions de la meva/seva casa.','hot',1),
(103,'Jo mai he demanat per Chatroulette/Omegle que m\'ensenyin el penis/les tetes.','hot',1),
(104,'Jo mai he hagut d\'usar pàgines online o aplicacions per lligar.','personal',1),
(105,'Jo mai m\'he adonat de que m\'estaven mirant mentre ho estava fent.','hot',1),
(106,'Jo mai m\'he liat amb algú present.','hot',1),
(107,'Jo mai m\'he liat/tirat a algú que em caigués malament.','hot',1),
(108,'A mi mai se m\'han acabat a sobre del cos.','hot',1),
(109,'A mi mai m\'han donat una hòstia per estar tirant la canya.','personal',1),
(110,'Jo mai m\'he penedit de amb qui havia perdut la virginitat.','personal',1),
(111,'Jo mai m\'he liat amb algú que acabava de vomitar.','hot',1),
(112,'A mi mai m\'ha posat algú sense saber en el seu moment que aquella persona tenia mínim 4 anys menys que jo.','hot',1),
(113,'Jo mai he sortit amb algú amb qui sabia que no hi anava a estar molt de temps.','personal',1),
(114,'Jo mai he fet un 69.','hot',1),
(115,'Jo mai ho he fet amb els meus pares a prop.','hot',1),
(116,'Jo mai he lligat amb algú per posar gelós/a a una persona.','personal',1),
(117,'Jo mai he relliscat mentre ho feia a la dutxa.','personal',1),
(118,'Jo mai li he dit a algú "t\'estimo" només per follar.','hot',1),
(119,'Jo mai he fet/a mi mai m\'han fet sagnar al posar dits.','hot',1),
(120,'Jo mai he fet un polvo malíssim.','hot',1),
(121,'Jo mai m\'he masturbat al menys 5 vegades en un dia.','hot',1),
(122,'Jo mai he tingut un somni humit.','hot',1),
(123,'Jo mai he pensat que el sexe oral era fastigós.','hot',1),
(124,'Jo mai he pensat que el sexe oral és millor que la penetració.','hot',1),
(125,'Jo mai he pensat en una altra persona mentre ho estava fent amb algú.','hot',1),
(126,'Jo mai ho he fet amb algú que en la meva opinió tenia el penis petit.','hot',1),
(127,'Jo mai he usat condons amb sabors.','hot',1),
(128,'Jo mai he/a mi mai se m\'han acabat a dins sense condó.','hot',1),
(129,'Jo mai m\'he guardat les fotos del meu ex nu/nua després d\'haver tallat amb ell/ella.','hot',1),
(130,'Jo mai he usat/mai han usat amb mi la marxa enrere com a mètode anticonceptiu.','hot',1),
(131,'Jo mai he sigut còmplice de banyes.','personal',1),
(132,'A mi mai m\'ha tirat la canya un familiar del meu xicot/a.','hot',1),
(133,'Jo mai he enviat a la friendzone a algú després d\'haver-me liat amb aquella persona.','personal',1),
(134,'Jo mai m\'he alegrat per alguna cosa dolenta que li hagi passat al meu ex.','personal',1),
(135,'Jo mai ho he fet més de 5 vegades en un dia.','hot',1),
(136,'Jo mai m\'he liat amb algú de la meva classe actual.','hot',1),
(137,'A mi mai m\'han fet una cobra de veritat.','personal',1),
(138,'Jo mai m\'he penedit d\'un tatuatge.','personal',1),
(139,'A mi mai m\'ha donat més morbo fer-ho fora de casa que a dins.','hot',1),
(140,'Jo mai m\'he quedat adormit/da durant el sexe.','hot',1),
(141,'Jo mai m\'he enamorat d\'algú mentre tenia xicot/a.','personal',1),
(142,'Jo mai he tallat amb un xicot/a perquè el sexe no em satisfeia.','hot',1),
(143,'Jo mai he trencat el llit al fer-ho.','hot',1),
(144,'A mi mai m\'han cridat l\'atenció els veïns per fer massa soroll durant el sexe.','hot',1),
(145,'Jo mai he/a mi mai m\'han agafat del cabell amb força en el sexe.','hot',1),
(146,'Jo mai he aguantat menys de 10 minuts al llit.','hot',1),
(147,'Mai han aguantat menys de 10 minuts al llit amb mi.','hot',1),
(148,'Jo mai ho he fet 3 o més vegades seguides.','hot',1),
(149,'Jo mai m\'he/a mi mai m\'han despertat amb una mamada/polvo.','hot',1),
(150,'Jo mai m\'he masturbat mentre feia una videotrucada amb algú.','hot',1),
(151,'Jo mai m\'he creat un compte fals en alguna xarxa social per veure què feia un/una ex sense que se n\'adonés.','personal',1),
(152,'Jo mai he aconseguit liar-me o sortir amb algú amb qui estava prèviament a la friendzone.','personal',1),
(153,'A mi mai m\'han pillat un xuclat els meus pares.','hot',1),
(154,'Jo mai tindria una relació amb algú present si es donés el cas.','personal',1),
(155,'Jo mai he vist porno de germanastres/padrastres/madrastres.','hot',1),
(156,'Jo mai he/a mi mai m\'han fet gola profunda.','hot',1),
(157,'Jo mai m\'he sentit malament amb mi mateix/a després de tocar-me.','personal',1),
(158,'Jo mai li he seguit el rotllo a un professor/a que m\'estigués tirant.','hot',1),
(159,'Jo mai he demanat fer un vídeo porno però sense èxit.','hot',1),
(160,'Jo mai he fingit ser d\'una altra nacionalitat per lligar.','personal',1),
(161,'Jo mai he tingut sexe interracial.','hot',1),
(162,'Jo mai he estat frustrat perquè no em satisfeia el sexe amb una persona a qui estimava.','hot',1),
(163,'Jo mai m\'he masturbat en grup.','hot',1),
(164,'Jo mai m\'he obsessionat totalment o parcialment amb algú després de liar-me amb aquesta persona una vegada.','personal',1),
(165,'Jo mai he llepat uns mugrons.','hot',1),
(166,'A mi mai m\'han llepat els mugrons.','hot',1),
(167,'Jo mai he estat a la friendzone amb algú present.','personal',1),
(168,'Jo mai he tallat amb algú per sortir amb una altra persona.','personal',1),
(169,'Mai han tallat amb mi per sortir amb una altra persona.','personal',1),
(170,'Jo mai ho he fet estant malalt.','hot',1),
(171,'Jo mai he volgut tirar-me/tirat al meu millor amic/ga.','hot',1),
(172,'Jo mai he preferit els culs a les tetes.','hot',1),
(173,'Jo mai he tingut un conflicte amb el xicot/a del meu ex.','personal',1),
(174,'Jo mai he pensat que em casaria amb un ex o actual parella.','personal',1),
(175,'Jo mai he somiat que em liava/tirava a algú i m\'he decebut en despertar-me.','hot',1),
(176,'Jo mai m\'he liat amb algú que tenia molt mal alè.','hot',1),
(177,'A mi mai m\'han fet mal al practicar sexe oral.','hot',1),
(178,'Jo mai he tingut la paranoia d\'estar embarassada perquè se m\'havia endarrerit la regla.','personal',1),
(179,'Jo mai he/a mi mai m\'han fet una mamada conduint.','hot',1),
(180,'Jo mai li he seguit el rotllo a algú que m\'estava tirant només per aconseguir alcohol.','personal',1),
(181,'Jo mai he vist una joguina sexual i he sentit intriga.','hot',1),
(182,'Jo mai he tingut un somni sexual sobre algú present/de la classe.','hot',1),
(183,'Jo mai he sentit intriga per practicar sexe oral amb algú del meu mateix sexe.','hot',1),
(184,'Jo mai he pensat que el sexe entre el mateix sexe és o seria millor que el sexe entre diferents sexes.','personal',1),
(185,'Jo mai he sentit atracció per algun familiar.','hot',1),
(186,'Jo mai he xuclat un penis/cony que sabés molt mal.','hot',1),
(187,'A mi mai m\'ha interromput la meva mascota mentre estava fent-ho.','personal',1),
(188,'Jo mai m\'he/mai s\'han equivocat de forat.','hot',1),
(189,'Jo mai m\'he masturbat just abans de fer-ho per durar més.','hot',1),
(190,'Jo mai he usat un vídeo porno com a model a seguir.','hot',1),
(191,'Jo mai m\'he vestit d\'una certa forma per atreure l\'atenció d\'algú i ha passat de mi.','personal',1),
(192,'Jo mai he llogat una habitació d\'hotel o motel només per follar.','hot',1),
(193,'Jo mai faria un trio amb gent aquí present.','hot',1),
(194,'Jo mai he jugat a algun joc amb el càstig de fer un striptease.','hot',1),
(195,'Jo mai m\'he embollicat amb algú que besés realment malament.','hot',1),
(196,'Jo mai he usat el mòbil mentre ho estava fent.','personal',1),
(197,'Jo mai ho he fet mantenint 0 contacte visual amb l\'altra persona.','hot',1),
(198,'A mi mai m\'ha fet enrere veure quant pèl púbic tenia la persona amb qui ho anava a fer.','hot',1),
(199,'Jo mai he rigut mentre ho estava fent.','personal',1),
(200,'Jo mai he tirat la canya de broma i ha acabat sortint millor del que esperava.','personal',1),
(201,'Jo mai m\'he embollicat/tirat al millor amic/ga del meu ex.','hot',1),
(202,'Jo mai m\'he fet fotos sensuals despullat/ada per enviar-les a algú.','hot',1),
(203,'Jo mai he posat/ a mi mai m\'han posat un condó amb la boca.','hot',1),
(204,'Jo mai he mentit en aquest Jo Mai.','personal',1),
(205,'Jo mai m\'he tirat/embollicat a algú que no he tornat a veure en la meva vida.','hot',1),
(206,'Jo mai m\'he imaginat com serien les tetes/el penis d\'algú present.','hot',1),
(207,'Jo mai m\'hauria tirat a algú de classe a principi de curs, però ara em fa fàstic.','personal',1),
(208,'Jo mai he estat pillat per algú present sense haver-li-ho dit mai.','personal',1),
(209,'Jo mai he cagat i m\'he netejat el cul de peu.','personal',1),
(210,'Jo mai he pixat assegut sent tio.','personal',1),
(211,'Jo mai he pixat de peu sent tia.','personal',1),
(212,'Jo mai m\'he corregut a dins accidentalment.','hot',1),
(213,'Jo mai he azotado con el pene a una tia en la cara.','hot',1),
(214,'Jo mai he corregit a un/a tio/a en el sexe.','hot',1),
(215,'Jo mai he sigut corregit en el sexe per l\'altra persona.','hot',1),
(216,'Jo mai he intentat lligar demostrant la carrera que tinc.','personal',1),
(217,'Jo mai m\'he fet 5 hidalgos en 3 hores.','personal',1),
(218,'Jo mai he ofert a un policia un cubata.','personal',1),
(219,'Jo mai m\'he donat pechazos contra el terra.','personal',1),
(220,'Jo mai m\'he contingut les ganes de rebentar a un sexualment parlant.','hot',1),
(221,'Jo mai he hagut de salvar al meu colega de baralles.','personal',1),
(222,'Jo mai m\'he corregut i m\'he sorprès de tot el que ha sortit.','hot',1),
(223,'Jo mai em liaria amb el/la de l\'esquerra.','personal',1),
(224,'Jo mai m\'he acabat una ampolla sol/a.','personal',1),
(225,'Jo mai he pensat que seré pare accidentalment.','personal',1),
(226,'Jo mai he pensat que la vida és una merda.','personal',1),
(227,'Jo mai he menjat pizza amb pinya.','food',1),
(228,'Jo mai he potado més de 3 vegades per alcohol.','personal',1),
(229,'Jo mai m\'he quedat 1 hora menjant monchis i mirant a un punt fix.','personal',1),
(230,'Jo mai he pensat que avui se\'n va a liar que flipas.','personal',1),
(231,'Jo mai em liaria amb el/la de la dreta.','personal',1),
(232,'Jo mai he pillat un cubata d\'un altre i he cregut que tenia droga a dins.','personal',1),
(233,'Jo mai he pensat que tinc una parafilia molt rara.','hot',1),
(234,'Jo mai m\'he menjat un moc.','personal',1),
(235,'Jo mai m\'he rigut de la caiguda d\'un nen petit.','personal',1),
(236,'Jo mai he pensat que un dels presents vesteix molt malament.','personal',1),
(237,'Jo mai he pensat que el rock metal és la hòstia.','personal',1),
(238,'Jo mai m\'he rigut d\'un policia a la seva cara.','personal',1),
(239,'Jo mai he deixat tirat a un/a colega per un/a tio/a.','personal',1),
(240,'Jo mai he pres més de 10 chupitos en una nit havent pres cubatas.','personal',1),
(241,'Jo mai he vist "fake taxi".','hot',1),
(242,'Jo mai he vist "public agent".','hot',1),
(243,'Jo mai he vist zoofília.','hot',1),
(244,'Jo mai he tingut "por" a fer una orgia.','hot',1),
(245,'Jo mai he fet fora al meu colega d\'una habitació per follar.','hot',1),
(246,'Jo mai he demanat un condó al meu amic.','personal',1),
(247,'Jo mai m\'he embollicat amb algú que mai m\'ho hauria pensat.','hot',1),
(248,'Jo mai m\'he sentit atret/a per un professor o professora.','hot',1),
(249,'Jo mai he enviat un missatge calent a una persona equivocada.','hot',1),
(250,'A mi mai m\'han pagat per tenir sexe.','hot',1),
(251,'Jo mai besaria a la persona que tinc a la meva esquerra.','personal',1),
(252,'Jo mai he pensat que li caic malament a algú aquí present.','personal',1),
(253,'Jo mai he vist porno amb una altra persona.','hot',1),
(254,'Jo mai he perdut la virginitat en un lloc diferent a un llit.','hot',1),
(255,'Jo mai he provat els bolets.','personal',1),
(256,'Jo mai he copiat en un examen.','personal',1),
(257,'Jo mai m\'he liat amb dues persones a la vegada.','hot',1),
(258,'Jo mai m\'he liat amb dues persones a la vegada.','hot',1),
(259,'Jo mai m\'he tirat un pet davant de tot el món.','personal',1),
(260,'Jo mai he sigut l\'últim en sortir d\'una discoteca.','personal',1),
(261,'Jo mai m\'he liat amb un/a amig@ per diversió.','hot',1),
(262,'Jo mai he fet o m\'han fet una cubana.','hot',1),
(263,'Jo mai no he pogut beure perquè havia de conduir.','personal',1),
(264,'Jo mai he fet sinpa.','personal',1),
(265,'Jo mai he rebut sexe oral sense estar depilat/da.','hot',1),
(266,'Jo mai he mentit sobre la meva edat.','personal',1),
(267,'Jo mai he pensat que algú dels presents és ninfòman@.','hot',1),
(268,'Jo mai m\'he colat en un lloc prohibit.','personal',1),
(269,'Jo mai he fet un intercanvi de parelles.','hot',1),
(270,'Jo mai m\'he equivocat de forat.','hot',1),
(271,'Jo mai he viatjat més d\'una hora per tenir relacions sexuals.','hot',1),
(272,'Jo mai he mentit sobre alguna experiència sexual.','personal',1),
(273,'Jo mai m\'he deixat les claus a casa.','personal',1),
(274,'Jo mai he anomenat a algú per un mote durant el sexe.','hot',1),
(275,'Jo mai m\'he masturbat en el cotxe.','hot',1),
(276,'Jo mai he vomitat per culpa de l\'alcohol.','personal',1),
(277,'Jo mai m\'he mesurat el penis.','personal',1),
(278,'Jo mai he pegat a algú.','personal',1),
(279,'Jo mai he estat denunciat pels meus veïns.','personal',1),
(280,'Jo mai he pillat al meu german@ tenint sexe.','personal',1),
(281,'Jo mai he fet una cobra.','personal',1),
(282,'Jo mai m\'he masturbat a la dutxa.','hot',1),
(283,'Jo mai he practicat sexe en un lavabo portàtil.','hot',1),
(284,'Jo mai he tingut somnis eròtics amb algun dels presents.','hot',1),
(285,'Jo mai he caigut a terra al carrer.','personal',1),
(286,'Jo mai he acabat follant i no m\'ho esperava.','hot',1),
(287,'Jo mai m\'he imaginat a algú dels presents follant.','hot',1),
(288,'Jo mai he tingut una relació oberta.','hot',1),
(289,'Jo mai he vomitat a sobre de algú.','personal',1),
(290,'Jo mai he dubtat de la meva sexualitat.','personal',1),
(291,'Jo mai tindria sexe amb la parella d\'un amic/ga.','personal',1),
(292,'Jo mai he sigut el borratxo del grup.','personal',1),
(293,'A mi mai m\'han posat les banyes.','personal',1),
(294,'Jo mai he rebutjat un trio.','hot',1),
(295,'Jo mai he canviat el nom d\'un contacte per amagar qui era.','personal',1),
(296,'Jo mai he anat a un hotel per tenir relacions sexuals.','hot',1),
(297,'A mi mai m\'han posat la llengua fins la gola.','hot',1),
(298,'Jo mai he practicat sexe a la piscina/mar.','hot',1),
(299,'Jo mai he practicat sexe al bany d\'una discoteca.','hot',1),
(300,'Jo mai he pensat que sóc asexual.','personal',1),
(301,'Jo mai he estat una setmana sense dutxar-me.','personal',1),
(302,'Jo mai he vist a algú tenint sexe a un cotxe.','hot',1),
(303,'Jo mai no m\'he tret les sabates perquè m\'olien els peus.','personal',1),
(304,'Jo mai he posat calent/a algú i l\'he deixat amb les ganes.','hot',1),
(305,'Jo mai he fugit de la policia.','personal',1),
(306,'Jo mai m\'he empassat el semen d\'una altra persona.','hot',1),
(307,'Jo mai m\'he masturbat a l\'aire lliure.','hot',1),
(308,'Jo mai he sigut multat per pixar al carrer.','personal',1),
(309,'Jo mai he vist tutorials de caràcter sexual.','hot',1),
(310,'Jo mai faria un trio amb dues persones aquí presents.','hot',1),
(311,'Jo mai he mentit sobre mi per poder lligar.','personal',1),
(312,'A mi mai m\'han hagut de cuidar per estar borratxo.','personal',1),
(313,'Jo mai he practicat sexe a l\'institut o universitat.','hot',1),
(314,'Jo mai he practicat sexe al bany.','hot',1),
(315,'Jo mai vaig perdre la virginitat a casa d\'un amic/ga.','hot',1),
(316,'Jo mai besaria algú aquí present.','personal',1),
(317,'Jo mai he tingut semen a la cara.','hot',1),
(318,'Jo mai m\'he masturbat amb porno.','hot',1),
(319,'Jo mai he agafat pel cabell a la meva parella durant el sexe.','hot',1),
(320,'Jo mai he cagat a la banyera.','personal',1),
(321,'Jo mai he tingut gelos d\'algú aquí present.','personal',1),
(322,'Jo mai he begut al col·legi o institut.','personal',1),
(323,'Jo mai m\'he rascat les parts en públic.','personal',1),
(324,'Jo mai he provat menjar de gos.','food',1),
(325,'Jo mai he enganxat un moc a sota de la taula.','personal',1),
(326,'Jo mai he tingut *corrida* al cabell.','hot',1),
(327,'Jo mai he practicat sexe amb un/una *madurito/a*.','hot',1),
(328,'Jo mai he ballat despullat/ada.','hot',1),
(329,'Jo mai he provat fins on podia empassar-me alguna cosa.','personal',1),
(330,'Jo mai he emborratxat a algú per aprofitar-me\'n.','hot',1),
(331,'Jo mai hge tingut fantasies sexuals amb algun professor.','hot',1),
(332,'Jo mai he practicat sexe durant almenys 3 hores seguides.','hot',1),
(333,'Jo mai m\'he liat amb algú que no m\'atragui físicament.','hot',1),
(334,'Jo mai he sortit al carrer sense roba interior.','personal',1),
(335,'Jo mai he escoltat algú dels presents *follant*.','hot',1),
(336,'Jo mai m\'he masturbat amb la foto d\'un amic/ga.','hot',1),
(337,'Jo mai he pagat per sexe.','hot',1),
(338,'Jo mai m\'he masturbat a casa d\'un amic/ga.','hot',1),
(339,'Jo mai he practicat sexe durant el període (la regla).','hot',1),
(340,'Jo mai he fumat a amagades a l\'institut.','personal',1),
(341,'Jo mai m\'he masturbat pensant en algun dels presents.','hot',1),
(342,'Jo mai m\'he liat amb més de 10 persones a la meva vida.','hot',1),
(343,'Jo mai he mirat *hentai*.','hot',1),
(344,'Jo mai he provat el semen.','hot',1),
(345,'Jo mai m\'he quedat amb les ganes de besar a algun dels presents.','personal',1),
(346,'Jo mai he practicat sexe davant d\'un mirall.','hot',1),
(347,'A mi mai m\'han donat una bufetada mentre tenia relacions sexuals.','hot',1),
(348,'Jo mai he practicat sexe amb algú 4 anys més jove que jo.','hot',1),
(349,'Jo mai he escopit a algú sense voler.','personal',1),
(350,'Jo mai m\'he oblidat de que tenia un examen.','personal',1),
(351,'Jo mai he tocat a la meva parella al transport públic.','hot',1),
(352,'Jo mai he besat a algú del mateix sexe.','hot',1),
(353,'Jo mai he tingut dues cites o més el mateix dia.','personal',1),
(354,'Jo mai he tingut converses eròtiques per telèfon.','hot',1),
(355,'Jo mai he sigut expulsat d\'una discoteca per anar massa borratxo.','personal',1),
(356,'Jo mai he donat un massatge amb final feliç.','hot',1),
(357,'Jo mai he olorat els meus mitjons després de treure\'ls.','personal',1),
(358,'Jo mai he mentit sobre ser verge.','personal',1),
(359,'Jo mai m\'he liat després de *potar* (vomitar).','hot',1),
(360,'Jo mai he parat de *follar* per anar amb els col·legues.','hot',1),
(361,'Jo mai he tingut un/una *folla amig@*.','hot',1),
(362,'Jo mai m\'he masturbat amb una fruita.','hot',1),
(363,'Jo mai m\'he esquitxat al *cagar*.','personal',1),
(364,'Jo mai he acabat una goma d\'esborrar.','personal',1),
(365,'Jo mai he fumat a amagades a casa meva.','personal',1),
(366,'Jo mai m\'han fet una *mamada* mentre conduïa.','hot',1),
(367,'Jo mai he trucat a algú per Whatsapp sense voler.','personal',1),
(368,'Jo mai he entrat al lavabo del sexe oposat.','personal',1),
(369,'Jo mai he trencat un condó.','hot',1),
(370,'Jo mai m\'he adormit durant el sexe.','hot',1),
(371,'Jo mai he begut alcohol per pressió social.','personal',1),
(372,'Jo mai he practicat sexe mentre mirava una peli porno.','hot',1),
(373,'Jo mai m\'he liat amb qui està llegint la pregunta.','hot',1),
(374,'Jo mai he sigut rebutjat per dues o més persones en una nit.','personal',1),
(375,'Jo mai he conduït borratxo.','personal',1),
(376,'Jo mai m\'he masturbat i no m\'he rentat les mans després.','personal',1),
(377,'Jo mai m\'he masturbat en grup.','hot',1),
(378,'Jo mai m\'he liat amb l\'ex xicot/a d\'un/a amig/a.','hot',1),
(379,'Jo mai he practicat sexe sense condó.','hot',1),
(380,'Jo mai m\'he liat amb l\'exparella d\'algun dels presents.','hot',1),
(381,'Jo mai he lligat a la meva parella tenint sexe.','hot',1),
(382,'Jo mai he practicat sexe al cotxe.','hot',1),
(383,'Jo mai he *follat* amb gent a casa.','hot',1),
(384,'Jo mai he fingit un orgasme.','hot',1),
(385,'Jo mai m\'he masturbat en un lloc públic.','hot',1),
(386,'Jo mai he tingut ressaca.','personal',1),
(387,'Jo mai he *perreat* en una discoteca (ballar sensualment).','personal',1),
(388,'Jo mai se m\'ha tret el banyador per accident.','personal',1),
(389,'Jo mai he practicat sexe oral a algú que acabava de tenir relacions sexuals.','hot',1),
(390,'Jo mai he practicat sexe amb dues persones diferents en 24h.','hot',1),
(391,'Jo mai li he mirat el cul a algun dels presents.','personal',1),
(392,'Jo mai he practicat sexe a sobre d\'un electrodomèstic.','hot',1),
(393,'Jo mai he experimentat amb la meva orientació sexual.','personal',1),
(394,'Jo mai he practicat sexe d\'acampada.','hot',1),
(395,'Jo mai he pensat en provar el semen.','hot',1),
(396,'Jo mai he *fardat* d\'haver practicat sexe amb algú (presumir).','personal',1),
(397,'Jo mai m\'he avergonyit d\'haver tingut relacions sexuals amb algú.','personal',1),
(398,'Jo mai he provat alguna droga dura.','personal',1),
(399,'Jo mai he pensat que la persona del costat és molt sexy.','personal',1),
(400,'Jo mai m\'he depilat les parts íntimes per després no acabar *follant*.','personal',1),
(401,'Jo mai he practicat sexe amb algú 4 anys més gran que jo.','hot',1),
(402,'Jo mai he apagat la llum del passadís i he anat corrent a la meva habitació.','personal',1),
(403,'Jo mai he rigut en un funeral.','personal',1),
(404,'Jo mai he vomitat mentre besava a algú.','personal',1),
(405,'Jo mai he masturbat al meu gos.','personal',1),
(406,'Jo mai m\'he masturbat amb un personatge fictici.','hot',1),
(407,'Jo mai m\'he posat calent/a per algú del meu mateix sexe.','hot',1),
(408,'Jo mai he escopit durant el sexe.','hot',1),
(409,'Jo mai m\'he esquitxat durant una *palla* (masturbació).','personal',1),
(410,'Jo mai m\'han pillat *masturbant-me*.','personal',1),
(411,'Jo mai he pensat en *follar-me* a una cosina.','hot',1),
(412,'Jo mai he plorat pel meu ex.','personal',1),
(413,'Jo mai m\'he esquitxat a la cara al masturbar-me.','personal',1),
(414,'Jo mai he *fardat* dels meus músculs al lligar.','personal',1),
(415,'Jo mai he *fardat* de la meva enorme *polla* al lligar (presumir del penis).','hot',1),
(416,'Jo mai he volgut *follar-me* a algú dels presents.','hot',1),
(417,'Jo mai m\'he corregut en un moble.','personal',1),
(418,'Jo mai m\'he fet una *palla* veient Instagram.','hot',1),
(419,'Jo mai m\'he fet passar per amic gai per intentar pillar.','personal',1),
(420,'Jo mai li he fet una *palla* a algun dels presents.','hot',1),
(421,'Jo mai he cregut que sóc molt lleig.','personal',1),
(422,'Jo mai li he ficat el dit pel cul a algú.','hot',1),
(423,'Jo mai he xuclat l\'aixella d\'una altra persona.','hot',1),
(424,'Jo mai he pensat en provar la regla.','hot',1),
(425,'Jo mai he empotrado a la tia/tío y le he hecho sangre.','hot',1),
(426,'Jo mai m\'he alegrat de la mort d\'algú.','personal',1),
(427,'Jo mai he pensat que algun dels presents és *penós*.','personal',1),
(428,'Jo mai he pensat que sóc el *puto amo* (el millor).','personal',1),
(429,'Jo mai he pensat que algun dels presents fa molt mala olor.','personal',1),
(430,'Jo mai m\'he trencat el *frenillo* (frenulum).','hot',1),
(431,'Jo mai he preferit jugar a la play que *follar*.','personal',1),
(432,'Jo mai he preferit una *mamada* a *follar*.','hot',1),
(433,'Jo mai he sigut *pagafantas* per res (algú que fa coses per algú altre esperant un interès romàntic).','personal',1),
(434,'Jo mai he pensat en *follar-me* a una de 6 anys menys.','hot',1),
(435,'Jo mai he pensat en menjar-me una *polla* (els tios) i un *cony* (les ties).','hot',1),
(436,'Jo mai he somiat que mutilava a gent.','personal',1),
(437,'Jo mai he pensat que algun dels presents és un fantasma.','personal',1),
(438,'Jo mai he pensat que algun dels presents és un *lameculos* (un adulador).','personal',1),
(439,'Jo mai he vist als meus pares *follant*.','personal',1),
(440,'Jo mai he fantasejat amb *follar-me* a una veïna.','hot',1),
(441,'Jo mai m\'he masturbat pensant en algun dels presents.','hot',1),
(442,'Jo mai he mentit en aquest Jo mai (si ho has fet et fas un puto Hidalgo sencer gilipolles).','meta',1),
(443,'Jo mai he tingut un somni eròtic amb algun dels presents.','hot',1),
(444,'Jo mai he pensat que algun dels presents la té com un camió.','hot',1),
(445,'Jo mai he pensat que algunes de les presents té un *cony* lleig.','hot',1),
(446,'Jo mai he pensat que algun dels presents la té molt petita.','hot',1),
(447,'Jo mai m\'he portat una desil·lusió (sexualment parlant) amb algun dels presents.','hot',1),
(448,'Jo mai m\'han deixat amb els ous ben grossos.','hot',1),
(449,'Jo mai he tingut el *cony* ben moll només liant-me.','hot',1),
(450,'Jo mai he deixat algun morat durant el sexe.','hot',1),
(451,'Jo mai he pixat a casa d\'algú en un lloc diferent al bany.','personal',1),
(452,'Jo mai he dit de quedar més tard per fer-me una *palla*.','hot',1),
(453,'Jo mai he quedat més d\'hora per fer-me-la abans que els altres.','hot',1),
(454,'Jo mai m\'he emborratxat a base de *tinto de verano*.','personal',1),
(455,'Jo mai m\'he quedat més d\'una hora fumat mirant a un punt fix.','personal',1),
(456,'Jo mai he somiat amb el meu ex.','personal',1),
(457,'Jo mai he plorat per algun defecte físic.','personal',1),
(458,'Jo mai he plorat per treure menys que un excel·lent.','personal',1),
(459,'Jo mai se m\'ha posat dura veient culs a la classe.','hot',1),
(460,'Jo mai he estat curt/a i no he pillat que estaven flirtejant amb mi.','personal',1),
(461,'Jo mai he rebutjat *follar* per pura peresa.','hot',1),
(462,'Jo mai he inventat un "cony artificial" per masturbar-me.','hot',1),
(463,'Jo mai he enviat fotos del meu prepuci.','hot',1),
(464,'Jo mai he tingut pèls entre les dents després de xuclar-lo/la.','hot',1),
(465,'Jo mai he pensat que a algun dels presents se li donaria molt bé ser *puta/yigolo*.','personal',1),
(466,'Jo mai he provat el pinso de gat/gos.','food',1),
(467,'Jo mai m\'han ofert un trio/quartet.','hot',1),
(468,'Jo mai he menjat més de 20000 kcal en un dia.','food',1),
(469,'Jo mai he vist Karmaland.','personal',1),
(470,'Jo mai he buscat japoneses/os en porno.','hot',1),
(471,'Jo mai he buscat negres/os en porno.','hot',1),
(472,'Jo mai m\'ha donat enveja els *trabucos* (membres virils grans) dels actors porno.','hot',1),
(473,'Jo mai he fantasejat amb que un actor/actriu em *follés* molt dur.','hot',1),
(474,'Jo mai he menjat coses ensucrades perquè el meu semen sabés bé.','hot',1),
(475,'Jo mai he buscat maneres per engrandir el meu penis.','hot',1),
(476,'Jo mai m\'he corregut sense que em toquessin a baix.','hot',1),
(477,'Jo mai he pensat que estava embarassada/he embarassat a algú.','personal',1),
(478,'Jo mai he practicat sexe anal.','hot',1),
(479,'Jo mai he hagut d\'amagar un xuclat.','hot',1),
(480,'Jo mai he tingut gelos d\'algú aquí present.','personal',1),
(481,'Jo mai he amagat la meva última connexió a Whatsapp.','personal',1),
(482,'Jo mai m\'he masturbat més de 4 cops en 24h.','hot',1),
(483,'Jo mai m\'he olorat les mans després de gratar-me les parts íntimes.','personal',1),
(484,'Jo mai he practicat sexe a casa d\'un amic o conegut.','hot',1),
(485,'Jo mai li he mirat el cul a algun dels presents.','personal',1),
(486,'Jo mai he ensopegat en públic.','personal',1),
(487,'Jo mai he mentit sobre la mida de la meva *polla*.','personal',1),
(488,'Jo mai m\'he imaginat la mida del penis d\'un amic.','personal',1),
(489,'Jo mai he enviat fotos en *boles*.','hot',1),
(490,'Jo mai he pensat que algun dels presents necessita un *polvo* urgentment.','hot',1),
(491,'Jo mai he rebut sexe oral sense estar depilat/da.','hot',1),
(492,'Jo mai m\'he liat amb algú almenys 3 anys major.','hot',1),
(493,'Jo mai he practicat sexe al carrer.','hot',1),
(494,'Jo mai he eructat mentre estava besant-me amb algú.','personal',1),
(495,'Jo mai m\'he liat amb la parella d\'algun dels presents.','hot',1),
(496,'Jo mai he anat borratxo a classe.','personal',1),
(497,'Jo mai he practicat sexe al bany d\'una discoteca.','hot',1),
(498,'A mi mai m\'han pillat masturbant-me.','personal',1),
(499,'Jo mai m\'he masturbat amb algú al costat.','hot',1),
(500,'Jo mai he besat a dos o més dels presents.','hot',1),
(501,'Jo mai he evitat cagar durant dies quan anava a campaments de viatge.','personal',1),
(502,'Jo mai he tingut fantasies amb algun professor.','hot',1),
(503,'Jo mai li he xuclat el peu a algú.','hot',1),
(504,'Jo mai he insultat a un professor.','personal',1),
(505,'Jo mai besaria a algú aquí present.','personal',1),
(506,'Jo mai he ensenyat les tetes en un concert.','hot',1),
(507,'Jo mai he pensat que sóc molt bo practicant sexe oral.','hot',1),
(508,'Jo mai m\'he liat amb algú del meu mateix sexe.','hot',1),
(509,'Jo mai he pensat que algun dels presents no arribarà a res a la vida.','personal',1),
(510,'Jo mai he pensat que algun dels presents fa mala olor.','personal',1),
(511,'Jo mai he anat col·locat a classe.','personal',1),
(512,'Jo mai m\'he masturbat perquè m\'avorria.','personal',1),
(513,'Jo mai he practicat sexe al bosc.','hot',1),
(514,'Jo mai m\'he olorat l\'aixella en públic.','personal',1),
(515,'Jo mai m\'he exhibit en webcam.','hot',1),
(516,'Jo mai m\'he liat amb més d\'una persona del mateix grup d\'amics.','hot',1),
(517,'Jo mai he practicat sexe oral en la primera cita.','hot',1),
(518,'Jo mai he begut al col·legi o institut.','personal',1),
(519,'Jo mai he canviat el nom d\'un contacte per amagar qui era.','personal',1),
(520,'Jo mai he olorat les meves bragues després de treure-me-les.','personal',1),
(521,'Jo mai m\'he masturbat amb algú a l\'habitació sense que se n\'adoni.','hot',1),
(522,'Jo mai m\'he arrossegat per algú.','personal',1),
(523,'Jo mai m\'he masturbat amb el raig de la dutxa.','hot',1),
(524,'A mi mai m\'han posat les banyes.','personal',1),
(525,'Jo mai he fumat herba.','personal',1),
(526,'Jo mai m\'he excitat pensant en algun dels presents.','hot',1),
(527,'Jo mai he intentat lligar en un altre idioma.','personal',1),
(528,'Jo mai he practicat en una orgia.','hot',1),
(529,'Jo mai he fet/m\'han fet un xuclat.','hot',1),
(530,'Jo mai he trencat uns pantalons per l\'entrecuix.','personal',1),
(531,'Jo mai he practicat sexe a la cuina.','hot',1),
(532,'Jo mai he besat a algú que acabava de conèixer.','hot',1),
(533,'Jo mai he fet una *mamada* mentre la meva parella conduïa.','hot',1),
(534,'Jo mai he vomitat per culpa de l\'alcohol.','personal',1),
(535,'Jo mai he practicat sexe sense condó.','hot',1),
(536,'Jo mai li he dit "t\'estimo" a una persona sense sentir-ho.','personal',1),
(537,'Jo mai he fingit un orgasme.','hot',1),
(538,'Jo mai m\'he liat amb el germà/germana d\'un col·lega.','hot',1),
(539,'Jo mai he begut de la copa d\'un altre.','personal',1),
(540,'Jo mai he vomitat a sobre d\'algú.','personal',1),
(541,'Jo mai he despertat a algú durant el sexe.','hot',1),
(542,'Jo mai he *follat* sense ganes.','hot',1),
(543,'Jo mai he sigut gravat mentre tenia relacions sexuals.','hot',1),
(544,'Jo mai he tingut una relació oberta.','hot',1),
(545,'Jo mai he sigut multat per pixar al carrer.','personal',1),
(546,'Jo mai he practicat sexe en un vaixell.','hot',1),
(547,'Jo mai he practicat sexe amb més de 5 persones a la meva vida.','hot',1),
(548,'Jo mai he pagat per sexe.','hot',1),
(549,'Jo mai m\'han dit que la tinc petita.','hot',1),
(550,'Jo mai he sigut l\'últim en sortir de la discoteca.','personal',1),
(551,'Jo mai he cagat a la platja.','personal',1),
(552,'Jo mai m\'he fet una prova d\'embaràs.','personal',1),
(553,'Jo mai m\'he emborratxat amb els meus pares.','personal',1),
(554,'Jo mai he vist a algú tenint sexe en un cotxe.','hot',1),
(555,'Jo mai m\'he masturbat en grup.','hot',1),
(556,'Jo mai m\'han pillat els meus pares fumant.','personal',1),
(557,'Jo mai he fet un concurs d\'eructes.','personal',1),
(558,'Jo mai m\'he tirat un pet i li he tirat la culpa a un altre.','personal',1),
(559,'Jo mai he fet un 69.','hot',1),
(560,'Jo mai m\'he despertat sense saber on estava.','personal',1),
(561,'Jo mai he pres droga per tenir sexe.','hot',1),
(562,'Jo mai he mentit sobre alguna experiència sexual.','personal',1),
(563,'Jo mai he tingut relacions amb un pare o mare.','hot',1),
(564,'Jo mai he practicat sexe amb una persona aquí present.','hot',1),
(565,'Jo mai he pensat en matar a algú.','personal',1),
(566,'Jo mai m\'he masturbat al *tuto*.','hot',1),
(567,'Jo mai he pensat que les meves tetes són perfectes.','personal',1),
(568,'Jo mai he mentit jugant al "Jo Mai".','meta',1),
(569,'Jo mai he robat el paquet de tabac a un col·lega.','personal',1),
(570,'Jo mai he tingut una relació de més de dos anys.','personal',1),
(571,'Jo mai m\'he pixat a sobre en els últims 5 anys.','personal',1),
(572,'Jo mai m\'he masturbat amb el mòbil com a vibrador.','hot',1),
(573,'Jo mai he lligat a la meva parella tenint sexe.','hot',1),
(574,'Jo mai he pensat en com seria provar la regla.','hot',1),
(575,'Jo mai m\'han pillat els meus pares borratxo.','personal',1),
(576,'Jo mai m\'he pres la pastilla de l\'endemà.','personal',1),
(577,'Jo mai he entrat a un club de *striptease*.','hot',1),
(578,'Jo mai he fingit estar malalt per no anar al *tuto*.','personal',1),
(579,'Jo mai he utilitzat una app per lligar.','personal',1),
(580,'Jo mai he acabat *follant* i no m\'ho esperava.','hot',1),
(581,'Jo mai he pensat que la mida importa.','hot',1),
(582,'Jo mai he portat una faixa.','personal',1),
(583,'Jo mai he intentat fer postures estranyes del Kama Sutra.','hot',1),
(584,'Jo mai he *stalkejat* a algú aquí present.','personal',1),
(585,'Jo mai he mentit sobre la meva nota en un examen.','personal',1),
(586,'Jo mai he esborrat l\'historial del navegador per ocultar alguna cosa.','personal',1),
(587,'Jo mai m\'he tirat un pet a la piscina.','personal',1),
(588,'Jo mai he fet un concurs de *chupitos*.','personal',1),
(589,'Jo mai he volgut ser del sexe oposat.','personal',1),
(590,'Jo mai he oblidat alguna cosa de la nit anterior per l\'alcohol.','personal',1),
(591,'Jo mai he caigut a terra pel carrer.','personal',1),
(592,'Jo mai m\'he ficat el dit pel cul.','hot',1),
(593,'Jo mai m\'he tirat un pet silenciós.','personal',1),
(594,'Jo mai m\'he rascat el cul i m\'he olorat els dits.','personal',1),
(595,'Jo mai he fet *topless* a la platja.','hot',1),
(596,'Jo mai he oblidat que havia quedat amb algú.','personal',1),
(597,'Jo mai no he pogut beure perquè havia d\'estudiar l\'endemà.','personal',1),
(598,'Jo mai he vist porno amb col·legues.','hot',1),
(599,'Jo mai m\'he tallat depilant-me les parts íntimes.','personal',1),
(600,'Jo mai he utilitzat alguna joguina sexual.','hot',1),
(601,'Jo mai he sigut multat per anar borratxo.','personal',1),
(602,'Jo mai m\'he liat amb algú que tingués parella.','hot',1),
(603,'Jo mai m\'he liat amb la mateixa persona que un amic/ga.','hot',1),
(604,'Jo mai he falsificat una firma.','personal',1),
(605,'Jo mai he practicat sexe oral amb algú del mateix sexe.','hot',1),
(606,'Jo mai m\'he dutxat amb algú.','hot',1),
(607,'Jo mai he anomenat a algú per un altre nom durant el sexe.','hot',1),
(608,'A mi mai m\'han masturbat o he masturbat amb els peus.','hot',1),
(609,'Jo mai he deixat caure el meu mòbil al WC.','personal',1),
(610,'Jo mai he tornat amb el meu ex.','personal',1),
(611,'Jo mai he dit que m\'encantava un regal i després l\'he tornat.','personal',1),
(612,'Jo mai he fingit estimar un grup de música quan només em sé el nom.','personal',1),
(613,'Jo mai he escrit al meu ex una nit de festa.','personal',1),
(614,'Jo mai he *stalkejat* l\'instagram del/de la ex del meu xicot/a.','personal',1),
(615,'Jo mai he obert a la policia per haver fet un *fiestón* a casa.','personal',1),
(616,'Jo mai m\'he imaginat sent del sexe oposat.','personal',1),
(617,'Jo mai he anomenat "mamà" a la meva professora.','personal',1),
(618,'Jo mai he perdut un iPhone.','personal',1),
(619,'Jo mai he pesat la fruita, li he enganxat el tiquet i després n\'he posat més.','personal',1),
(620,'Jo mai he mirat el paper després d\'anar al bany.','personal',1),
(621,'Jo mai he pillat a un familiar masturbant-se.','personal',1),
(622,'Jo mai ho he fet al provador d\'una botiga.','hot',1),
(623,'Jo mai ho he fet en una moto.','hot',1),
(624,'Jo mai m\'he sentit atret per un familiar.','hot',1),
(625,'Jo mai he sigut pillat fumant al arribar a casa.','personal',1),
(626,'Jo mai he estat emmanillat.','personal',1),
(627,'Jo mai he sigut detingut per la policia.','personal',1),
(628,'Jo mai he robat alguna cosa de més de 100 euros.','personal',1),
(629,'Jo mai he tingut sexe amb algú que acabava de conèixer.','hot',1),
(630,'Jo mai m\'he masturbat amb un objecte estrany.','hot',1),
(631,'Jo mai m\'he masturbat fora de casa.','hot',1),
(632,'Jo mai he parlat per Whatsapp amb un amic mentre estava al lavabo.','personal',1),
(633,'Jo mai m\'he sentit atret per una persona major de 40.','hot',1),
(634,'Jo mai he robat copes d\'una discoteca.','personal',1),
(635,'Jo mai he parlat mal d\'una persona d\'aquest grup.','personal',1),
(636,'Jo mai he tingut més de tres orgasmes en un dia.','hot',1),
(637,'Jo mai he sigut infidel.','personal',1),
(638,'Jo mai he perdut el coneixement després de beure.','personal',1),
(639,'Jo mai he topat per mirar el mòbil.','personal',1),
(640,'Jo mai he mentit als meus amics.','personal',1),
(641,'Jo mai he mentit a la meva parella.','personal',1),
(642,'Jo mai he fet un ball eròtic.','hot',1),
(643,'Jo mai he rebut un ball eròtic.','hot',1),
(644,'Jo mai he fumat en un *bong*.','personal',1),
(645,'Jo mai he tingut una aventura amb una persona casada.','hot',1),
(646,'Jo mai he vestit amb roba del sexe oposat.','personal',1),
(647,'Jo mai he usat lubricant sexual.','hot',1),
(648,'Jo mai he trencat el llit durant el sexe.','hot',1),
(649,'Jo mai he provat més de 5 postures durant el sexe.','hot',1),
(650,'Jo mai m\'he emborratxat pel matí.','personal',1),
(651,'Jo mai he provat el cibersexe.','hot',1),
(652,'Jo mai he jugat a ser una altra persona durant el sexe.','hot',1),
(653,'Jo mai he fet coses indecents al cinema.','hot',1),
(654,'Jo mai he plorat per una pel·lícula.','personal',1),
(655,'Jo mai he fet jocs de *bondage*.','hot',1),
(656,'Jo mai he passat la nit al calabós.','personal',1),
(657,'Jo mai he jugat a l\'*strip poker*.','hot',1),
(658,'Jo mai m\'he ficat al llit amb dues persones el mateix dia.','hot',1),
(659,'Jo mai he fingit dormir per no tenir sexe.','hot',1),
(660,'Jo mai he tingut un fetitxe estrany.','hot',1);
/*!40000 ALTER TABLE `questions_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'viewer'),(2,'editor'),(3,'merch'),(4,'admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `festa_users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,1),(3,1),(3,2),(3,4);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `festa_users`
--

DROP TABLE IF EXISTS `festa_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `festa_users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `refresh_token` varchar(255) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `festa_users` WRITE;
/*!40000 ALTER TABLE `festa_users` DISABLE KEYS */;
INSERT INTO `festa_users` VALUES (2,'bern','rubiol@gmail.com','$2y$10$M7YhaH7wl.tHgmKvc1u2FO5u/P30ybuSXI6cK1x7o3yT5WpeesTey','2025-02-18 01:09:18','7456881133f5d78cad362c90f7f0f5e05e7b1d1f494714561342322128732976170d34465b20b39e3b6d91a247341eeef1928ec87eb1945bd09190e08b13cf77','2025-03-18 11:25:06'),(3,'Bernat Rubiol','rubiolbernat@gmail.com','$2y$10$E.71U.VW.qMEyoUFf0stvuis10qXCCKnvgAK0oKfon7KTESrgHGDG','2025-03-09 18:25:36','c761f8a637594050adb000a684b1164136843e818662cc269519fa2469bb8d4e3acff897a4c73fc11482d242385ae88e1269697430b7de7f28ef2d52f92670aa','2025-03-18 11:29:13');
/*!40000 ALTER TABLE `festa_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `assign_default_role` AFTER INSERT ON `festa_users` FOR EACH ROW BEGIN
    -- Declare variables
    DECLARE viewer_role_id INT;

    -- Get the role_id for 'viewer'
    SELECT role_id INTO viewer_role_id
    FROM roles
    WHERE role_name = 'viewer';

    -- If the 'viewer' role exists, assign it to the new user
    IF viewer_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.user_id, viewer_role_id);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'fadesng'
--

--
-- Dumping routines for database 'fadesng'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11 11:32:38
