http://localhost/festa/backend/TruthDare_api.php?action=getCategories
http://localhost/festa/backend/TruthDare_api.php?action=getDare&categories=hot,party&dificultat=2

USE festa;

CREATE TABLE truthDare (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  tipus BOOLEAN NOT NULL, -- 1 = truth, 0 = dare
  dificultat ENUM('1', '2', '3') NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO truthDare (text, tipus, dificultat, category) VALUES
-- Preguntes "Truth" (Veritat)
('Has tingut alguna fantasia amb algú d\'aquesta sala?', 1, '2', 'hot'),
('Quina és la teva zona erògena més sensible?', 1, '2', 'hot'),
('Has enviat alguna vegada fotos pujades de to?', 1, '3', 'hot'),
('Quina és la situació més atrevida que has viscut?', 1, '3', 'hot'),
('Amb quina persona aquí tindries una cita?', 1, '1', 'hot'),
('Si poguessis canviar una cosa del teu passat, què seria?', 1, '2', 'general'),
('Quin és el lloc més estrany on has dormit?', 1, '1', 'divertit'),
('Has fet alguna vegada una broma pesada a algú?', 1, '2', 'divertit'),
('Si poguessis viure en qualsevol lloc del món, on seria?', 1, '1', 'general'),
('Quin ha estat el moment més vergonyós de la teva vida?', 1, '3', 'divertit'),
('Has mentit alguna vegada per sortir-te amb la teva?', 1, '1', 'amistats'),
('Quina és la teva por més gran?', 1, '2', 'personal'),
('Què faries si guanyessis la loteria demà?', 1, '1', 'divertit'),

-- Proves "Dare" (Prova)
('Fes un petó a la persona de la teva dreta o pren un xarrup.', 0, '2', 'hot'),
('Fes un massatge sensual a algú durant un minut.', 0, '2', 'hot'),
('Dóna un petó en alguna part del cos d\'algú a l\'atzar.', 0, '3', 'hot'),
('Digues a algú aquí un secret calent que mai has explicat.', 0, '1', 'hot'),
('Fes un striptease de 30 segons amb la música que triïn.', 0, '3', 'hot'),
('Fes una imitació d\'algú famós i que la resta ho endevini.', 0, '1', 'divertit'),
('Balla durant un minut sense música.', 0, '2', 'divertit'),
('Envia un missatge aleatori a la cinquena persona dels teus contactes.', 0, '3', 'divertit'),
('Explica un acudit dolent i fes que tothom rigui.', 0, '1', 'divertit'),
('Fes una volta per l\'habitació caminant com un pingüí.', 0, '1', 'divertit'),
('Balla sense música durant un minut.', 0, '1', 'divertit'),
('Fes una imitació divertida d’algú del grup.', 0, '1', 'humor'),
('Parla com un robot fins al teu pròxim torn.', 0, '2', 'divertit'),
('Truca a algú a l’atzar i digues-li que el trobes a faltar.', 0, '3', 'bogeria'),
('Fes 20 flexions seguides.', 0, '2', 'fitness');


INSERT INTO truthDare (text, tipus, dificultat, category) VALUES
-- Preguntes "Truth" - Categoria "Hot" (Nivell 3: Extrem)
('Quina és la teva fantasia sexual més salvatge i que mai has confessat a ningú?', 1, '3', 'hot'),
('Si poguessis tenir sexe amb algú d\'aquesta sala, sense conseqüències, qui seria i per què?', 1, '3', 'hot'),
('Quina és la cosa més atrevida que has fet en públic?', 1, '3', 'hot'),
('Has fingit alguna vegada un orgasme? Explica la situació.', 1, '2', 'hot'),
('Quin és el teu major \"turn-on\" i \"turn-off\"?', 1, '2', 'hot'),

-- Proves "Dare" - Categoria "Hot" (Nivell 3: Extrem)
('Fes un \"lap dance\" a la persona que triïs durant 1 minut.', 0, '3', 'hot'),
('Besar apassionadament a algú (a l\'atzar o escollit) durant 30 segons.', 0, '3', 'hot'),
('Llepa nata (o similar) del cos d\'algú altre.', 0, '3', 'hot'),
('Treu-te una peça de roba escollida per la resta (excepte roba interior).', 0, '3', 'hot'),
('Envia un missatge de text explícit a un contacte aleatori del teu telèfon.', 0, '3', 'hot'),

-- Preguntes "Truth" - Categoria "Party" (Nivell 2 & 3)
('Quina és la pitjor ressaca que has tingut i què la va causar?', 1, '2', 'party'),
('Has fet alguna vegada \"crash\" a una festa? Explica la història.', 1, '2', 'party'),
('Quin és el secret més escandalós que saps d\'algú altre en aquesta sala?', 1, '3', 'party'),
('Has estat alguna vegada expulsat/da d\'un bar o club? Per què?', 1, '2', 'party'),
('Què és el més estúpid que has fet sota els efectes de l\'alcohol?', 1, '3', 'party'),

-- Proves "Dare" - Categoria "Party" (Nivell 2 & 3)
('Barreja 3 begudes diferents (escollides per altres) i beu-te-les d\'un glop.', 0, '2', 'party'),
('Fes un \"body shot\" amb algú (amb una beguda no alcohòlica si ho prefereixes).', 0, '2', 'party'),
('Roba alguna cosa petita (sense valor) i amaga-la sense que ningú et vegi.', 0, '2', 'party'),
('Crida alguna cosa estúpida al carrer/finestra.', 0, '2', 'party'),
('Imita a algú famós borratxo.', 0, '3', 'party'),

-- Preguntes "Truth" - Categoria "Personal" (Nivell 3: Reflexió profunda)
('Quina és la decisió més difícil que has hagut de prendre a la teva vida i per què?', 1, '3', 'personal'),
('De què et sents més orgullós/a de tu mateix/a?', 1, '2', 'personal'),
('Si poguessis parlar amb el teu jo de fa 10 anys, què li diries?', 1, '3', 'personal'),
('Quina és la cosa que més valores en una amistat?', 1, '2', 'personal'),
('Quin és el teu major arrepentiment?', 1, '3', 'personal'),

-- Proves "Dare" - Categoria "Creativa/Artística" (Nivell 2 & 3)
('Dibuixa un retrat d\'algú de la sala amb els ulls embenats.', 0, '2', 'creatiu'),
('Inventa una cançó sobre algú d\'aquí i canta-la.', 0, '2', 'creatiu'),
('Fes una escultura amb objectes de la sala en 2 minuts.', 0, '2', 'creatiu'),
('Recita un poema inventat amb molta passió.', 0, '2', 'creatiu'),
('Representa una escena d\'una pel·lícula coneguda, però canvia el final.', 0, '3', 'creatiu');


INSERT INTO truthDare (text, tipus, dificultat, category) VALUES
-- Preguntes "Truth" - Categoria "Hot" (Nivell 2 & 3)
('Quin és el lloc més excitant on has tingut sexe?', 1, '3', 'hot'),
('Has tingut alguna experiència amb més d\'una persona alhora?', 1, '3', 'hot'),
('Quina és la teva postura sexual preferida i per què?', 1, '2', 'hot'),
('Has fet mai sexe en un lloc públic on podien pillar-te?', 1, '3', 'hot'),
('Quin és el compliment més calent que t\'han fet?', 1, '2', 'hot'),
('Quina és la cosa més perversa que has pensat?', 1, '3', 'hot'),
('Has tingut mai una aventura amb algú que coneixies bé?', 1, '3', 'hot'),
('Quina és la cosa més atrevida que has fet per seduir algú?', 1, '2', 'hot'),

-- Proves "Dare" - Categoria "Hot" (Nivell 2 & 3)
('Fes una trucada eròtica a algú de la teva llista de contactes.', 0, '3', 'hot'),
('Llepa l\'orella d\'algú lentament i sensualment.', 0, '2', 'hot'),
('Descriu amb detalls la teva fantasia sexual més salvatge a algú.', 0, '3', 'hot'),
('Fes un massatge sensual a les espatlles d\'algú amb els ulls tancats.', 0, '2', 'hot'),
('Dibuixa alguna cosa sexualment suggerent a l\'esquena d\'algú amb el dit.', 0, '2', 'hot'),
('Dóna un petó apassionat al coll d\'algú durant 15 segons.', 0, '2', 'hot'),
('Fes un striptease lent i sensual per a algú, utilitzant només objectes de la sala.', 0, '3', 'hot'),
('Llegeix un fragment d\'una novel·la eròtica en veu alta i sensual.', 0, '2', 'hot'),
('Inventa un acudit amb doble sentit i explica\'l a tothom.', 0, '2', 'hot');
