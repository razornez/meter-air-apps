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
              <form action="<?php echo base_url(). 'customer/add_aksi'; ?>" method="post" enctype="multipart/form-data">
                <div class="form-group">
                  <label class="col-md-4 control-label label">Nama</label>
                  <div class="col-md-12">
                    <input id="nama" name="nama" type="text" placeholder="Asep Rahmat" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label">Alamat</label>
                  <div class="col-md-12">
                    <input id="alamat" name="alamat" type="text" placeholder="Jl. Bojong Soang Bandung" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label">Kota</label>
                  <div class="col-md-12">
                    <input id="kota" name="kota" type="text" placeholder="Bandung" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label">Tipe</label>
                  <div class="col-md-12">
                    <input id="tipe" name="tipe" type="text" placeholder="Pelanggan" class="form-control" required >
                  </div>
                </div>
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
          <h4 class="card-title"><i class="fa fa-list-alt"></i>&nbsp&nbspData customer</h4>
          <form action="<?=base_url()?>customer/cari" method="get" style="padding: 10px;margin-bottom: 0px;">
            <div class="row">
              <div class="col-md-4">
                <input id="search_nama" name="search_nama" type="text" placeholder="Nama <?php echo $this->uri->segment(1) ?>" class="form-control">
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <button type="submit" class="btn btn-small btn-success"><i class="btn-icon-only icon-search"> </i>Cari</button>
                </div>
              </div>
            </div>
          </form>
          <p class="card-description">Jumlah data keseluruhan <?php echo $this->Mcustomer->count_data() ?> Record</p>
          <?php echo $this->session->flashdata('pesan');?>
          <div id="js-grid-static" class="jsgrid" style="position: relative; height: 500px; width: 100%;">
            <!-- <div class="jsgrid-grid-header jsgrid-header-scrollbar"> -->
              <table class="jsgrid-table">
                <tr class="jsgrid-header-row">
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 50px;">No</th>
                  <th class="jsgrid-header-cell jsgrid-align-right jsgrid-header-sortable" style="width: 100px;">Nama</th>
                  <th class="jsgrid-header-cell jsgrid-align-center jsgrid-header-sortable" style="width: 150px;">Alamat</th>
                  <th class="jsgrid-header-cell jsgrid-align-center jsgrid-header-sortable" style="width: 100px;">Tipe</th>
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;"></th>
                </tr>
              </table>
            <!-- </div> -->
            <!-- <div class="jsgrid-grid-body" style="height: 396.625px;"> -->
              <table class="jsgrid-table">
                <tbody>
                  <?php
                  if(empty($datacustomer)){ ?>
                  <tr>
                    <td>Data tidak ditemukan</td>
                  </tr>
                  <?php }else{
                if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                  $no=1;
                }else{$no=$jlhpage;}
                foreach ($datacustomer as $data) { ?>
                  <tr class="jsgrid-row">
                    <td class="jsgrid-cell" style="width: 50px;"><?php echo $no++ ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo $data->nama ?></td>
                    <td class="jsgrid-cell" style="width: 150px;"><?php echo $data->alamat ?></td>
                    <td class="jsgrid-cell" style="width: 100px;"><?php echo $data->tipe ?></td>
                    <td class="jsgrid-cell" style="width: 100px;">
                      <button type="button" class="btn btn-icons btn-inverse-warning" data-toggle="modal" href="#myModal<?=$data->id?>" title="ubah"><i class="mdi mdi-pencil"></i></button>
                      <button type="button" class="btn btn-icons btn-inverse-danger" data-toggle="modal" href="#modalDelete<?=$data->id?>" title="hapus"><i class="mdi mdi-delete"></i></button>

                      <div class="modal hide" id="modalDelete<?=$data->id ?>">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="exampleModalLabel-3">Hapus Data <?php echo $data->nama ?></h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                              </button>
                            </div>
                            <form action="<?=base_url()?>customer/delete/<?=$data->id?>" method="post">
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

                  <div class="modal hide" id="myModal<?=$data->id?>">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header" style="padding: 12px;">
                          <h5 class="modal-title" id="exampleModalLabel-2">Informasi Rinci</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                          </button>
                        </div>
                          <form action="<?php echo base_url(). 'customer/update_aksi'; ?>" method="post" enctype="multipart/form-data">
                            <div class="form-group">
                              <label class="col-md-4 control-label label">Nama</label>
                              <div class="col-md-12">
                              <input id="id_customer" name="id_customer" type="hidden" value="<?php echo $data->id ?>">
                              <input id="pop_nama" name="pop_nama" type="text" value="<?php echo $data->nama ?>" placeholder="Kayu" class="form-control" required>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label">Alamat</label>
                              <div class="col-md-12">
                                <input id="pop_alamat" name="pop_alamat" type="text" value="<?php echo $data->alamat ?>" placeholder="Jl. Bojong Soang" class="form-control" required>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label">Kota</label>
                              <div class="col-md-12">
                              <input id="pop_kota" name="pop_kota" type="text" value="<?php echo $data->kota ?>" placeholder="Bandung" class="form-control" required>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label">Tipe</label>
                              <div class="col-md-12">
                              <input id="pop_tipe" name="pop_tipe" type="text" value="<?php echo $data->tipe ?>" placeholder="Kayu" class="form-control" required>
                              </div>
                            </div>
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