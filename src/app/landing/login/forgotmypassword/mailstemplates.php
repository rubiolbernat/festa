<?php
require('files/functions.php');

function sendEmail($email, $from, $message, $subject)
{
    $to = $email;

    // Sempre estableix el tipus de contingut quan enviïs un correu HTML
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

    // Més capçaleres
    $headers .= 'From: ' . htmlspecialchars($from) . ' <no-reply@fades.com>' . "\r\n";

    if (mail($to, $subject, $message, $headers)) {
        //echo "El correu electrònic s'ha enviat correctament!";
    } else {
        //echo "Error: No s'ha pogut enviar el correu electrònic.";
    }
}

function getEmailWelcomeFades($nomUsuari, $any)
{
    return '
    <!DOCTYPE html>
    <html lang="ca">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Benvingut a Fades</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header img {
                width: 150px;
                margin-bottom: 15px;
            }
            .content {
                text-align: left;
                color: #333;
            }
            .content h1 {
                color: #8e44ad;
                font-size: 28px;
            }
            .content p {
                line-height: 1.6;
                color: #555;
                font-size: 16px;
            }
            .button {
                display: inline-block;
                background-color: #8e44ad;
                color: #ffffff;
                padding: 12px 25px;
                margin-top: 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #888;
                font-size: 14px;
            }
            .footer a {
                color: #8e44ad;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://fades.cat/img/logo-fades.png" alt="Logo Fades.cat">
            </div>
            <div class="content">
                <h1>Benvingut a Fades, ' . htmlspecialchars($nomUsuari) . '!</h1>
                <p>Estem molt contents que t\'hagi unit a nosaltres. A Fades.cat volem oferir-te una experiència única per gaudir del millor contingut i serveis.</p>
                <p>Ara que formes part de la nostra comunitat, et convidem a explorar totes les opcions que tenim per a tu. Podràs gaudir de les nostres ofertes, contingut exclusiu, i molt més.</p>
                <p>Si tens qualsevol dubte o vols saber més sobre les nostres novetats, no dubtis a posar-te en contacte amb nosaltres!</p>
                <a href="https://fades.cat" class="button">Explora Fades.cat</a>
            </div>
            <div class="footer">
                <p>&copy; ' . htmlspecialchars($any) . ' Fades.cat. Tots els drets reservats.</p>
                <p><a href="https://fades.cat/contacte">Contacta amb nosaltres</a> | <a href="https://fades.cat/legal">Política de privacitat</a></p>
            </div>
        </div>
    </body>
    </html>';
}


function getEmailPasswordRecovery($token, $year, $userName)
{
    return '<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperació de Contrasenya</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header img {
            width: 120px;
        }
        .content {
            text-align: left;
            color: #333333;
        }
        .content h1 {
            color: #8e44ad;
        }
        .content p {
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background-color: #8e44ad;
            color: #ffffff;
            font-weight: bold;
            padding: 10px 20px;
            margin-top: 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://fades.com/img/logo.png" alt="Logo de FADES">
        </div>
        <div class="content">
            <h1>Hola ' . htmlspecialchars($userName) . ',</h1>
            <p>Hem rebut una sol·licitud per restablir la teva contrasenya. Si no has sol·licitat aquest canvi, pots ignorar aquest correu.</p>
            <p>Per restablir la contrasenya, fes clic al botó següent:</p>
            <a href="https://fades.com/login-password-reset.php?token=' . urlencode($token) . '" class="button">Restableix la Contrasenya</a>
            <p>Si el botó no funciona, copia i enganxa l\'adreça següent al teu navegador:</p>
            <p><a href="https://fades.com/login-password-reset.php?token=' . urlencode($token) . '">https://fades.com/login-password-reset.php?token=' . urlencode($token) . '</a></p>
        </div>
        <div class="footer">
            <p>&copy; ' . htmlspecialchars($year) . ' FADES. Tots els drets reservats.</p>
        </div>
    </div>
</body>
</html>';
}


?>
