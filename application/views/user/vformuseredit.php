<!-- <nav class="blue lighten-1">
  <div class="nav-wrapper">
    <a href="#" class="brand-logo">PETUGAS</a>
  </div>
</nav> -->
<div class="container">
  <div class="row">
    <form class="col s12">
      <div class="row">
        <div class="input-field col s12" style="background: url('https://bcn.test/pdam_android/img/user-bg.png');padding: 10px;">
          <center><img class="circle" src="<?php echo base_url(); ?>img/<?php echo $this->session->userdata('foto'); ?>" style="border: 1px solid #ffffff1f;"><center>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <input readonly id="username" type="text" class="validate" value="<?php echo $this->session->userdata('username'); ?>">
          <label for="username">Username</label>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <input readonly id="fullname" type="text" class="validate" value="<?php echo $this->session->userdata('fullname'); ?>">
          <label for="fullname">Nama Lengkap</label>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <input readonly id="last_login" type="text" class="validate" value="<?php echo $this->session->userdata('last_login'); ?>">
          <label for="last_login">Terakhir login</label>
        </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
          <a class="waves-effect waves-light btn" href="<?php echo base_url(); ?>login/logout">Logout</a>
        </div>
      </div>
    </form>
  </div>
</div>
