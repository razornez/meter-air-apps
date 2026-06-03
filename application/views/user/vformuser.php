<?php include '/../css_plus.html' ?>
  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper"> 
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>User<small>Tambah</small></h1>
      <ol class="breadcrumb">
        <li><a href="<?php echo base_url(); ?>home"><i class="fa fa-dashboard"></i> Home</a></li>
        <li><a href="<?php echo base_url(); ?>user"> User</a></li>
        <li class="active"> Tambah</li>
      </ol>
    </section>
    
    <!-- Main content -->
    <section class="content container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="chart-box">
            <h4>Tambah Data Baru</h4>
            <?=$this->session->flashdata('pesan')?>
            <form action="<?php echo base_url(). 'user/add_aksi'; ?>" method="post" enctype="multipart/form-data">
            <div class="box-body">
              <div class="form-group">
                <label>Username</label>
                <input name="username" type="text" class="form-control" id="exampleInputEmail1" placeholder="Username" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input name="password" type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" required>
              </div>
              <div class="form-group">
                <label>Fullname</label>
                <input name="fullname" type="text" class="form-control" id="exampleInputFullname" placeholder="Fullname" required>
              </div>
              <div class="form-group">
                <label for="exampleInputFile">Foto</label>
                <input name="foto" type="file" id="exampleInputFile" accept=".jpg,.png,.jpeg" required>
              </div>
              <div class="checkbox">
                <label>
                  <input name="is_active" type="checkbox" checked>&nbsp; Aktif ?
                </label>
              </div>
            </div><!-- /.box-body -->

            <div class="box-footer">
              <input type="submit" name="simpan" class="btn btn-primary" value="Simpan">
            </div>
          </form>
          </div>
        </div>
      </div>
    </section>
    <!-- content --> 
  </div>

  <script>

document.getElementById("foto").onchange = function() {
  var fileName = this.value;
  var fileExtension = fileName.substr(fileName.length - 4);

  console.log(fileExtension);
  if (fileExtension != ".jpg" && fileExtension != ".png" && fileExtension != ".jpeg" && fileExtension != ".JPG") {
    alert("Format gambar yang diizinkan (jpg,png,jpeg)!");
    $('input#foto').val("");
  }
}

function updateTextArea() {     
 var allVals = [];
 $('.form-group :checked').each(function(i) {

   allVals.push("1");
 });
 $('#is_active').val(allVals).attr('rows',allVals.length) ;

}
$(function() {
  $('.form-group input').click(updateTextArea);
  updateTextArea();
});

$(document).ready(function(){
  $('.add_data').click(function () {
    dcp = parseInt($('#user_USER_IMAGE').val()); 
          if (dcp==null) { // jika nilai textfield kosong diganti dengan 0
            dcp = 'no image';
          }
          $("#user_USER_IMAGE").val(dcp);         
        });
});
</script>   