<style type="text/css">
  .table td, .jsgrid .jsgrid-table td, .table th, .jsgrid .jsgrid-table th {
    padding: 10px;
  }
</style>
<div class="main-panel">
  <div class="row">
    <div class="col-md-4 d-flex align-items-stretch grid-margin">
      <div class="row flex-grow">
        <!-- <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title"><i class="fa fa-download"></i>&nbsp&nbsp Download Data</h4>
              <p class="card-description">Pilih laporan dalam bentuk<code>.pdf</code> atau <code>.excel</code></p>
              <div class="template-demo">
                <button type="button" class="btn btn-info btn-block">Download Pdf</button>
                <button type="button" class="btn btn-success btn-block">Download Excel</button>
              </div>
            </div>
          </div>
        </div> -->
        <div class="col-12 stretch-card" style="padding-top: 5px;">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title"><i class="fa fa-plus"></i>&nbsp&nbsp Tambah Data</h4>
              <form action="<?php echo base_url(). 'user/add_aksi'; ?>" method="post" enctype="multipart/form-data">
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Username</label>
                  <div class="col-md-12">
                  <input id="username" name="username" type="text" placeholder="admin" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Password</label>
                  <div class="col-md-12">
                    <input id="password" name="password" type="text" placeholder="******" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Fullname</label>
                  <div class="col-md-12">
                    <input id="fullname" name="fullname" type="text" placeholder="Agung Jaya"  class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Aktif</label>
                  <div class="col-md-12">
                    <select class="form-control" name="is_active" id="is_active" style="font-size: 12px;" required>
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk" for="name">Foto User</label>
                  <div class="col-md-12">
                    <img style="width:100%;height:100%" id="blah" src="<?php echo base_url().'img/' ?>No-image-found.jpg" alt="your image" /><br><br>
                    <span class="input-group-btn">
                      <span class="btn btn-default btn-file" style="width: 210px;">
                        Browse… <input type="file" id="imgInp" name="foto" style="width: 200px;" required>
                      </span>
                    </span>
                  </div>
                </div><br>
                <button type="submit" class="btn btn-small btn-success"><i class="btn-icon-only icon-plus"> </i>Simpan</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-8 grid-margin stretch-card">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title"><i class="fa fa-list-alt"></i>&nbsp;&nbsp;Data User</h4>
          <form action="<?=base_url()?>user/cari" method="get" style="padding: 10px;margin-bottom: 0px;">
            <div class="row">
              <div class="col-md-4">
                <input id="search_nama" name="key" type="text" placeholder="Nama <?php echo $this->uri->segment(1) ?>" class="form-control">
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <button type="submit" class="btn btn-small btn-success"><i class="btn-icon-only icon-search"> </i>Cari</button>
                </div>
              </div>
            </div>
          </form>
          <p class="card-description">Jumlah data keseluruhan <?php echo $this->Muser->count_data() ?> Record</p>
          <?php echo $this->session->flashdata('pesan');?>
          <div id="js-grid-static" class="jsgrid" style="position: relative; height: 500px; width: 100%;">
            <!-- <div class="jsgrid-grid-header jsgrid-header-scrollbar"> -->
            <table class="jsgrid-table">
              <tr class="jsgrid-header-row">
                <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 50px;">No</th>
                <th class="jsgrid-header-cell jsgrid-align-right jsgrid-header-sortable" style="width: 100px;">Username</th>
                <th class="jsgrid-header-cell jsgrid-align-center jsgrid-header-sortable" style="width: 100px;">Password</th>
                <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;">Aktif</th>
                <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;">Last Login</th>
                <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;"></th>
              </tr>
            </table>
            <!-- </div> -->
            <!-- <div class="jsgrid-grid-body" style="height: 396.625px;"> -->
            <table class="jsgrid-table">
              <tbody>
                <?php
                if(empty($datauser)){ ?>
                <tr>
                  <td>Data tidak ditemukan</td>
                </tr>
                <?php }else{
                if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                  $no=1;
                }else{$no=$jlhpage;}
                foreach ($datauser as $user) {
                  if ($user->is_active == 'on'){
                    $is_active = "<span class='label label-success'>Aktif</span>";
                  }else{
                    $is_active = "<span class='label label-danger'>Nonaktif</span>";
                  }
                  if ($user->id_user == $this->session->userdata('id_user')){
                    $user->password = $user->password;
                  }else{
                    $user->password = "*********";
                  }
                  ?>
                  <tr class="jsgrid-row">
                    <td class="jsgrid-cell" style="width: 50px;"><?php echo $no++ ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo $user->username; ?></td>
                    <td class="jsgrid-cell" style="width: 100px;"><?php echo $user->password; ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo $is_active; ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo $user->last_login; ?></td>
                    <td class="jsgrid-cell" style="width: 100px;">
                      <?php if ($user->id_user == $this->session->userdata('id_user')){ ?>
                      <button type="button" class="btn btn-icons btn-inverse-warning" data-toggle="modal" href="#myModal<?=$user->id_user?>" title="ubah"><i class="mdi mdi-pencil"></i></button>
                      <?php }else{ ?>
                      <button type="button" class="btn btn-icons btn-inverse-warning" disabled><i class="mdi mdi-pencil"></i></button>
                      <?php } ?>
                      <button type="button" class="btn btn-icons btn-inverse-danger" data-toggle="modal" href="#modalDelete<?=$user->id_user?>" title="hapus"><i class="mdi mdi-delete"></i></button>
                      <div class="modal hide" id="modalDelete<?=$user->id_user?>">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="exampleModalLabel-3">Hapus Data <?php echo $user->fullname ?></h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                              </button>
                            </div>
                            <form action="<?=base_url()?>user/delete/<?=$user->id_user?>" method="post">
                              <div class="modal-body">
                                <p>Apakah yakin akan menghapus data ini ?</p>
                              </div>
                              <div class="modal-footer">
                                <button type="submit" class="btn btn-success">Submit</button>
                                <button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <div class="modal hide" id="myModal<?=$user->id_user?>">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header" style="padding: 12px;">
                          <h5 class="modal-title" id="exampleModalLabel-2">Informasi Rinci</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                          </button>
                        </div>
                        <form action="<?php echo base_url(). 'user/update_aksi'; ?>" method="post" enctype="multipart/form-data">
                          <div class="form-group">
                          <label class="col-md-4 control-label label-produk">Username</label>
                            <div class="col-md-12">
                              <input id="pop_id_user" name="pop_id_user" type="hidden" value="<?php echo $user->id_user ?>" readonly>
                              <input id="pop_username" name="pop_username" type="text" value="<?php echo $user->username ?>" class="form-control">
                            </div>
                          </div>
                          <div class="form-group">
                            <label class="col-md-4 control-label label-produk">Password</label>
                            <div class="col-md-12">
                              <input id="pop_password" name="pop_password" type="text" value="<?php echo $user->password ?>" class="form-control">
                            </div>
                          </div>
                          <div class="form-group">
                            <label class="col-md-4 control-label label-produk">Fullname</label>
                            <div class="col-md-12">
                              <input id="pop_fullname" name="pop_fullname" type="text" value="<?php echo $user->fullname ?>"  class="form-control">
                            </div>
                          </div>
                          <div class="form-group">
                            <label class="col-md-4 control-label label-produk">Aktif</label>
                            <div class="col-md-12">
                            <select class="form-control" name="pop_is_active" id="pop_is_active" style="font-size: 12px;">
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                              </select>
                            </div>
                          </div>
                          <div class="form-group">
                            <label class="col-md-4 control-label label-produk">Foto User</label>
                            <div class="col-md-12">
                              <?php if ($user->foto != '-'){ ?>
                              <img style="width:100px;" id="blah" src="<?php echo base_url().'img/'.$user->foto ?>" alt="your image" /><br><br>
                              <?php }else{ ?>
                              <img style="width:100px;" id="blah" src="<?php echo base_url().'img/' ?>No-image-found.jpg" alt="your image" /><br><br>
                              <?php } ?>
                              <span class="input-group-btn">
                                <span class="btn btn-default btn-file" style="width: 90%;">
                                  Browse… <input type="file" id="imgInp" name="pop_foto" style="width: 100%;">
                                </span>
                              </span>
                            </div>
                          </div><br>
                          <div class="modal-footer">
                            <button type="submit" class="btn btn-primary">Simpan</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <?php }} ?>
                </tbody>
              </table>
              <!-- </div> -->
              <div class="jsgrid-pager-container">
                <div class="jsgrid-pager">Pages: 
                  <?php echo $this->pagination->create_links(); ?>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script type="text/javascript">
   function printChart(){

    var myParameters = window.location.search;// Get the parameters from the current page

    var URL = "user/cetak_view";

    var W = window.open(URL);

    W.window.print(); // Is this the right syntax ? This prints a blank page and not the above URL
  }
</script>    