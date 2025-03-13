<?php
require ('files/functions.php');

if (is_logged_in()) {
    header('Location: index.php');
}
require_once ('files/header.php');

$message = '';

if (isset($_GET['token'])) {
    $hastoken = true;

    $token = $_GET['token'];
    $token_hash = hash("sha256", $token);

    // Utilitza la funció de escapament personalitzada
    $escaped_token_hash = escape_string($token_hash);

    // Afegeix cometes simples al voltant del valor escapçat
    $user = db_select('rb_users', "reset_token_hash = '$escaped_token_hash'");

    // Comprova si no s'ha trobat cap usuari
    if (!$user) {
        $message = trans('Token not found');
    }

    // Comprova si el token ha expirat
    if (strtotime($user[0]['reset_token_expires_at']) <= time()) {
        if (empty($message)) {
            $message = trans('Token Expired');
        } else {
            $message = $message . ' ' . trans('or') . ' ' . trans('Token Expired');
        }
    }
    unset($_GET);
} else {
    $hastoken = false;
}
// Comprova si el formulari s'ha enviat
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Processa les dades del formulari

    $password = $_POST["password"];
    $confirm_password = $_POST["confirm_password"];

    // Aquí pots validar les dades abans de guardar-les o fer-ne alguna altra operació
// Per exemple, pots verificar si les contrasenyes coincideixen
    if ($password !== $confirm_password) {
        // Les contrasenyes no coincideixen, pots fer alguna cosa com mostrar un missatge d'error
        alert('danger', trans('Passwords do not match!'));
    } else {
        // Les contrasenyes coincideixen, pots actualitzar les dades de l'usuari, guardar-les a la base de dades, etc.
// Aquí podràs afegir el codi necessari per a guardar o actualitzar les dades a la base de dades o a $_SESSION
// Actualitza la contrasenya només si s'ha proporcionat una nova contrasenya
        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $data['password'] = $hashed_password;
            $where_clause = "email = '" . $user[0]['email'] . "'";
            db_update('rb_users', $data, $where_clause);
        }
        $message = 'Password Changed';
        $hastoken = false;

    }
    //actualitzar dades a la BD
    unset($_POST);
}
?>

<?php if ($hastoken && empty($message)) { ?>
    <!-- PASSWORD RECOVERY -->
    <div class="container py-4 py-lg-5 my-4">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card border-0 shadow">
                    <div class="card-body">
                        <h2 class="h4 mb-1"><?= trans('Recover Password') ?></h2>
                        <div class="py-3"><!--ESPAI--></div>
                        <form method="post" action="" class="needs-validation" novalidate>
                            <input class="form-control" type="hidden" type="email" id="account-email"
                                value="<?= $user[0]['email'] ?>" disabled>
                            <div class="col-sm-12">
                                <label class="form-label" for="reg-password"><?= trans('Password') ?></label>
                                <input class="form-control" name="password" type="password" required id="reg-password">
                                <div class="invalid-feedback"><?= trans('Please enter password!') ?></div>
                            </div>
                            <div class="col-sm-12">
                                <label class="form-label"
                                    for="reg-password-confirm"><?= trans('Confirm Password') ?></label>
                                <input class="form-control" name="confirm_password" type="password" required
                                    id="reg-password-confirm">
                                <div class="invalid-feedback"><?= trans('Passwords do not match!') ?></div>
                            </div>
                            <hr class="mt-4">
                            <br>
                            <div class="col-12 text-end">
                                <button class="btn btn-primary" type="submit"><i
                                        class="ci-user me-2 ms-n1"></i><?= trans('Change Password') ?></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php } else { ?>
    <!-- MESSAGE -->
    <div class="container py-4 py-lg-5 my-4">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card border-0 shadow">
                    <div class="card-body">
                        <h2 class="h4 mb-1"><?= $message ?></h2>
                        <div class="py-3"><!--ESPAI--></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php } ?>

<?php
require_once ('files/footer.php');
?>
