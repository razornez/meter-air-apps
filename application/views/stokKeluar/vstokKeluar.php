<style type="text/css">
.fc-day-grid-event .fc-time {
  font-weight: 700;
  display: none;
}
</style>
<div class="main-panel">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <button class="btn btn-primary btn-block" data-toggle="modal" href="#myModalC"><i class="mdi mdi-plus"></i> Tambah Barang Keluar</button>
                <div class="wrapper mt-4">
                  <p>Barang dengan stok paling sedikit</p>
                  <?php $prefix = ''; foreach ($data_lowstok as $data) { ?>
                    <div class="item-wrapper d-flex pb-4 border-bottom">
                      <div class="status-wrapper d-flex align-items-start pr-3">
                        <span class="bg-success rounded-circle p-1 mt-2 mx-auto"></span>
                      </div>
                      <div class="text-wrapper">
                        <h6 class="d-block mb-1"><?php echo $data->produk ?></h6>
                        <small class="text-gray d-block">Stok : <?php echo $data->stok.' '.$data->satuan ?></small>
                      </div>
                    </div>

                    <div class="modal hide" id="myModalC">
                      <div class="modal-dialog" role="document">
                        <div class="modal-content">
                          <div class="modal-header" style="padding: 12px;">
                            <h5 class="modal-title" id="exampleModalLabel-2">Tambah Barang Keluar</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">×</span>
                            </button>
                          </div>
                          <form action="<?php echo base_url(). 'stokKeluar/add_aksi'; ?>" method="post" enctype="multipart/form-data">
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Tanggal Keluar</label>
                              <div class="col-md-12">
                                <input id="popc_tanggal" name="popc_tanggal" type="date" value="<?php echo date('Y-m-d') ?>" class="form-control"style="width: 100%;">
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-12 control-label label-produk">Nama Produk <code style="float:right"><a href="<?php echo base_url().'produk' ?>">tambah data produk</a></code></label>
                              <div class="col-md-12">
                                <select class="js-example-basic-single" id="popc_produk" name="popc_produk" style="width:100%">
                                  <?php foreach ($dataproduk as $produk) { ?>
                                    <option value="<?php echo $produk->barcode.','.$produk->harga ?>"><?php echo $produk->produk.' / Rp.'.number_format($produk->harga).' / Stok '.$produk->stok.' '.$produk->satuan ?></option>
                                  <?php } ?>
                                </select>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-12 control-label label-produk">Jumlah Keluar (Kilo/Batang/dll)</label>
                              <div class="col-md-12">
                                <input id="popc_jumlah" name="popc_jumlah" type="number" placeholder="15" value="1" class="form-control" maxlength="15" style="width: 100%;">
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Keterangan</label>
                              <div class="col-md-12">
                                <select class="js-example-basic-single" id="popc_keterangan" name="popc_keterangan" style="width:100%" onchange="showKeterangan()">
                                  <option value="Hilang">Hilang</option>
                                  <option value="Rusak">Rusak</option>
                                  <option value="Kadaluarsa">Kadaluarsa</option>
                                  <option value="Lain">Lain-lain</option>
                                </select>
                              </div>
                            </div>
                            <div class="form-group ketLain" style="display:none;">
                              <label class="col-md-4 control-label label-produk">Tuliskan Keterangan</label>
                              <div class="col-md-12">
                                <input id="popc_keterangan_lain" name="popc_keterangan_lain" type="text" class="form-control" maxlength="15" style="width: 100%;">
                              </div>
                            </div>
                            <div class="modal-footer">
                              <button type="submit" class="btn btn-primary">Simpan Data</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                  <?php } ?>
                </div>
                <div class="wrapper">
                  <div class="wrapper d-flex justify-content-between align-items-center mb-4">
                    <div class="d-flex align-items-center">
                      <small class="font-weight-bold mr-2 mb-0">Data Stok Keluar</small>
                      <div class="badge badge-inverse-primary badge-pill">Total data <?php echo $this->MstokKeluar->count_data() ?></div>
                    </div>
                    <span class="text-gray"><i class="mdi mdi-dots-horizontal"></i></span>
                  </div>
                  <?php echo $this->session->flashdata('pesan');?>
                  <div class="calendar-aside">
                    <?php 
                    if(empty($datastokKeluar)){ ?>
                      <tr>
                        <td>Data tidak ditemukan</td>
                      </tr>
                    <?php }else{
                    if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                      $no=1;
                    }else{$no=$jlhpage;}
                    foreach ($datastokKeluar as $data) { ?>
                      <div class="list">
                       <?php if ($data->foto_produk != '-'){ ?>
                        <img class="img-xs rounded-circle" src="<?php echo base_url('img/produk/').$data->foto_produk; ?>" alt="foto produk" title="<?php echo $data->produk ?>">
                      <?php }else{ ?>
                        <img class="img-xs rounded-circle" src="<?php echo base_url().'img/' ?>No-image-found.jpg" alt="foto produk" title="<?php echo $data->produk ?>">
                        <?php } ?></center>
                        <span class="user-text"><?php echo $data->tgl_masuk ?>&nbsp;&nbsp;
                          <div class="badge badge-inverse-primary badge-pill">-<?php echo $data->keluar.' '.$data->satuan ?></div>
                        </span>
                        <span class="ml-auto">
                          <button type="button" class="btn btn-light btn-sm" data-toggle="modal" href="#myModal<?=$data->id_stokKeluar?>" title="ubah"><i class="icon-zoom-in" title="lihat"></i></button>

                          <div class="modal hide" id="myModal<?=$data->id_stokKeluar?>">
                            <div class="modal-dialog" role="document">
                              <div class="modal-content">
                                <div class="modal-header" style="padding: 12px;">
                                  <h5 class="modal-title" id="exampleModalLabel-2">Informasi Rinci</h5>
                                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                  </button>
                                </div>
                                <form action="<?php echo base_url(). 'stokKeluar/update_aksi'; ?>" method="post" enctype="multipart/form-data">
                                  <div class="form-group">
                                    <div class="col-md-12"><center>
                                      <?php if ($data->foto_produk != '-'){ ?>
                                        <img style="width:100px;border: 1px solid #d4d4d4;border-radius: 100px;" id="blah" src="<?php echo base_url().'img/produk/'.$data->foto_produk ?>" alt="foto" /><br><br>
                                      <?php }else{ ?>
                                        <img style="width:100px;border: 1px solid #d4d4d4;border-radius: 100px;" id="blah" src="<?php echo base_url().'img/' ?>No-image-found.jpg" alt="foto" /><br><br>
                                        <?php } ?></center>
                                      </div>
                                    </div>
                                    <div class="form-group">
                                      <label class="col-md-4 control-label label-produk">Tanggal Masuk</label>
                                      <div class="col-md-12">
                                        <input id="pop_id_stok_keluar" name="pop_id_stok_keluar" type="hidden" value="<?php echo $data->id_stokKeluar ?>">
                                        <input id="pop_tanggal" name="pop_tanggal" type="text" class="form-control"style="width: 100%;" value="<?php echo $data->tgl_masuk ?>" readonly>
                                      </div>
                                    </div>
                                    <div class="form-group">
                                      <label class="col-md-4 control-label label-produk">Nama Produk</label>
                                      <div class="col-md-12">
                                        <input id="pop_produk" name="pop_produk" type="text" value="<?php echo $data->produk.' / Rp.'.number_format($data->harga).' / Stok '.$data->stok ?>" class="form-control" style="width: 100%;" readonly>
                                      </div>
                                    </div>
                                    <div class="form-group">
                                      <label class="col-md-4 control-label label-produk">Jumlah Keluar (<?php echo $data->satuan ?>)</label>
                                      <div class="col-md-12">
                                        <input id="pop_jumlah" name="pop_jumlah" type="number" placeholder="15" value="<?php echo $data->jumlah ?>" class="form-control" maxlength="15" style="width: 100%;" readonly>
                                      </div>
                                    </div>
                                    <div class="form-group ketLain" style="display:block;">
                                      <label class="col-md-4 control-label label-produk">Keterangan</label>
                                      <div class="col-md-12">
                                        <input id="pop_keterangan_lain" name="pop_keterangan_lain" value="<?php echo $data->keterangan ?>" type="text" class="form-control" maxlength="15" style="width: 100%;" readonly>
                                      </div>
                                    </div>
                                    <div class="modal-footer">
                                      <button type="button" class="btn btn-primary" data-dismiss="modal" aria-label="Close">Close</button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>

                            <button type="button" class="btn btn-light btn-sm" data-toggle="modal" href="#modalDelete<?=$data->id_stokKeluar?>" title="hapus"><i class="fa fa-trash" title="hapus"></i></button>

                            <div class="modal hide" id="modalDelete<?=$data->id_stokKeluar?>">
                              <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel-3">Hapus Data <?php echo $data->produk ?></h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                      <span aria-hidden="true">×</span>
                                    </button>
                                  </div>
                                  <form action="<?=base_url()?>stokKeluar/delete/<?=$data->id_stokKeluar?>" method="post">
                                    <div class="modal-body">
                                      <p>Apakah yakin akan menghapus data ini ?</p>
                                      <input id="list_barcode" name="list_barcode" type="hidden" value="<?php echo $data->barcode ?>">
                                      <input id="list_stokKeluar" name="list_stokKeluar" type="hidden" value="<?php echo $data->keluar ?>">
                                    </div>
                                    <div class="modal-footer">
                                      <button type="submit" class="btn btn-success">Submit</button>
                                      <button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </span>
                        </div>
                      <?php }} ?>
                    </div>
                    <div class="jsgrid-pager-container">
                      <div class="jsgrid-pager">
                        <?php echo $this->pagination->create_links(); ?>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-8">
                  <div id="calendar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script type="text/javascript">
      function showKeterangan(){
        var lain = document.getElementById('popc_keterangan').value;
        if (lain == 'Lain'){
          $('.ketLain').show();
        }else{
          $('.ketLain').hide();
        }
      }
    </script>
    <script type="text/javascript">
      (function($) {
        'use strict';
        $(function() {
          var style = getComputedStyle(document.body);
          if ($('#calendar').length) {
            $('#calendar').fullCalendar({
              header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,basicDay'
              },
              defaultDate: Date.now(),
          navLinks: true, // can click day/week names to navigate views
          editable: true,
          eventLimit: true, // allow "more" link when too many events
          events: [
          <?php 
          foreach ( $data_nolimit as $row ) {
            echo $prefix . " {\n";
            echo '  "title": "' .$row->produk.' | '.$row->keterangan.' | Jumlah keluar '.$row->jumlah. '",' . "\n";
            //echo '  "url": "' .$row->keterangan. '",' . "\n";
            echo '  "start": "' .$row->tgl_masuk. '"' . "\n";
            echo " }";
            $prefix = ",\n";
          }
          ?>

          ]
        })
          }
        });
      })(jQuery);
    </script>