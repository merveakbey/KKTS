-- Veritabanını oluştur
CREATE DATABASE kkts_db;
USE kkts_db;

CREATE TABLE Kullanicilar (
    KullaniciID 	INT AUTO_INCREMENT PRIMARY KEY,
    AdSoyad 		VARCHAR(100) NOT NULL,
    TelefonNumarasi VARCHAR(15),
    Eposta 			VARCHAR(100) UNIQUE NOT NULL,
    UyelikTarihi 	TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Kategoriler tablosunu oluştur
CREATE TABLE Kategoriler (
    KategoriID 		INT AUTO_INCREMENT PRIMARY KEY,
    KategoriAdi 	VARCHAR(50) NOT NULL UNIQUE
    );

-- Kitaplar tablosunu oluştur
CREATE TABLE Kitaplar (
    KitapID 		INT AUTO_INCREMENT PRIMARY KEY,
    KitapAdi 		VARCHAR(200) NOT NULL,
    Yazar	    	VARCHAR(100) NOT NULL,
    KategoriID 		INT NOT NULL,
    YayinTarihi 	DATE,
    StokDurumu 		INT NOT NULL CHECK (StokDurumu >= 0), -- Stok negatif olamaz
    FOREIGN KEY (KategoriID) REFERENCES Kategoriler(KategoriID) ON DELETE CASCADE
);

-- Ödünç İşlemleri tablosunu oluştur
CREATE TABLE OduncAlma (
    IslemID 		INT AUTO_INCREMENT PRIMARY KEY,
    KullaniciID		INT NOT NULL,
    KitapID 		INT NOT NULL,
    AlisTarihi 		TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP), -- Tarih için DEFAULT
    IadeTarihi 		DATE,
    GecikmeCezasi 	DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE,
    FOREIGN KEY (KitapID) REFERENCES Kitaplar(KitapID) ON DELETE CASCADE,
    CHECK (IadeTarihi IS NULL OR IadeTarihi >= AlisTarihi) -- Tarihler arasında tutarlılık
);


DELIMITER $$
CREATE PROCEDURE KullaniciEkle (
    IN p_AdSoyad VARCHAR(100), 
    IN p_TelefonNumarasi VARCHAR(15), 
    IN p_Eposta VARCHAR(100)
)
BEGIN
    INSERT INTO Kullanicilar (AdSoyad, TelefonNumarasi, Eposta)
    VALUES (p_AdSoyad, p_TelefonNumarasi, p_Eposta);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE KitapEkle (
    IN p_KitapAdi VARCHAR(200), 
    IN p_Yazar VARCHAR(100), 
    IN p_KategoriID INT, 
    IN p_YayinTarihi DATE, 
    IN p_StokDurumu INT
)
BEGIN
    INSERT INTO Kitaplar (KitapAdi, Yazar, KategoriID, YayinTarihi, StokDurumu)
    VALUES (p_KitapAdi, p_Yazar, p_KategoriID, p_YayinTarihi, p_StokDurumu);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE OduncAlmaEkle (
    IN p_KullaniciID INT, 
    IN p_KitapID INT, 
    IN p_IadeTarihi DATE
)
BEGIN
    INSERT INTO OduncAlma (KullaniciID, KitapID, IadeTarihi)
    VALUES (p_KullaniciID, p_KitapID, p_IadeTarihi);
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE StokGuncelle (
    IN p_KitapID INT, 
    IN p_StokDurumu INT
)
BEGIN
    UPDATE Kitaplar
    SET StokDurumu = p_StokDurumu
    WHERE KitapID = p_KitapID;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE KullaniciGuncelle (
    IN p_KullaniciID INT, 
    IN p_AdSoyad VARCHAR(100), 
    IN p_TelefonNumarasi VARCHAR(15), 
    IN p_Eposta VARCHAR(100)
)
BEGIN
    UPDATE Kullanicilar
    SET AdSoyad = p_AdSoyad, TelefonNumarasi = p_TelefonNumarasi, Eposta = p_Eposta
    WHERE KullaniciID = p_KullaniciID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE KullaniciSil (
    IN p_KullaniciID INT
)
BEGIN
    DELETE FROM Kullanicilar
    WHERE KullaniciID = p_KullaniciID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE KitapSil (
    IN p_KitapID INT
)
BEGIN
    DELETE FROM Kitaplar
    WHERE KitapID = p_KitapID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE KullaniciOduncListesi (
    IN p_KullaniciID INT
)
BEGIN
    SELECT 
        o.IslemID, k.KitapAdi, o.AlisTarihi, o.IadeTarihi, o.GecikmeCezasi
    FROM 
        OduncAlma o
    JOIN 
        Kitaplar k ON o.KitapID = k.KitapID
    WHERE 
        o.KullaniciID = p_KullaniciID;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE StoktaKitaplar()
BEGIN
    SELECT * FROM Kitaplar WHERE StokDurumu > 0;
END$$
DELIMITER ;


DELIMITER $$
CREATE FUNCTION GecikmeHesapla (
    p_IadeTarihi DATE
)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE gecikmeGun INT;
    DECLARE ceza DECIMAL(10, 2);

    SET gecikmeGun = DATEDIFF(CURRENT_DATE, p_IadeTarihi);
    IF gecikmeGun > 0 THEN
        SET ceza = gecikmeGun * 1.50; -- Günlük ceza: 1.50 TL
    ELSE
        SET ceza = 0.00;
    END IF;

    RETURN ceza;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER StokAzalt
AFTER INSERT ON OduncAlma
FOR EACH ROW
BEGIN
    UPDATE Kitaplar
    SET StokDurumu = StokDurumu - 1
    WHERE KitapID = NEW.KitapID;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER StokArtir
AFTER UPDATE ON OduncAlma
FOR EACH ROW
BEGIN
    IF NEW.IadeTarihi IS NOT NULL THEN
        UPDATE Kitaplar
        SET StokDurumu = StokDurumu + 1
        WHERE KitapID = NEW.KitapID;
    END IF;
END$$
DELIMITER ;




