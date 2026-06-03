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
              <form action="<?php echo base_url(). 'produk/add_aksi'; ?>" method="post" enctype="multipart/form-data">
                <!-- <div class="form-group">
                  <label class="col-md-4 control-label label-produk" for="name">Barcode</label>
                  <div class="col-md-12">
                    <input id="barcode" name="barcode" type="text" placeholder="B010118002" class="form-control" maxlength="11" >
                  </div>
                </div> -->
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Nama<br> 
                    <!-- <small style="color: #ff7474;">hindari penggunaan " (kutip dua) dalam penamaan</small> -->
                  </label>
                  <div class="col-md-12">
                    <input id="nama" name="nama" type="text" placeholder="Kayu reng" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Stok</label>
                  <div class="col-md-12">
                    <input id="stok" name="stok" type="text" placeholder="1" class="form-control numberOnly" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Satuan</label>
                  <div class="col-md-12">
                    <select class="form-control" name="satuan" id="satuan" style="font-size: 12px;" required>
                      <?php 
                      $list_satuan = $this->db->query("SELECT * FROM satuan order by nama asc")->result();
                      foreach ($list_satuan as $ls){?>
                      <option value="<?php echo $ls->id ?>"><?php echo $ls->deskripsi ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Kategori</label>
                  <div class="col-md-12">
                    <select class="form-control" name="kategori" id="kategori" style="font-size: 12px;" required>
                      <?php 
                      $list_kategori = $this->db->query("SELECT * FROM kategori order by nama asc")->result();
                      foreach ($list_kategori as $lk){?>
                      <option value="<?php echo $lk->id ?>"><?php echo $lk->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Harga Asli</label>
                  <div class="col-md-12">
                    <input id="harga" name="harga" type="text" placeholder="Rp. 100,000" class="form-control numberOnly" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk">Harga Jual</label>
                  <div class="col-md-12">
                    <input id="harga_jual" name="harga_jual" type="text" placeholder="Rp. 120,000" class="form-control numberOnly" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-12 control-label label-produk" for="name">Foto Produk</label>
                  <div class="col-md-12">
                    <img style="width:100%;height:100%" id="blah" src="<?php echo base_url().'img/' ?>No-image-found.jpg" alt="your image" /><br><br>
                    <span class="input-group-btn">
                      <span class="btn btn-default btn-file" style="width: 210px;">
                        Browse… <input type="file" id="imgInp" name="foto" style="width: 200px;">
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
          <h4 class="card-title"><i class="fa fa-list-alt"></i>&nbsp;&nbsp;Data produk</h4>
          <form action="<?=base_url()?>produk/cari" method="get" style="padding: 10px;margin-bottom: 0px;">
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
          <p class="card-description">Jumlah data keseluruhan <?php echo $this->Mproduk->count_data() ?> Record</p>
          <?php echo $this->session->flashdata('pesan');?>
          <div id="js-grid-static" class="jsgrid" style="position: relative; height: 500px; width: 100%;">
            <!-- <div class="jsgrid-grid-header jsgrid-header-scrollbar"> -->
              <table class="jsgrid-table">
                <tr class="jsgrid-header-row">
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 50px;">No</th>
                  <th class="jsgrid-header-cell jsgrid-align-right jsgrid-header-sortable" style="width: 50px;">Foto</th>
                  <th class="jsgrid-header-cell jsgrid-align-center jsgrid-header-sortable" style="width: 150px;">Nama</th>
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;">Harga</th>
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 100px;">Stok</th>
                  <th class="jsgrid-header-cell jsgrid-header-sortable" style="width: 130px;"></th>
                </tr>
              </table>
            <!-- </div> -->
            <!-- <div class="jsgrid-grid-body" style="height: 396.625px;"> -->
              <table class="jsgrid-table">
                <tbody>
                  <?php
                  if(empty($dataproduk)){ ?>
                  <tr>
                    <td>Data tidak ditemukan</td>
                  </tr>
                  <?php }else{
                if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                  $no=1;
                }else{$no=$jlhpage;}
                foreach ($dataproduk as $data) { 
                  if ($data->foto != '-'){
                    $foto_prod = 'img/produk/'.$data->foto;
                  }else{
                    $foto_prod = 'img/No-image-found.jpg';
                  }
                  ?>
                  <tr class="jsgrid-row">
                    <td class="jsgrid-cell" style="width: 50px;"><?php echo $no++ ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 50px;"><img style="width:50px;border-radius: 0px;" src="<?php echo base_url().$foto_prod ?>" /></td>
                    <td class="jsgrid-cell" style="width: 150px;"><?php echo $data->produk ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo number_format($data->harga) ?></td>
                    <td class="jsgrid-cell jsgrid-align-left" style="width: 100px;"><?php echo $data->stok == NULL ? '0'.' '.$data->satuan : $data->stok.' '.$data->satuan ?>&nbsp;
                      <!-- <a href="<?php echo base_url().'stokMasuk' ?>" title="tambah stok"><div class="badge badge-inverse-primary badge-pill">+</div></a> -->
                    </div>
                    </td>
                    <td class="jsgrid-cell" style="width: 130px;">
                      <button type="button" class="btn btn-icons btn-inverse-primary" onClick="window.open('produk/cetak_barcode?barcode=<?php echo $data->barcode ?>').window.print()" title="Cetak Barcode"><i class="fa fa-barcode"></i></button>
                      <button type="button" class="btn btn-icons btn-inverse-warning" data-toggle="modal" href="#myModal<?=$data->id_produk?>" title="ubah"><i class="mdi mdi-pencil"></i></button>
                      <button type="button" class="btn btn-icons btn-inverse-danger" data-toggle="modal" href="#modalDelete<?=$data->id_produk?>" title="hapus"><i class="mdi mdi-delete"></i></button>

                      <!-- <div class="modal hide" id="myModalStok<?=$data->id_produk?>">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header" style="padding: 12px;">
                              <h5 class="modal-title" id="exampleModalLabel-2">Tambah Stok</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                              </button>
                            </div>
                            <form action="<?php echo base_url(). 'stokMasuk/add_aksi'; ?>" method="post" enctype="multipart/form-data">
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Tanggal Masuk</label>
                                <div class="col-md-12">
                                  <input id="popc_tanggal" name="popc_tanggal" type="date" placeholder="12-12-2018" class="form-control"style="width: 100%;">
                                </div>
                              </div>
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Nama Produk</label>
                                <div class="col-md-12">
                                  <input id="popc_barcode" name="popc_barcode" type="hidden" value="<?php echo $data->barcode ?>">
                                  <select class="js-example-basic-single" id="popc_produk<?php echo $data->id_produk ?>" name="popc_produk" style="width:100%" onchange="getTotalStokMasukU()">
                                    <option value="<?php echo $data->barcode.','.$data->harga ?>"><?php echo $data->produk.' / Rp.'.number_format($data->harga).' / Stok '.$data->stok ?></option>
                                  </select>
                                </div>
                              </div>
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Jumlah Masuk (<?php echo $data->satuan ?>)</label>
                                <div class="col-md-12">
                                  <input id="popc_jumlah<?php echo $data->id_produk ?>" name="popc_jumlah" type="number" placeholder="15" value="1" class="form-control" maxlength="15" style="width: 100%;" onkeyup="getTotalStokMasukU()">
                                </div>
                              </div>
                              <div class="form-group">
                                <label class="col-md-5 control-label label-produk">Diskon dari supplier (Rp)</label>
                                <div class="col-md-12">
                                  <input id="popc_diskon<?php echo $data->id_produk ?>" name="popc_diskon" type="number" placeholder="1000" value="0" class="form-control" maxlength="15" style="width: 100%;" onkeyup="getTotalStokMasukU()">
                                </div>
                              </div>
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Total yang dibayar</label>
                                <div class="col-md-12">
                                  <input id="popc_total<?php echo $data->id_produk ?>" name="popc_total" type="text" value="0" class="form-control" maxlength="15" style="width: 100%;" onkeyup="getTotalStokMasukU()" readonly>
                                </div>
                              </div>
                              <hr>
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Supplier</label>
                                <div class="col-md-12">
                                  <select class="js-example-basic-single" id="popc_supplier" name="popc_supplier" style="width:100%">
                                    <?php foreach ($datasupplier as $supplier) { ?>
                                      <option value="<?php echo $supplier->id ?>"><?php echo $supplier->nama ?></option>
                                    <?php } ?>
                                  </select>
                                </div>
                              </div>
                              <div class="form-group">
                                <label class="col-md-4 control-label label-produk">Keterangan</label>
                                <div class="col-md-12">
                                  <select class="js-example-basic-single" id="popc_keterangan" name="popc_keterangan" style="width:100%" onchange="showKeterangan()">
                                    <option value="Penambahan Stok">Penambahan Stok</option>
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
                      </div> -->

                      <script type="text/javascript">
                        function showKeterangan(){
                          var lain = document.getElementById('popc_keterangan').value;
                          if (lain == 'Lain'){
                            $('.ketLain').show();
                          }else{
                            $('.ketLain').hide();
                          }
                        }

                        function getTotalStokMasukU(){
                          var myarr = document.getElementById('popc_produk<?php echo $data->id_produk ?>').value.split(",");
                          var hrg = myarr[1];
                          totalS = hrg * document.getElementById('popc_jumlah<?php echo $data->id_produk ?>').value - document.getElementById('popc_diskon<?php echo $data->id_produk ?>').value
                          document.getElementById('popc_total<?php echo $data->id_produk ?>').value = totalS.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                          alert(totalS);
                        }
                      </script>

                      <div class="modal hide" id="modalDelete<?=$data->id_produk?>">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="exampleModalLabel-3">Hapus Data <?php echo $data->produk ?></h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                              </button>
                            </div>
                            <form action="<?=base_url()?>produk/delete/<?=$data->id_produk?>" method="post">
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

                  <div class="modal hide" id="myModal<?=$data->id_produk?>">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header" style="padding: 12px;">
                          <h5 class="modal-title" id="exampleModalLabel-2">Informasi Rinci</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                          </button>
                        </div>
                          <form action="<?php echo base_url(). 'produk/update_aksi'; ?>" method="post" enctype="multipart/form-data">
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk" for="name">Barcode</label>
                              <div class="col-md-12">
                              <input id="id_produk" name="id_produk" type="hidden" value="<?php echo $data->id_produk ?>" readonly>
                              <input id="pop_barcode" name="pop_barcode" type="text" value="<?php echo $data->barcode ?>" class="form-control" readonly>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Nama</label>
                              <div class="col-md-12">
                                <input id="pop_nama" name="pop_nama" type="text" value="<?php echo $data->produk ?>" placeholder="Kayu jati" class="form-control" >
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-12 control-label label-produk">Stok</label>
                              <div class="col-md-12">
                              <input id="pop_stok" name="pop_stok" type="text" value="<?php echo $data->stok ?>" class="form-control numberOnly" required>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Satuan</label>
                              <div class="col-md-12">
                                <select class="form-control" name="pop_satuan" id="pop_satuan" style="font-size: 12px;">
                                  <?php 
                                  foreach ($list_satuan as $ls){?>
                                  <option value="<?php echo $ls->id ?>" <?php echo $ls->nama == $data->satuan ? 'selected' : ''; ?>><?php echo $ls->deskripsi ?></option>
                                  <?php } ?>
                                </select>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Kategori</label>
                              <div class="col-md-12">
                                <select class="form-control" name="pop_kategori" id="pop_kategori" style="font-size: 12px;">
                                  <?php 
                                  foreach ($list_kategori as $lk){?>
                                  <option value="<?php echo $lk->id ?>" <?php echo $lk->nama == $data->kategori ? 'selected' : ''; ?>><?php echo $lk->nama ?></option>
                                  <?php } ?>
                                </select>
                              </div>
                            </div>
                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Harga Asli (Rp)</label>
                              <div class="col-md-12">
                                <input id="pop_harga" name="pop_harga" type="text" value="<?php echo number_format($data->harga) ?>" placeholder="Rp. 100,000" class="form-control numberOnly" maxlength="10" >
                              </div>
                            </div>

                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Harga Jual (Rp)</label>
                              <div class="col-md-12">
                                <input id="pop_harga_jual" name="pop_harga_jual" type="text" value="<?php echo number_format($data->harga_jual) ?>" placeholder="Rp. 100,000" class="form-control numberOnly" maxlength="10" >
                              </div>
                            </div>

                            <div class="form-group">
                              <label class="col-md-4 control-label label-produk">Foto Produk</label>
                              <div class="col-md-12">
                                <?php if ($data->foto != '-'){ ?>
                                <img style="width:100px;" id="blah" src="<?php echo base_url().'img/produk/'.$data->foto ?>" alt="your image" /><br><br>
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
