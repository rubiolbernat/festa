<?php
require ('mailstemplates.php');

if (is_logged_in()) {
  header('Location: index.php');
}
require_once ('files/header.php');

if (isset($_POST['email'])) {
  $email = $_POST['email'];
  $token = bin2hex(random_bytes(16));
  $token_hash = hash("sha256", $token);
  $expiry = date("Y-m-d H:i:s", time() + 60 * 30);//30 min duration

  $data = array(
    "reset_token_hash" => $token_hash,
    "reset_token_expires_at" => $expiry,
  );
  $where_clause = "email = '" . $email . "'";
  db_update('rb_users', $data, $where_clause);

  //SEND MAIL

  $to = $email;
  $subject = trans('Recover Password');
  $any = date("Y"); // Obté l'any actual

  $message = getEmailPasswordRecovery($token, $any);

  // Sempre estableix el tipus de contingut quan enviïs un correu HTML
  $headers = "MIME-Version: 1.0" . "\r\n";
  $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

  // Més capçaleres
  $headers .= 'From: <password-recovery@soundersrent.com>' . "\r\n";

  if (mail($to, $subject, $message, $headers)) {
    //echo "The email has been sent successfully!";
  } else {
   // echo "Email did not leave correctly!";
  }

  unset($_POST);
}



?>

<?php if (!isset($expiry)) { ?>
  <!-- PASSWORD RECOVERY -->
  <div class="container py-4 py-lg-5 my-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card border-0 shadow">
          <div class="card-body">
            <h2 class="h4 mb-1"><?= trans('Recover Password') ?></h2>
            <div class="py-3"><!--ESPAI--></div>
            <form class="needs-validation" action="" method="post" novalidate>
              <label class="form-label" for="rec-mail"><?= trans('Please enter your email address') ?></label>
              <div class="input-group mb-3">
                <i class="ci-mail position-absolute top-50 translate-middle-y text-muted fs-base ms-3"></i>
                <input name="email" class="form-control rounded-start" id="rec-mail" type="email" placeholder="Email"
                  required>
              </div>
              <hr class="mt-4">
              <div class="text-end pt-4">
                <button class="btn btn-primary" type="submit"><?= trans('Send Recovery Link') ?></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
<?php } else { ?>
  <!-- PASSWORD RECOVERY MESSAGE -->
  <div class="container py-4 py-lg-5 my-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card border-0 shadow">
          <div class="card-body">
            <h2 class="h4 mb-1"><?= trans('Recover Password') ?></h2>
            <div class="py-3"><!--ESPAI--></div>
            <label class="form-label"
              for="rec-mail"><?= trans('We have sent an email to your email to change your password') ?></label>
            <div class="input-group mb-3">
              <i class="ci-mail position-absolute top-50 translate-middle-y text-muted fs-base ms-3"></i>
              <input name="email" class="form-control rounded-start" id="rec-mail" type="email"
                value="<?= htmlspecialchars($email); ?>" readonly>
            </div>
            <hr class="mt-4">
          </div>
        </div>
      </div>
    </div>
  </div>
<?php } ?>

<?php
require_once ('files/footer.php');
?>
