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
